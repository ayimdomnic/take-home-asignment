"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Download, ExternalLink, X } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"

interface FilePreviewProps {
  file: any
  isOpen: boolean
  onClose: () => void
}

export function FilePreview({ file, isOpen, onClose }: FilePreviewProps) {
  const [activeTab, setActiveTab] = useState<string>("preview")
  const [isFullscreen, setIsFullscreen] = useState(false)

  // Reset state when file changes
  useEffect(() => {
    setActiveTab("preview")
    setIsFullscreen(false)
  }, [file])

  if (!file) return null

  const fileType = file.type?.split("/")[0] || "unknown"
  const fileExtension = file.name?.split(".").pop()?.toLowerCase() || ""

  // Determine if we can preview this file type
  const canPreview =
    fileType === "image" ||
    fileType === "video" ||
    fileType === "audio" ||
    fileExtension === "pdf" ||
    ["doc", "docx", "xls", "xlsx", "ppt", "pptx"].includes(fileExtension)

  // Handle fullscreen toggle
  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen)
  }

  // Render preview based on file type
  const renderPreview = () => {
    switch (fileType) {
      case "image":
        return (
          <div className="flex items-center justify-center h-full">
            <img
              src={file.url || "/placeholder.svg"}
              alt={file.name}
              className="max-w-full max-h-full object-contain"
            />
          </div>
        )
      case "video":
        return (
          <div className="flex items-center justify-center h-full">
            <video src={file.url} controls className="max-w-full max-h-full" autoPlay={false}>
              Your browser does not support the video tag.
            </video>
          </div>
        )
      case "audio":
        return (
          <div className="flex flex-col items-center justify-center h-full p-8">
            <div className="w-full max-w-md bg-card rounded-lg p-6 shadow-lg">
              <div className="mb-6 text-center">
                <h3 className="text-lg font-medium truncate">{file.name}</h3>
                <p className="text-sm text-muted-foreground">Audio File</p>
              </div>
              <audio src={file.url} controls className="w-full" autoPlay={false}>
                Your browser does not support the audio element.
              </audio>
            </div>
          </div>
        )
      case "application":
        if (fileExtension === "pdf") {
          return (
            <div className="h-full w-full">
              <iframe src={`${file.url}#toolbar=0&navpanes=0`} className="w-full h-full border-0" title={file.name}>
                This browser does not support PDFs. Please download the PDF to view it.
              </iframe>
            </div>
          )
        } else if (["doc", "docx", "xls", "xlsx", "ppt", "pptx"].includes(fileExtension)) {
          // Use Google Docs Viewer for Office documents
          const googleViewerUrl = `https://docs.google.com/viewer?url=${encodeURIComponent(file.url)}&embedded=true`
          return (
            <div className="h-full w-full">
              <iframe src={googleViewerUrl} className="w-full h-full border-0" title={file.name}>
                Unable to preview this document. Please download to view.
              </iframe>
            </div>
          )
        }
      // Fall through to default for other application types
      default:
        return (
          <div className="flex flex-col items-center justify-center h-full p-8 text-center">
            <div className="w-16 h-16 mb-4 text-muted-foreground">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <polyline points="14 2 14 8 20 8"></polyline>
                <line x1="16" y1="13" x2="8" y2="13"></line>
                <line x1="16" y1="17" x2="8" y2="17"></line>
                <polyline points="10 9 9 9 8 9"></polyline>
              </svg>
            </div>
            <h3 className="text-lg font-medium">Preview not available</h3>
            <p className="text-sm text-muted-foreground mt-2 mb-6">
              This file type cannot be previewed. Please download the file to view it.
            </p>
            <Button onClick={() => window.open(file.url, "_blank")}>
              <Download className="mr-2 h-4 w-4" />
              Download File
            </Button>
          </div>
        )
    }
  }

  // Render file details
  const renderDetails = () => {
    return (
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <div>
              <h4 className="text-sm font-medium text-muted-foreground">Name</h4>
              <p className="text-sm font-medium">{file.name}</p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-muted-foreground">Type</h4>
              <p className="text-sm font-medium">{file.type || "Unknown"}</p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-muted-foreground">Size</h4>
              <p className="text-sm font-medium">{formatFileSize(file.size)}</p>
            </div>
          </div>
          <div className="space-y-3">
            <div>
              <h4 className="text-sm font-medium text-muted-foreground">Created</h4>
              <p className="text-sm font-medium">{new Date(file.createdAt).toLocaleString()}</p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-muted-foreground">Modified</h4>
              <p className="text-sm font-medium">{new Date(file.updatedAt || file.createdAt).toLocaleString()}</p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-muted-foreground">Location</h4>
              <p className="text-sm font-medium">{file.folderName || "My Drive"}</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Format file size
  function formatFileSize(bytes: number) {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className={cn(
          "max-w-4xl p-0 overflow-hidden transition-all duration-300",
          isFullscreen && "fixed inset-0 w-screen h-screen max-w-none max-h-none rounded-none",
        )}
      >
        <DialogHeader className="p-4 border-b flex flex-row items-center justify-between">
          <DialogTitle className="truncate pr-8">{file.name}</DialogTitle>
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="icon" onClick={toggleFullscreen} title="Toggle fullscreen">
              <ExternalLink className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={onClose} title="Close">
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="border-b px-4">
            <TabsList className="bg-transparent border-b-0">
              <TabsTrigger value="preview">Preview</TabsTrigger>
              <TabsTrigger value="details">Details</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent
            value="preview"
            className={cn(
              "mt-0 focus-visible:outline-none focus-visible:ring-0",
              isFullscreen ? "h-[calc(100vh-8rem)]" : "h-[60vh]",
            )}
          >
            {renderPreview()}
          </TabsContent>

          <TabsContent value="details" className="mt-0 focus-visible:outline-none focus-visible:ring-0">
            {renderDetails()}
          </TabsContent>
        </Tabs>

        <div className="p-4 border-t flex justify-end">
          <Button onClick={() => window.open(file.url, "_blank")}>
            <Download className="mr-2 h-4 w-4" />
            Download
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
