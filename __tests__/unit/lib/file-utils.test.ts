import { formatFileSize, getFileTypeIcon, canPreviewFile } from "@/lib/file-utils"
import { FileIcon, FileText, FileImage, FileVideo, FileAudio, FileArchive, FileCode } from "lucide-react"
import { describe, test, expect } from '@jest/globals';

describe("formatFileSize", () => {
  test("formats bytes correctly", () => {
    expect(formatFileSize(0)).toBe("0 Bytes")
    expect(formatFileSize(500)).toBe("500 Bytes")
    expect(formatFileSize(1023)).toBe("1023 Bytes")
  })

  test("formats kilobytes correctly", () => {
    expect(formatFileSize(1024)).toBe("1 KB")
    expect(formatFileSize(1536)).toBe("1.5 KB")
    expect(formatFileSize(10240)).toBe("10 KB")
  })

  test("formats megabytes correctly", () => {
    expect(formatFileSize(1048576)).toBe("1 MB")
    expect(formatFileSize(5242880)).toBe("5 MB")
  })

  test("formats gigabytes correctly", () => {
    expect(formatFileSize(1073741824)).toBe("1 GB")
    expect(formatFileSize(10737418240)).toBe("10 GB")
  })
})

describe("getFileTypeIcon", () => {
  test("returns correct icon for image files", () => {
    expect(getFileTypeIcon("image/jpeg")).toBe(FileImage)
    expect(getFileTypeIcon("image/png")).toBe(FileImage)
    expect(getFileTypeIcon("image/gif")).toBe(FileImage)
  })

  test("returns correct icon for video files", () => {
    expect(getFileTypeIcon("video/mp4")).toBe(FileVideo)
    expect(getFileTypeIcon("video/quicktime")).toBe(FileVideo)
    expect(getFileTypeIcon("video/webm")).toBe(FileVideo)
  })

  test("returns correct icon for audio files", () => {
    expect(getFileTypeIcon("audio/mpeg")).toBe(FileAudio)
    expect(getFileTypeIcon("audio/wav")).toBe(FileAudio)
    expect(getFileTypeIcon("audio/ogg")).toBe(FileAudio)
  })

  test("returns correct icon for PDF files", () => {
    expect(getFileTypeIcon("application/pdf")).toBe(FileIcon) // Assuming FileIcon is the default for PDF based on your test
  })

  test("returns correct icon for document files", () => {
    expect(getFileTypeIcon("application/msword")).toBe(FileText)
    expect(getFileTypeIcon("application/vnd.openxmlformats-officedocument.wordprocessingml.document")).toBe(FileText)
    expect(getFileTypeIcon("text/plain with document")).toBe(FileText) // This mime type is unusual, ensure it's correct
  })

  test("returns correct icon for spreadsheet files", () => {
    expect(getFileTypeIcon("application/vnd.ms-excel")).toBe(FileText) // Consider a specific spreadsheet icon if available
    expect(getFileTypeIcon("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")).toBe(FileText)
  })

  test("returns correct icon for presentation files", () => {
    expect(getFileTypeIcon("application/vnd.ms-powerpoint")).toBe(FileText) // Consider a specific presentation icon
    expect(getFileTypeIcon("application/vnd.openxmlformats-officedocument.presentationml.presentation")).toBe(FileText)
  })

  test("returns correct icon for archive files", () => {
    expect(getFileTypeIcon("application/zip")).toBe(FileArchive)
    expect(getFileTypeIcon("application/x-rar-compressed")).toBe(FileArchive)
    expect(getFileTypeIcon("application/x-tar")).toBe(FileArchive)
  })

  test("returns correct icon for code files", () => {
    expect(getFileTypeIcon("application/json")).toBe(FileCode)
    expect(getFileTypeIcon("text/html")).toBe(FileCode)
    expect(getFileTypeIcon("text/css")).toBe(FileCode)
    expect(getFileTypeIcon("application/javascript")).toBe(FileCode)
  })

  test("returns default icon for unknown file types", () => {
    expect(getFileTypeIcon("application/octet-stream")).toBe(FileIcon)
    expect(getFileTypeIcon("unknown/type")).toBe(FileIcon)
  })
})

describe("canPreviewFile", () => {
  test("returns true for previewable file types based on type and extension", () => {
    expect(canPreviewFile("image/jpeg", "")).toBe(true)
    expect(canPreviewFile("image/png", "png")).toBe(true)
    expect(canPreviewFile("video/mp4", "")).toBe(true)
    expect(canPreviewFile("audio/mpeg", "mp3")).toBe(true)
    expect(canPreviewFile("application/pdf", "pdf")).toBe(true)
    // Assuming canPreviewFile uses type primarily and extension as fallback or specific check
    expect(canPreviewFile("", "doc")).toBe(true)
    expect(canPreviewFile("", "docx")).toBe(true)
    expect(canPreviewFile("", "xls")).toBe(true)
    expect(canPreviewFile("", "xlsx")).toBe(true)
    expect(canPreviewFile("", "ppt")).toBe(true)
    expect(canPreviewFile("", "pptx")).toBe(true)
  })

  test("returns false for non-previewable file types", () => {
    expect(canPreviewFile("text/plain", "txt")).toBe(false) // Assuming plain text isn't previewed this way
    expect(canPreviewFile("application/zip", "zip")).toBe(false)
    expect(canPreviewFile("application/x-msdownload", "exe")).toBe(false) // Common MIME type for .exe
    expect(canPreviewFile("", "unknown")).toBe(false)
    expect(canPreviewFile("application/octet-stream", "")).toBe(false)
  })
})