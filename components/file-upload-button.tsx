"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Upload } from "lucide-react"
import { toast } from "sonner"
import { Progress } from "@/components/ui/progress"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

interface FileUploadButtonProps {
  folderId: string | null
  onSuccess: () => void
}

export function FileUploadButton({ folderId, onSuccess }: FileUploadButtonProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [showProgress, setShowProgress] = useState(false)

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files
    if (!files || files.length === 0) return

    setIsUploading(true)
    setShowProgress(true)
    setUploadProgress(0)

    try {
      // Upload each file
      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        const formData = new FormData()
        formData.append("file", file)

        // Create metadata
        const metadata = {
          name: file.name,
          type: file.type,
          size: file.size,
          folderId: folderId,
        }

        formData.append("metadata", JSON.stringify(metadata))

        // Simulate progress for better UX
        const progressInterval = setInterval(() => {
          setUploadProgress((prev) => {
            const increment = Math.random() * 10
            const newProgress = prev + increment
            return newProgress > 95 ? 95 : newProgress
          })
        }, 300)

        // Upload file
        const response = await fetch("/api/files", {
          method: "POST",
          body: formData,
        })

        clearInterval(progressInterval)

        if (!response.ok) {
          const error = await response.json()
          throw new Error(error.error || "Failed to upload file")
        }

        // Set progress to 100% for this file
        setUploadProgress(100)
      }

      toast.success("Success", {
        description: files.length > 1 ? `${files.length} files uploaded successfully` : "File uploaded successfully",
      })

      onSuccess()

      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    } catch (error: any) {
      toast.error( "Error", {
        description: error.message || "Failed to upload file",
      })
    } finally {
      setIsUploading(false)
      // Hide progress after a delay
      setTimeout(() => {
        setShowProgress(false)
        setUploadProgress(0)
      }, 1000)
    }
  }

  function handleClick() {
    if (fileInputRef.current) {
      fileInputRef.current.click()
    }
  }

  return (
    <>
      <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" multiple />
      <Button onClick={handleClick} disabled={isUploading} size="sm">
        <Upload className="mr-2 h-4 w-4" />
        Upload
      </Button>

      <Dialog open={showProgress} onOpenChange={setShowProgress}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Uploading File</DialogTitle>
          </DialogHeader>
          <div className="py-6">
            <Progress value={uploadProgress} className="h-2" />
            <p className="mt-2 text-sm text-center text-muted-foreground">
              {uploadProgress < 100 ? "Uploading..." : "Upload complete!"}
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
