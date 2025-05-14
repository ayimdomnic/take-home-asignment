"use client"

import type React from "react"

import { cn } from "@/lib/utils"
import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Upload, Loader2 } from "lucide-react"
import { Progress } from "@/components/ui/progress"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useIsMobile as useMobile } from "@/hooks/use-mobile"
import { toast } from "sonner"

interface FileUploadButtonProps {
  folderId: string | null
  onSuccess: () => void
}

export function FileUploadButton({ folderId, onSuccess }: FileUploadButtonProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [showProgress, setShowProgress] = useState(false)
  const [currentFile, setCurrentFile] = useState<string>("")
  const [totalFiles, setTotalFiles] = useState<number>(0)
  const [currentFileIndex, setCurrentFileIndex] = useState<number>(0)
  const isMobile = useMobile()

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files
    if (!files || files.length === 0) return

    setIsUploading(true)
    setShowProgress(true)
    setUploadProgress(0)
    setTotalFiles(files.length)
    setCurrentFileIndex(0)

    try {
      // Upload each file
      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        setCurrentFile(file.name)
        setCurrentFileIndex(i + 1)
        setUploadProgress(0)

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

        // Small delay to show 100% progress
        await new Promise((resolve) => setTimeout(resolve, 500))
      }

      toast.success(files.length > 1 ? `${files.length} files uploaded successfully` : "File uploaded successfully")

      onSuccess()

      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    } catch (error: any) {
      toast.error("Upload failed", {
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
      <Button
        onClick={handleClick}
        disabled={isUploading}
        size="sm"
        className={cn("bg-primary hover:bg-primary/90", isMobile ? "px-3" : "")}
      >
        {isUploading ? (
          <Loader2 className={cn("h-4 w-4 animate-spin", !isMobile && "mr-2")} />
        ) : (
          <Upload className={cn("h-4 w-4", !isMobile && "mr-2")} />
        )}
        {!isMobile && (isUploading ? "Uploading..." : "Upload")}
      </Button>

      <Dialog open={showProgress} onOpenChange={setShowProgress}>
        <DialogContent className="sm:max-w-md dialog-content">
          <DialogHeader>
            <DialogTitle>
              {totalFiles > 1 ? `Uploading files (${currentFileIndex}/${totalFiles})` : "Uploading file"}
            </DialogTitle>
          </DialogHeader>
          <div className="py-6">
            <p className="text-sm text-muted-foreground mb-2 truncate">{currentFile}</p>
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
