import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { FileExplorer } from "@/components/file-explorer"
import { toast } from "sonner"

// Type-safe mock data
const mockFile = {
  id: "file1",
  name: "test-file.pdf",
  type: "application/pdf",
  size: 1024,
  url: "https://example.com/test.pdf",
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  starred: false,
}

const mockFolder = {
  id: "folder1",
  name: "Test Folder",
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  _count: { files: 2, children: 1 },
}

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

describe("FileExplorer", () => {
  const mockProps = {
    files: [mockFile],
    folders: [mockFolder],
    onNavigate: jest.fn(),
    onRefresh: jest.fn(),
    currentFolderId: null,
    viewMode: "grid" as const,
  }

  beforeEach(() => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ success: true }),
      })
    ) as jest.Mock

    jest.clearAllMocks()
  })

  test("renders files and folders correctly in grid view", () => {
    render(<FileExplorer {...mockProps} />)

    expect(
      screen.getByRole("heading", { name: "Test Folder" })
    ).toBeInTheDocument()
    expect(screen.getByText("2 files, 1 folders")).toBeInTheDocument()
    expect(
      screen.getByRole("link", { name: "test-file.pdf" })
    ).toBeInTheDocument()
    expect(screen.getByText("1 KB")).toBeInTheDocument()
  })

  test("navigates to folder when clicked", async () => {
    const user = userEvent.setup()
    render(<FileExplorer {...mockProps} />)

    await user.click(screen.getByRole("button", { name: /Test Folder/i }))
    expect(mockProps.onNavigate).toHaveBeenCalledWith("folder1")
  })

  test("shows empty state when no files or folders", () => {
    render(
      <FileExplorer
        {...mockProps}
        files={[]}
        folders={[]}
      />
    )

    expect(
      screen.getByRole("heading", { name: /No files or folders/i })
    ).toBeInTheDocument()
    expect(
      screen.getByText(/Upload files or create folders to get started/i)
    ).toBeInTheDocument()
  })

  test("toggles star status when star action is clicked", async () => {
    const user = userEvent.setup()
    render(<FileExplorer {...mockProps} />)

    // Using proper aria attributes to find the menu button
    const menuButton = screen.getByRole("button", { name: /more actions/i })
    await user.click(menuButton)

    const starOption = await screen.findByRole("menuitem", {
      name: /Add to starred/i,
    })
    await user.click(starOption)

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        "/api/files/file1/star",
        expect.objectContaining({
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ starred: true }),
        })
      )
    })

    expect(mockProps.onRefresh).toHaveBeenCalled()
  })

  test("handles API errors gracefully", async () => {
    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      json: () => Promise.resolve({ error: "Failed to star file" }),
    })

    const user = userEvent.setup()
    render(<FileExplorer {...mockProps} />)

    await user.click(screen.getByRole("button", { name: /more actions/i }))
    await user.click(
      await screen.findByRole("menuitem", { name: /Add to starred/i })
    )

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("Failed to star file")
    })
  })
})