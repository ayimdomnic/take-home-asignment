import { render, screen, fireEvent } from "@testing-library/react"
import { FilePreview } from "@/components/file-preview"
import { describe, test, expect } from '@jest/globals';

describe("FilePreview", () => {
  const mockPdfFile = {
    id: "file-1",
    name: "test-document.pdf",
    type: "application/pdf",
    size: 1024000,
    url: "https://example.com/test-document.pdf",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }

  const mockImageFile = {
    id: "file-2",
    name: "test-image.jpg",
    type: "image/jpeg",
    size: 512000,
    url: "https://example.com/test-image.jpg",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }

  const mockVideoFile = {
    id: "file-3",
    name: "test-video.mp4",
    type: "video/mp4",
    size: 5120000,
    url: "https://example.com/test-video.mp4",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }

  const mockAudioFile = {
    id: "file-4",
    name: "test-audio.mp3",
    type: "audio/mpeg",
    size: 3072000,
    url: "https://example.com/test-audio.mp3",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }

  const mockUnsupportedFile = {
    id: "file-5",
    name: "test-file.xyz",
    type: "application/octet-stream",
    size: 1024,
    url: "https://example.com/test-file.xyz",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }

  const mockProps = {
    isOpen: true,
    onClose: jest.fn(),
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  test("renders PDF preview correctly", () => {
    render(<FilePreview file={mockPdfFile} {...mockProps} />)

    expect(screen.getByText(mockPdfFile.name)).toBeInTheDocument()
    expect(screen.getByText("Preview")).toBeInTheDocument()
    expect(screen.getByText("Details")).toBeInTheDocument()

    // Check for iframe for PDF preview
    const iframe = screen.getByTitle(mockPdfFile.name)
    expect(iframe).toBeInTheDocument()
    expect(iframe.tagName).toBe("IFRAME")
    expect(iframe).toHaveAttribute("src", expect.stringContaining(mockPdfFile.url))
  })

  test("renders image preview correctly", () => {
    render(<FilePreview file={mockImageFile} {...mockProps} />)

    expect(screen.getByText(mockImageFile.name)).toBeInTheDocument()

    // Check for image element
    const image = screen.getByAltText(mockImageFile.name)
    expect(image).toBeInTheDocument()
    expect(image.tagName).toBe("IMG")
    expect(image).toHaveAttribute("src", mockImageFile.url)
  })

  test("renders video preview correctly", () => {
    render(<FilePreview file={mockVideoFile} {...mockProps} />)

    expect(screen.getByText(mockVideoFile.name)).toBeInTheDocument()

    // Check for video element
    const video = screen.getByText("Your browser does not support the video tag.")
    expect(video.parentElement).toBeInTheDocument()
    expect(video.parentElement?.tagName).toBe("VIDEO")
    expect(video.parentElement).toHaveAttribute("src", mockVideoFile.url)
  })

  test("renders audio preview correctly", () => {
    render(<FilePreview file={mockAudioFile} {...mockProps} />)

    expect(screen.getByText(mockAudioFile.name)).toBeInTheDocument()
    expect(screen.getByText("Audio File")).toBeInTheDocument()

    // Check for audio element
    const audio = screen.getByText("Your browser does not support the audio element.")
    expect(audio.parentElement).toBeInTheDocument()
    expect(audio.parentElement?.tagName).toBe("AUDIO")
    expect(audio.parentElement).toHaveAttribute("src", mockAudioFile.url)
  })

  test("renders unsupported file type message", () => {
    render(<FilePreview file={mockUnsupportedFile} {...mockProps} />)

    expect(screen.getByText(mockUnsupportedFile.name)).toBeInTheDocument()
    expect(screen.getByText("Preview not available")).toBeInTheDocument()
    expect(
      screen.getByText("This file type cannot be previewed. Please download the file to view it."),
    ).toBeInTheDocument()
    expect(screen.getByText("Download File")).toBeInTheDocument()
  })

  test("switches between preview and details tabs", () => {
    render(<FilePreview file={mockPdfFile} {...mockProps} />)

    // Initially on preview tab
    expect(screen.getByTitle(mockPdfFile.name)).toBeInTheDocument()

    // Click details tab
    fireEvent.click(screen.getByText("Details"))

    // Should show file details
    expect(screen.getByText("Name")).toBeInTheDocument()
    expect(screen.getByText("Type")).toBeInTheDocument()
    expect(screen.getByText("Size")).toBeInTheDocument()
    expect(screen.getByText("Created")).toBeInTheDocument()
    expect(screen.getByText("Modified")).toBeInTheDocument()
    expect(screen.getByText("application/pdf")).toBeInTheDocument()
    expect(screen.getByText("1000 KB")).toBeInTheDocument()

    // Click preview tab again
    fireEvent.click(screen.getByText("Preview"))

    // Should show preview again
    expect(screen.getByTitle(mockPdfFile.name)).toBeInTheDocument()
  })

  test("closes dialog when close button is clicked", () => {
    render(<FilePreview file={mockPdfFile} {...mockProps} />)

    const closeButton = screen.getByTitle("Close")
    fireEvent.click(closeButton)

    expect(mockProps.onClose).toHaveBeenCalled()
  })

  test("toggles fullscreen mode", () => {
    render(<FilePreview file={mockPdfFile} {...mockProps} />)

    const fullscreenButton = screen.getByTitle("Toggle fullscreen")

    // Initial state
    const dialogContent = screen.getByRole("dialog")
    expect(dialogContent).not.toHaveClass("fixed inset-0 w-screen h-screen max-w-none max-h-none rounded-none")

    // Click fullscreen button
    fireEvent.click(fullscreenButton)

    // Should be in fullscreen mode
    expect(dialogContent).toHaveClass("fixed inset-0 w-screen h-screen max-w-none max-h-none rounded-none")

    // Click fullscreen button again
    fireEvent.click(fullscreenButton)

    // Should exit fullscreen mode
    expect(dialogContent).not.toHaveClass("fixed inset-0 w-screen h-screen max-w-none max-h-none rounded-none")
  })

  test("renders download button", () => {
    render(<FilePreview file={mockPdfFile} {...mockProps} />)

    const downloadButton = screen.getByText("Download")
    expect(downloadButton).toBeInTheDocument()
    expect(downloadButton.tagName).toBe("BUTTON")
  })

  test("does not render when file is null", () => {
    const { container } = render(<FilePreview file={null} {...mockProps} />)
    expect(container).toBeEmptyDOMElement()
  })
})
