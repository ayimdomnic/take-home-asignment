import { FileIcon, FileText, FileImage, FileVideo, FileAudio, FileArchive, FileCode } from "lucide-react"

/**
 * Formats a file size in bytes to a human-readable string
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes"
  const k = 1024
  const sizes = ["Bytes", "KB", "MB", "GB"]
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
}

/**
 * Returns the appropriate icon component based on file type
 */
export function getFileTypeIcon(type: string) {
  // Map MIME types to appropriate icons
  if (type.startsWith("image/")) {
    return FileImage
  } else if (type.startsWith("video/")) {
    return FileVideo
  } else if (type.startsWith("audio/")) {
    return FileAudio
  } else if (type.includes("pdf")) {
    return FileIcon
  } else if (type.includes("document") || type.includes("word")) {
    return FileText
  } else if (type.includes("spreadsheet") || type.includes("excel")) {
    return FileText
  } else if (type.includes("presentation") || type.includes("powerpoint")) {
    return FileText
  } else if (type.includes("zip") || type.includes("rar") || type.includes("tar") || type.includes("7z")) {
    return FileArchive
  } else if (
    type.includes("code") ||
    type.includes("json") ||
    type.includes("html") ||
    type.includes("css") ||
    type.includes("javascript")
  ) {
    return FileCode
  } else {
    return FileIcon
  }
}

/**
 * Determines if a file can be previewed
 */
export function canPreviewFile(fileType: string, fileExtension: string): boolean {
  return (
    fileType === "image" ||
    fileType === "video" ||
    fileType === "audio" ||
    fileExtension === "pdf" ||
    ["doc", "docx", "xls", "xlsx", "ppt", "pptx"].includes(fileExtension)
  )
}
