"use client"

import { useState } from "react"
import {
  MoreVertical,
  Pencil,
  Trash2,
  FolderUp,
  FolderIcon,
  FileIcon,
  FileText,
  FileImage,
  FileVideo,
  FileAudio,
  FileArchive,
  FileCode,
  FileIcon as FilePdf,
} from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useIsMobile as useMobile } from "@/hooks/use-mobile"
import { toast } from "sonner"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { type RenameFormValues, type MoveFormValues, RenameSchema, MoveSchema } from "@/lib"
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form"

interface FileExplorerProps {
  files: any[]
  folders: any[]
  onNavigate: (id: string | null) => void
  onRefresh: () => void
  currentFolderId: string | null
  viewMode: "grid" | "list"
}

export function FileExplorer({ files, folders, onNavigate, onRefresh, currentFolderId, viewMode }: FileExplorerProps) {
  const isMobile = useMobile()
  const [isRenaming, setIsRenaming] = useState(false)
  const [isMoving, setIsMoving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [selectedItem, setSelectedItem] = useState<any>(null)
  const [itemType, setItemType] = useState<"file" | "folder">("file")
  const [availableFolders, setAvailableFolders] = useState<any[]>([])

  const renameForm = useForm<RenameFormValues>({
    resolver: zodResolver(RenameSchema),
    defaultValues: {
      name: "",
    },
  })

  const moveForm = useForm<MoveFormValues>({
    resolver: zodResolver(MoveSchema),
    defaultValues: {
      targetFolderId: null,
    },
  })

  // Function to get file type icon
  function getFileTypeIcon(type: string) {
    // Map MIME types to appropriate icons
    if (type.startsWith("image/")) {
      return <FileImage className="file-icon-image" />
    } else if (type.startsWith("video/")) {
      return <FileVideo className="file-icon-video" />
    } else if (type.startsWith("audio/")) {
      return <FileAudio className="file-icon-audio" />
    } else if (type.includes("pdf")) {
      return <FilePdf className="file-icon-pdf" />
    } else if (type.includes("document") || type.includes("word")) {
      return <FileText className="file-icon-doc" />
    } else if (type.includes("spreadsheet") || type.includes("excel")) {
      return <FileText className="file-icon-sheet" />
    } else if (type.includes("presentation") || type.includes("powerpoint")) {
      return <FileText className="file-icon-slide" />
    } else if (type.includes("zip") || type.includes("rar") || type.includes("tar") || type.includes("7z")) {
      return <FileArchive className="file-icon-archive" />
    } else if (
      type.includes("code") ||
      type.includes("json") ||
      type.includes("html") ||
      type.includes("css") ||
      type.includes("javascript")
    ) {
      return <FileCode className="file-icon-code" />
    } else {
      return <FileIcon className="file-icon-default" />
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

  // Handle rename
  async function handleRename(values: RenameFormValues) {
    try {
      const endpoint = itemType === "file" ? `/api/files/${selectedItem.id}` : `/api/folders/${selectedItem.id}`

      const response = await fetch(endpoint, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: values.name }),
      })

      if (response.ok) {
        toast.success(`${itemType === "file" ? "File" : "Folder"} renamed successfully`)
        onRefresh()
      } else {
        const error = await response.json()
        throw new Error(error.error || "Failed to rename")
      }
    } catch (error: any) {
      toast.error("Failed to rename", {
        description: error.message || "Something went wrong",
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
        toast.success(`${itemType === "file" ? "File" : "Folder"} deleted successfully`)
        onRefresh()
      } else {
        const error = await response.json()
        throw new Error(error.error || "Failed to delete")
      }
    } catch (error: any) {
      toast.error("Failed to delete", {
        description: error.message || "Something went wrong",
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
      toast.error("Failed to fetch folders", {
        description: error.message || "Something went wrong",
      })
    }
  }

  // Handle move
  async function handleMove(values: MoveFormValues) {
    try {
      const endpoint = itemType === "file" ? `/api/files/${selectedItem.id}` : `/api/folders/${selectedItem.id}`

      const response = await fetch(endpoint, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          folderId: values.targetFolderId === "root" ? null : values.targetFolderId,
          parentId: values.targetFolderId === "root" ? null : values.targetFolderId,
        }),
      })

      if (response.ok) {
        toast.success(`${itemType === "file" ? "File" : "Folder"} moved successfully`)
        onRefresh()
      } else {
        const error = await response.json()
        throw new Error(error.error || "Failed to move")
      }
    } catch (error: any) {
      toast.error("Failed to move", {
        description: error.message || "Something went wrong",
      })
    } finally {
      setIsMoving(false)
    }
  }

  // Open rename dialog
  function openRenameDialog(item: any, type: "file" | "folder") {
    setSelectedItem(item)
    setItemType(type)
    renameForm.setValue("name", item.name)
    setIsRenaming(true)
  }

  // Open move dialog
  function openMoveDialog(item: any, type: "file" | "folder") {
    setSelectedItem(item)
    setItemType(type)
    moveForm.setValue("targetFolderId", null)
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

  // Render grid view
  function renderGridView() {
    return (
      <div className="space-y-8">
        {/* Folders section */}
        {folders.length > 0 && (
          <div className="mb-8">
            <h2 className="text-base font-medium mb-4 text-foreground/80">Folders</h2>
            <div className="file-grid">
              {folders.map((folder) => (
                <div
                  key={folder.id}
                  className="group relative flex flex-col items-center p-4 rounded-lg border bg-card transition-all hover-elevation scale-in"
                >
                  <button
                    onClick={() => onNavigate(folder.id)}
                    className="flex flex-col items-center w-full"
                    aria-label={`Open folder: ${folder.name}`}
                  >
                    <FolderIcon className="h-16 w-16 text-[var(--google-yellow)] mb-2" />
                    <span className="text-sm font-medium text-center truncate w-full">{folder.name}</span>
                  </button>

                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="dropdown-menu-content">
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
            <h2 className="text-base font-medium mb-4 text-foreground/80">Files</h2>
            <div className="file-grid">
              {files.map((file) => (
                <div
                  key={file.id}
                  className="group relative flex flex-col items-center p-4 rounded-lg border bg-card transition-all hover-elevation scale-in"
                >
                  <button
                    onClick={() => handleFileClick(file)}
                    className="flex flex-col items-center w-full"
                    aria-label={`Open file: ${file.name}`}
                  >
                    <div className="h-16 w-16 flex items-center justify-center mb-2">{getFileTypeIcon(file.type)}</div>
                    <span className="text-sm font-medium text-center truncate w-full">{file.name}</span>
                  </button>

                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="dropdown-menu-content">
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
                  </div>

                  <div className="mt-2 text-xs text-muted-foreground">{formatFileSize(file.size)}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    )
  }

  // Render list view
  function renderListView() {
    return (
      <div className="space-y-8">
        {/* Folders section */}
        {folders.length > 0 && (
          <div className="mb-8">
            <h2 className="text-base font-medium mb-4 text-foreground/80">Folders</h2>
            <div className="overflow-hidden rounded-lg border bg-card">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="py-3 px-4 text-left text-sm font-medium text-foreground/70">Name</th>
                    <th className="py-3 px-4 text-left text-sm font-medium text-foreground/70 hidden sm:table-cell">
                      Items
                    </th>
                    <th className="py-3 px-4 text-left text-sm font-medium text-foreground/70">Modified</th>
                    <th className="py-3 px-4 text-right text-sm font-medium text-foreground/70">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {folders.map((folder) => (
                    <tr key={folder.id} className="border-b last:border-0 hover:bg-muted/20 transition-colors">
                      <td className="py-3 px-4">
                        <button
                          onClick={() => onNavigate(folder.id)}
                          className="flex items-center"
                          aria-label={`Open folder: ${folder.name}`}
                        >
                          <FolderIcon className="h-5 w-5 text-[var(--google-yellow)] mr-3" />
                          <span className="text-sm font-medium truncate max-w-[200px]">{folder.name}</span>
                        </button>
                      </td>
                      <td className="py-3 px-4 text-sm text-muted-foreground hidden sm:table-cell">
                        {folder._count ? (
                          <span>
                            {folder._count.files} files, {folder._count.children} folders
                          </span>
                        ) : (
                          <span>Empty folder</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-sm text-muted-foreground">
                        {formatDistanceToNow(new Date(folder.createdAt), { addSuffix: true })}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreVertical className="h-4 w-4" />
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
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Files section */}
        {files.length > 0 && (
          <div>
            <h2 className="text-base font-medium mb-4 text-foreground/80">Files</h2>
            <div className="overflow-hidden rounded-lg border bg-card">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="py-3 px-4 text-left text-sm font-medium text-foreground/70">Name</th>
                    <th className="py-3 px-4 text-left text-sm font-medium text-foreground/70 hidden md:table-cell">
                      Type
                    </th>
                    <th className="py-3 px-4 text-left text-sm font-medium text-foreground/70 hidden sm:table-cell">
                      Size
                    </th>
                    <th className="py-3 px-4 text-left text-sm font-medium text-foreground/70">Modified</th>
                    <th className="py-3 px-4 text-right text-sm font-medium text-foreground/70">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {files.map((file) => (
                    <tr key={file.id} className="border-b last:border-0 hover:bg-muted/20 transition-colors">
                      <td className="py-3 px-4">
                        <button
                          onClick={() => handleFileClick(file)}
                          className="flex items-center"
                          aria-label={`Open file: ${file.name}`}
                        >
                          <div className="h-5 w-5 mr-3">{getFileTypeIcon(file.type)}</div>
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
                              <MoreVertical className="h-4 w-4" />
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
    )
  }

  return (
    <div>
      {folders.length === 0 && files.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 text-center bg-card rounded-lg border p-8 fade-in">
          <FolderIcon className="h-16 w-16 text-muted-foreground/30 mb-4" />
          <h3 className="text-lg font-medium">No files or folders</h3>
          <p className="text-sm text-muted-foreground mt-1">Upload files or create folders to get started</p>
        </div>
      ) : (
        <div className="fade-in">{viewMode === "grid" ? renderGridView() : renderListView()}</div>
      )}

      {/* Rename Dialog */}
      <Dialog open={isRenaming} onOpenChange={setIsRenaming}>
        <DialogContent className="sm:max-w-md dialog-content">
          <DialogHeader>
            <DialogTitle>Rename {itemType === "file" ? "File" : "Folder"}</DialogTitle>
          </DialogHeader>
          <Form {...renameForm}>
            <form onSubmit={renameForm.handleSubmit(handleRename)}>
              <div className="space-y-4 py-2">
                <FormField
                  control={renameForm.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <Label htmlFor="name">Name</Label>
                      <FormControl>
                        <Input
                          {...field}
                          id="name"
                          placeholder="Enter new name"
                          className="h-10"
                          autoFocus
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault()
                              renameForm.handleSubmit(handleRename)()
                            }
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <DialogFooter className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 mt-4">
                <Button variant="outline" onClick={() => setIsRenaming(false)} type="button">
                  Cancel
                </Button>
                <Button type="submit" className="bg-primary hover:bg-primary/90">
                  Rename
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Move Dialog */}
      <Dialog open={isMoving} onOpenChange={setIsMoving}>
        <DialogContent className="sm:max-w-md dialog-content">
          <DialogHeader>
            <DialogTitle>Move {itemType === "file" ? "File" : "Folder"}</DialogTitle>
          </DialogHeader>
          <Form {...moveForm}>
            <form onSubmit={moveForm.handleSubmit(handleMove)}>
              <div className="space-y-4 py-2">
                <FormField
                  control={moveForm.control}
                  name="targetFolderId"
                  render={({ field }) => (
                    <FormItem>
                      <Label htmlFor="targetFolderId">Destination Folder</Label>
                      <Select onValueChange={field.onChange} defaultValue={field.value?.toString() || ""}>
                        <FormControl>
                          <SelectTrigger className="h-10">
                            <SelectValue placeholder="Select a folder" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="root">My Drive (Root)</SelectItem>
                          {availableFolders.map((folder) => (
                            <SelectItem key={folder.id} value={folder.id}>
                              {folder.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <DialogFooter className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 mt-4">
                <Button variant="outline" onClick={() => setIsMoving(false)} type="button">
                  Cancel
                </Button>
                <Button type="submit" className="bg-primary hover:bg-primary/90">
                  Move
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={isDeleting} onOpenChange={setIsDeleting}>
        <DialogContent className="sm:max-w-md dialog-content">
          <DialogHeader>
            <DialogTitle>Delete {itemType === "file" ? "File" : "Folder"}</DialogTitle>
          </DialogHeader>
          <div className="py-2">
            <p className="text-sm text-muted-foreground">
              Are you sure you want to delete <span className="font-medium text-foreground">{selectedItem?.name}</span>?
              {itemType === "folder" && (
                <span className="block mt-2 text-amber-600">Note: You can only delete empty folders.</span>
              )}
            </p>
          </div>
          <DialogFooter className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2">
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
