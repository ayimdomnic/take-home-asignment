"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"
import { Loader2, X, Mail, Users } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"

interface ShareFileDialogProps {
  file: any
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export function ShareFileDialog({ file, isOpen, onClose, onSuccess }: ShareFileDialogProps) {
  const [email, setEmail] = useState("")
  const [permission, setPermission] = useState("VIEW")
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [sharedUsers, setSharedUsers] = useState<any[]>([])
  const [error, setError] = useState<string | null>(null)

  // Fetch shared users when dialog opens
  useEffect(() => {
    if (isOpen && file?.id) {
      fetchSharedUsers()
    }
  }, [isOpen, file])

  const fetchSharedUsers = async () => {
    if (!file?.id) return

    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/files/${file.id}/shares`)
      if (response.ok) {
        const data = await response.json()
        setSharedUsers(data.data || [])
      } else {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to fetch shared users")
      }
    } catch (error: any) {
      console.error("Error fetching shared users:", error)
      setError("Failed to load sharing information. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  // Reset state when dialog opens/closes
  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setEmail("")
      setPermission("VIEW")
      setError(null)
      onClose()
    }
  }

  // Handle share
  const handleShare = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!email || !file?.id) return

    setIsSubmitting(true)
    setError(null)

    try {
      const response = await fetch(`/api/files/${file.id}/share`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          permission,
        }),
      })

      if (response.ok) {
        toast.success("File shared successfully")
        setEmail("")
        fetchSharedUsers()
        onSuccess()
      } else {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to share file")
      }
    } catch (error: any) {
      setError(error.message || "Failed to share file. Please try again.")
      toast.error("Failed to share file", {
        description: error.message || "Something went wrong",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Handle remove share
  const handleRemoveShare = async (shareId: string) => {
    try {
      const response = await fetch(`/api/files/${file.id}/shares/${shareId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        toast.success("Share removed successfully")
        fetchSharedUsers()
        onSuccess()
      } else {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to remove share")
      }
    } catch (error: any) {
      toast.error("Failed to remove share", {
        description: error.message || "Something went wrong",
      })
    }
  }

  // Get initials from name
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase()
      .substring(0, 2)
  }

  if (!file) return null

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md dialog-content">
        <DialogHeader>
          <DialogTitle className="flex items-center">Share "{file.name}"</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleShare} className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="email">Share with</Label>
            <div className="flex space-x-2">
              <Input
                id="email"
                placeholder="Enter email address"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1"
                disabled={isSubmitting}
              />
              <Select value={permission} onValueChange={setPermission} disabled={isSubmitting}>
                <SelectTrigger className="w-[120px]">
                  <SelectValue placeholder="Permission" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="VIEW">Can view</SelectItem>
                  <SelectItem value="EDIT">Can edit</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {error && <p className="text-sm text-destructive mt-1">{error}</p>}
          </div>

          <Button type="submit" disabled={!email || isSubmitting} className="w-full bg-primary hover:bg-primary/90">
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sharing...
              </>
            ) : (
              <>
                <Mail className="mr-2 h-4 w-4" />
                Share
              </>
            )}
          </Button>
        </form>

        {isLoading ? (
          <div className="flex justify-center py-4">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : sharedUsers.length > 0 ? (
          <div className="mt-6">
            <h3 className="text-sm font-medium mb-2 flex items-center">
              <Users className="h-4 w-4 mr-2" />
              People with access
            </h3>
            <div className="space-y-2 max-h-[200px] overflow-y-auto pr-1">
              {sharedUsers.map((share) => (
                <div key={share.id} className="flex items-center justify-between p-2 rounded-md hover:bg-muted/50">
                  <div className="flex items-center">
                    <Avatar className="h-8 w-8 mr-2">
                      <AvatarImage src={share.user.image || ""} />
                      <AvatarFallback>
                        {share.user.name ? getInitials(share.user.name) : share.user.email[0].toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium">{share.user.name || share.user.email}</p>
                      <Badge variant={share.permission === "EDIT" ? "default" : "secondary"} className="text-xs mt-1">
                        {share.permission === "VIEW" ? "Can view" : "Can edit"}
                      </Badge>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemoveShare(share.id)}
                    className="h-8 w-8 text-muted-foreground hover:text-destructive"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="mt-6 text-center py-4 text-muted-foreground">
            <p className="text-sm">No one has access to this file yet</p>
          </div>
        )}
        <DialogFooter className="sm:justify-start">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
