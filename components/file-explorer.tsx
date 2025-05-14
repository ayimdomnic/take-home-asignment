"use client"

import { useState } from "react"
import { FolderIcon, MoreHorizontalIcon, Pencil, Trash2, FolderUp } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { toast } from 'sonner'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface FileExplorerProps {
    files: any[]
    folders: any[]
    onNavigate: (id: string | null) => void
    onRefresh: () => void
    currentFolderId: string | null
}

export function FileExplorer({ files, folders, onNavigate, onRefresh, currentFolderId }: FileExplorerProps) {
    const [isRenaming, setIsRenaming] = useState(false)
    const [isMoving, setIsMoving] = useState(false)
    const [isDeleting, setIsDeleting] = useState(false)
    const [selectedItem, setSelectedItem] = useState<any>(null)
    const [itemType, setItemType] = useState<"file" | "folder">("file")
    const [newName, setNewName] = useState("")
    const [availableFolders, setAvailableFolders] = useState<any[]>([])
    const [targetFolderId, setTargetFolderId] = useState<string | null>(null)

    // Function to get file type icon
    function getFileTypeIcon(type: string) {
        // Map MIME types to appropriate icons
        if (type.startsWith("image/")) {
            return "🖼️"
        } else if (type.startsWith("video/")) {
            return "🎬"
        } else if (type.startsWith("audio/")) {
            return "🎵"
        } else if (type.includes("pdf")) {
            return "📄"
        } else if (type.includes("document") || type.includes("word")) {
            return "📝"
        } else if (type.includes("spreadsheet") || type.includes("excel")) {
            return "📊"
        } else if (type.includes("presentation") || type.includes("powerpoint")) {
            return "📽️"
        } else {
            return "📄"
        }
    }

    // Format file size
    function formatFileSize(bytes: number) {
        if (bytes === 0) return "0 Bytes"
        const k = 1024
        const sizes = ["Bytes", "KB", "MB", "GB"]
        const i = Math.floor(Math.log(bytes) / Math.log(k))
        return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
    }


    async function handleRename() {
        if (!newName.trim()) {
            toast.error("Error", {
                description: "Name cannot be empty",
            })
            return
        }

        try {
            const endpoint = itemType === "file" ? `/api/files/${selectedItem.id}` : `/api/folders/${selectedItem.id}`

            const response = await fetch(endpoint, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ name: newName }),
            })

            if (response.ok) {
                toast.success("Success", {
                    description: `${itemType === "file" ? "File" : "Folder"} renamed successfully`,
                })
                onRefresh()
            } else {
                const error = await response.json()
                throw new Error(error.error || "Failed to rename")
            }
        } catch (error: any) {
            toast.error(
                "Error", {
                description: error.message || "Failed to rename"
            })
        } finally {
            setIsRenaming(false)
        }
    }

    // Handle delete
    async function handleDelete() {
        try {
            const endpoint = itemType === "file" ? `/api/files/${selectedItem.id}` : `/api/folders/${selectedItem.id}`

            const response = await fetch(endpoint, {
                method: "DELETE",
            })

            if (response.ok) {
                toast("Success", {
                    description: `${itemType === "file" ? "File" : "Folder"} deleted successfully`,
                })
                onRefresh()
            } else {
                const error = await response.json()
                throw new Error(error.error || "Failed to delete")
            }
        } catch (error: any) {
            toast.error("Error", {
                description: error.message || "Failed to delete"
            })
        } finally {
            setIsDeleting(false)
        }
    }

    // Fetch available folders for moving
    async function fetchAvailableFolders() {
        try {
            const response = await fetch("/api/folders")
            if (response.ok) {
                const data = await response.json()
                // Filter out the current folder and the selected folder (if it's a folder)
                const filteredFolders = data.data.folders.filter((folder: any) => {
                    if (itemType === "folder" && folder.id === selectedItem.id) {
                        return false
                    }
                    return true
                })

                setAvailableFolders(filteredFolders)
            } else {
                throw new Error("Failed to fetch folders")
            }
        } catch (error: any) {
            toast.error("Error", {
                description: error.message || "Failed to fetch folders",
            })
        }
    }

    // Handle move
    async function handleMove() {
        try {
            const endpoint = itemType === "file" ? `/api/files/${selectedItem.id}` : `/api/folders/${selectedItem.id}`

            const response = await fetch(endpoint, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    folderId: targetFolderId === "root" ? null : targetFolderId,
                    parentId: targetFolderId === "root" ? null : targetFolderId,
                }),
            })

            if (response.ok) {
                toast("Success", {
                    description: `${itemType === "file" ? "File" : "Folder"} moved successfully`,
                })
                onRefresh()
            } else {
                const error = await response.json()
                throw new Error(error.error || "Failed to move")
            }
        } catch (error: any) {
            toast.error("Error", {
                description: error.message || "Failed to move",
            })
        } finally {
            setIsMoving(false)
        }
    }

    // Open rename dialog
    function openRenameDialog(item: any, type: "file" | "folder") {
        setSelectedItem(item)
        setItemType(type)
        setNewName(item.name)
        setIsRenaming(true)
    }

    // Open move dialog
    function openMoveDialog(item: any, type: "file" | "folder") {
        setSelectedItem(item)
        setItemType(type)
        setTargetFolderId(null)
        setIsMoving(true)
        fetchAvailableFolders()
    }

    // Open delete dialog
    function openDeleteDialog(item: any, type: "file" | "folder") {
        setSelectedItem(item)
        setItemType(type)
        setIsDeleting(true)
    }

    // Handle file click
    function handleFileClick(file: any) {
        // Open file in new tab
        if (file.url) {
            window.open(file.url, "_blank")
        }
    }

    return (
        <div>
            {folders.length === 0 && files.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-64 text-center">
                    <FolderIcon className="h-16 w-16 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium">No files or folders</h3>
                    <p className="text-sm text-muted-foreground mt-1">Upload files or create folders to get started</p>
                </div>
            ) : (
                <div>
                    {/* Folders section */}
                    {folders.length > 0 && (
                        <div className="mb-8">
                            <h2 className="text-lg font-semibold mb-4">Folders</h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                {folders.map((folder) => (
                                    <div
                                        key={folder.id}
                                        className="group relative flex flex-col items-center p-4 rounded-lg border bg-card transition-all hover:shadow-md"
                                    >
                                        <button onClick={() => onNavigate(folder.id)} className="flex flex-col items-center w-full">
                                            <FolderIcon className="h-16 w-16 text-amber-500 mb-2" />
                                            <span className="text-sm font-medium text-center truncate w-full">{folder.name}</span>
                                        </button>

                                        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8">
                                                        <MoreHorizontalIcon className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem onClick={() => openRenameDialog(folder, "folder")}>
                                                        <Pencil className="mr-2 h-4 w-4" />
                                                        Rename
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => openMoveDialog(folder, "folder")}>
                                                        <FolderUp className="mr-2 h-4 w-4" />
                                                        Move
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem
                                                        onClick={() => openDeleteDialog(folder, "folder")}
                                                        className="text-destructive focus:text-destructive"
                                                    >
                                                        <Trash2 className="mr-2 h-4 w-4" />
                                                        Delete
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </div>

                                        <div className="mt-2 text-xs text-muted-foreground">
                                            {folder._count ? (
                                                <span>
                                                    {folder._count.files} files, {folder._count.children} folders
                                                </span>
                                            ) : (
                                                <span>Empty folder</span>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Files section */}
                    {files.length > 0 && (
                        <div>
                            <h2 className="text-lg font-semibold mb-4">Files</h2>
                            <div className="overflow-hidden rounded-lg border bg-card">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b bg-muted/50">
                                            <th className="py-3 px-4 text-left text-sm font-medium">Name</th>
                                            <th className="py-3 px-4 text-left text-sm font-medium hidden md:table-cell">Type</th>
                                            <th className="py-3 px-4 text-left text-sm font-medium hidden sm:table-cell">Size</th>
                                            <th className="py-3 px-4 text-left text-sm font-medium">Modified</th>
                                            <th className="py-3 px-4 text-right text-sm font-medium">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {files.map((file) => (
                                            <tr key={file.id} className="border-b last:border-0 hover:bg-muted/50">
                                                <td className="py-3 px-4">
                                                    <button onClick={() => handleFileClick(file)} className="flex items-center">
                                                        <span className="mr-2 text-lg">{getFileTypeIcon(file.type)}</span>
                                                        <span className="text-sm font-medium truncate max-w-[200px]">{file.name}</span>
                                                    </button>
                                                </td>
                                                <td className="py-3 px-4 text-sm text-muted-foreground hidden md:table-cell">
                                                    {file.type.split("/")[1]?.toUpperCase() || file.type}
                                                </td>
                                                <td className="py-3 px-4 text-sm text-muted-foreground hidden sm:table-cell">
                                                    {formatFileSize(file.size)}
                                                </td>
                                                <td className="py-3 px-4 text-sm text-muted-foreground">
                                                    {formatDistanceToNow(new Date(file.createdAt), { addSuffix: true })}
                                                </td>
                                                <td className="py-3 px-4 text-right">
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button variant="ghost" size="icon" className="h-8 w-8">
                                                                <MoreHorizontalIcon className="h-4 w-4" />
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end">
                                                            <DropdownMenuItem onClick={() => openRenameDialog(file, "file")}>
                                                                <Pencil className="mr-2 h-4 w-4" />
                                                                Rename
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem onClick={() => openMoveDialog(file, "file")}>
                                                                <FolderUp className="mr-2 h-4 w-4" />
                                                                Move
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem
                                                                onClick={() => openDeleteDialog(file, "file")}
                                                                className="text-destructive focus:text-destructive"
                                                            >
                                                                <Trash2 className="mr-2 h-4 w-4" />
                                                                Delete
                                                            </DropdownMenuItem>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Rename Dialog */}
            <Dialog open={isRenaming} onOpenChange={setIsRenaming}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Rename {itemType === "file" ? "File" : "Folder"}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-2">
                        <div className="space-y-2">
                            <Label htmlFor="name">Name</Label>
                            <Input
                                id="name"
                                value={newName}
                                onChange={(e) => setNewName(e.target.value)}
                                placeholder="Enter new name"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsRenaming(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleRename}>Save</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Move Dialog */}
            <Dialog open={isMoving} onOpenChange={setIsMoving}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Move {itemType === "file" ? "File" : "Folder"}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-2">
                        <div className="space-y-2">
                            <Label htmlFor="folder">Destination Folder</Label>
                            <Select onValueChange={setTargetFolderId}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a folder" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="root">My Drive (Root)</SelectItem>
                                    {availableFolders.map((folder) => (
                                        <SelectItem key={folder.id} value={folder.id}>
                                            {folder.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsMoving(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleMove}>Move</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Dialog */}
            <Dialog open={isDeleting} onOpenChange={setIsDeleting}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete {itemType === "file" ? "File" : "Folder"}</DialogTitle>
                    </DialogHeader>
                    <div className="py-2">
                        <p>
                            Are you sure you want to delete <span className="font-medium">{selectedItem?.name}</span>?
                            {itemType === "folder" && (
                                <span className="block mt-2 text-destructive">Note: You can only delete empty folders.</span>
                            )}
                        </p>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDeleting(false)}>
                            Cancel
                        </Button>
                        <Button variant="destructive" onClick={handleDelete}>
                            Delete
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
