import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import { FileExplorer } from "@/components/file-explorer"
import { toast } from "sonner"
import { describe, test, expect } from '@jest/globals';

// Mock dependencies
jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: jest.fn(),
    refresh: jest.fn(),
  }),
}))

jest.mock("@/hooks/use-mobile", () => ({
  useIsMobile: () => false,
  useMobile: () => false,
}))

jest.mock("sonner", () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}))

// Mock fetch
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({ success: true }),
  }),
) as jest.Mock

describe("FileExplorer", () => {
  const mockProps = {
    files: [
      {
        id: "file1",
        name: "test-file.pdf",
        type: "application/pdf",
        size: 1024,
        url: "https://example.com/test.pdf",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        starred: false,
      },
    ],
    folders: [
      {
        id: "folder1",
        name: "Test Folder",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        _count: { files: 2, children: 1 },
      },
    ],
    onNavigate: jest.fn(),
    onRefresh: jest.fn(),
    currentFolderId: null,
    viewMode: "grid" as const,
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  test("renders files and folders correctly in grid view", () => {
    render(<FileExplorer {...mockProps} />)

    // Check if folders are rendered
    expect(screen.getByText("Test Folder")).toBeInTheDocument()
    expect(screen.getByText("2 files, 1 folders")).toBeInTheDocument()

    // Check if files are rendered
    expect(screen.getByText("test-file.pdf")).toBeInTheDocument()
    expect(screen.getByText("1 KB")).toBeInTheDocument()
  })

  test("navigates to folder when clicked", () => {
    render(<FileExplorer {...mockProps} />)

    fireEvent.click(screen.getByText("Test Folder"))
    expect(mockProps.onNavigate).toHaveBeenCalledWith("folder1")
  })

  test("shows empty state when no files or folders", () => {
    render(<FileExplorer {...mockProps} files={[]} folders={[]} />)

    expect(screen.getByText("No files or folders")).toBeInTheDocument()
    expect(screen.getByText("Upload files or create folders to get started")).toBeInTheDocument()
  })

  test("toggles star status when star action is clicked", async () => {
    render(<FileExplorer {...mockProps} />)

    // Open dropdown menu
    const moreButton = screen.getAllByRole("button")[1] // The more options button
    fireEvent.click(moreButton)

    // Click star option (this is a simplified test, in reality you'd need to find the specific menu item)
    const starOption = await screen.findByText(/Add to starred/)
    fireEvent.click(starOption)

    // Verify API call
    expect(global.fetch).toHaveBeenCalledWith(
      "/api/files/file1/star",
      expect.objectContaining({
        method: "POST",
        body: expect.stringContaining("starred"),
      }),
    )

    // Verify refresh was called
    await waitFor(() => {
      expect(mockProps.onRefresh).toHaveBeenCalled()
    })
  })

  test("opens rename dialog and renames file", async () => {
    render(<FileExplorer {...mockProps} />)

    // Open dropdown menu
    const moreButton = screen.getAllByRole("button")[1]
    fireEvent.click(moreButton)

    // Click rename option
    const renameOption = await screen.findByText("Rename")
    fireEvent.click(renameOption)

    // Check if rename dialog is open
    expect(screen.getByText("Rename File")).toBeInTheDocument()

    // Enter new name
    const nameInput = screen.getByLabelText("Name")
    fireEvent.change(nameInput, { target: { value: "renamed-file.pdf" } })

    // Submit form
    const renameButton = screen.getByText("Rename")
    fireEvent.click(renameButton)

    // Verify API call
    expect(global.fetch).toHaveBeenCalledWith(
      "/api/files/file1",
      expect.objectContaining({
        method: "PUT",
        body: expect.stringContaining("renamed-file.pdf"),
      }),
    )

    // Verify toast and refresh
    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith("File renamed successfully")
      expect(mockProps.onRefresh).toHaveBeenCalled()
    })
  })

  test("moves file to trash", async () => {
    render(<FileExplorer {...mockProps} />)

    // Open dropdown menu
    const moreButton = screen.getAllByRole("button")[1]
    fireEvent.click(moreButton)

    // Click trash option
    const trashOption = await screen.findByText("Move to trash")
    fireEvent.click(trashOption)

    // Check if confirmation dialog is open
    expect(screen.getByText(/Are you sure you want to move/)).toBeInTheDocument()

    // Confirm trash
    const confirmButton = screen.getByText("Move to trash", { selector: "button" })
    fireEvent.click(confirmButton)

    // Verify API call
    expect(global.fetch).toHaveBeenCalledWith(
      "/api/files/file1/trash",
      expect.objectContaining({
        method: "POST",
      }),
    )

    // Verify toast and refresh
    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith("File moved to trash")
      expect(mockProps.onRefresh).toHaveBeenCalled()
    })
  })

  test("renders list view correctly when viewMode is list", () => {
    render(<FileExplorer {...mockProps} viewMode="list" />)

    // Check if table is rendered
    expect(screen.getByRole("table")).toBeInTheDocument()

    // Check if folders are rendered in table
    expect(screen.getByText("Test Folder")).toBeInTheDocument()

    // Check if files are rendered in table
    expect(screen.getByText("test-file.pdf")).toBeInTheDocument()
  })

  test("shows different empty state for different view types", () => {
    // Test for starred view
    render(<FileExplorer {...mockProps} files={[]} folders={[]} viewType="starred" />)
    expect(screen.getByText("No starred files")).toBeInTheDocument()
    expect(screen.getByText("Star files to find them quickly")).toBeInTheDocument()

    // Cleanup and test for recent view
    screen.unmount()
    render(<FileExplorer {...mockProps} files={[]} folders={[]} viewType="recent" />)
    expect(screen.getByText("No recent files")).toBeInTheDocument()
    expect(screen.getByText("Files you open will appear here")).toBeInTheDocument()

    // Cleanup and test for trash view
    screen.unmount()
    render(<FileExplorer {...mockProps} files={[]} folders={[]} viewType="trash" />)
    expect(screen.getByText("Trash is empty")).toBeInTheDocument()
    expect(screen.getByText("Items in trash will be automatically deleted after 30 days")).toBeInTheDocument()
  })
})
