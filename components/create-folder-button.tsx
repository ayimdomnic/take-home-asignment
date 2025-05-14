"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { FolderPlus } from "lucide-react"
import { toast } from "sonner"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface CreateFolderButtonProps {
    parentId: string | null
    onSuccess: () => void
}

export function CreateFolderButton({ parentId, onSuccess }: CreateFolderButtonProps) {

    const [isOpen, setIsOpen] = useState(false)
    const [folderName, setFolderName] = useState("")
    const [isCreating, setIsCreating] = useState(false)

    async function handleCreateFolder() {
        if (!folderName.trim()) {
            toast.error(
                "Error", {
                description: "Folder name cannot be empty"
            })
            return
        }

        setIsCreating(true)

        try {
            const response = await fetch("/api/folders", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    name: folderName,
                    parentId: parentId,
                }),
            })

            if (!response.ok) {
                const error = await response.json()
                throw new Error(error.error || "Failed to create folder")
            }

            toast.success(
                "Success", {
                description: "Folder created successfully",
            })

            setFolderName("")
            setIsOpen(false)
            onSuccess()
        } catch (error: any) {
            toast( "Error", {
                description: error.message || "Failed to create folder"
            })
        } finally {
            setIsCreating(false)
        }
    }

    return (
        <>
            <Button variant="outline" size="sm" onClick={() => setIsOpen(true)}>
                <FolderPlus className="mr-2 h-4 w-4" />
                New Folder
            </Button>

            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Create New Folder</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-2">
                        <div className="space-y-2">
                            <Label htmlFor="folderName">Folder Name</Label>
                            <Input
                                id="folderName"
                                value={folderName}
                                onChange={(e) => setFolderName(e.target.value)}
                                placeholder="Enter folder name"
                                onKeyDown={(e) => {
                                    if (e.key === "Enter") {
                                        handleCreateFolder()
                                    }
                                }}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsOpen(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleCreateFolder} disabled={isCreating}>
                            {isCreating ? "Creating..." : "Create"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    )
}
