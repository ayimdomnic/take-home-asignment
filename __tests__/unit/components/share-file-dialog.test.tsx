import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import { ShareFileDialog } from "@/components/share-file-dialog"
import { toast } from "sonner"
import { describe, test, expect } from '@jest/globals';

// Mock dependencies
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
    json: () =>
      Promise.resolve({
        success: true,
        data: [
          {
            id: "share-1",
            fileId: "file-1",
            userId: "user-2",
            permission: "VIEW",
            createdAt: new Date().toISOString(),
            user: {
              id: "user-2",
              name: "Jane Doe",
              email: "jane@example.com",
              image: null,
            },
          },
        ],
      }),
  }),
) as jest.Mock

describe("ShareFileDialog", () => {
  const mockFile = {
    id: "file-1",
    name: "test-file.pdf",
    type: "application/pdf",
    size: 1024,
    url: "https://example.com/test.pdf",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }

  const mockProps = {
    file: mockFile,
    isOpen: true,
    onClose: jest.fn(),
    onSuccess: jest.fn(),
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  test("renders the dialog with file name", () => {
    render(<ShareFileDialog {...mockProps} />)

    expect(screen.getByText(`Share "test-file.pdf"`)).toBeInTheDocument()
    expect(screen.getByPlaceholderText("Enter email address")).toBeInTheDocument()
    expect(screen.getByRole("button", { name: /Share/i })).toBeInTheDocument()
  })

  test("fetches shared users when dialog opens", async () => {
    render(<ShareFileDialog {...mockProps} />)

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith("/api/files/file-1/shares")
    })
  })

  test("displays shared users", async () => {
    render(<ShareFileDialog {...mockProps} />)

    await waitFor(() => {
      expect(screen.getByText("Jane Doe")).toBeInTheDocument()
      expect(screen.getByText("Can view")).toBeInTheDocument()
    })
  })

  test("shares file when form is submitted", async () => {
    render(<ShareFileDialog {...mockProps} />)

    // Setup mock for share API call
    ;(global.fetch as jest.Mock).mockImplementationOnce(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ success: true }),
      }),
    )

    // Fill form
    const emailInput = screen.getByPlaceholderText("Enter email address")
    fireEvent.change(emailInput, { target: { value: "test@example.com" } })

    // Submit form
    const shareButton = screen.getByRole("button", { name: /Share/i })
    fireEvent.click(shareButton)

    // Verify API call
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        "/api/files/file-1/share",
        expect.objectContaining({
          method: "POST",
          body: expect.stringContaining("test@example.com"),
        }),
      )
    })

    // Verify toast and refresh
    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith("File shared successfully")
      expect(mockProps.onSuccess).toHaveBeenCalled()
    })
  })

  test("shows error when share fails", async () => {
    render(<ShareFileDialog {...mockProps} />)

    // Setup mock for failed share API call
    ;(global.fetch as jest.Mock).mockImplementationOnce(() =>
      Promise.resolve({
        ok: false,
        json: () =>
          Promise.resolve({
            success: false,
            error: "User not found",
          }),
      }),
    )

    // Fill form
    const emailInput = screen.getByPlaceholderText("Enter email address")
    fireEvent.change(emailInput, { target: { value: "nonexistent@example.com" } })

    // Submit form
    const shareButton = screen.getByRole("button", { name: /Share/i })
    fireEvent.click(shareButton)

    // Verify error toast
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith(
        "Failed to share file",
        expect.objectContaining({
          description: expect.stringContaining("User not found"),
        }),
      )
    })
  })

  test("removes share when remove button is clicked", async () => {
    render(<ShareFileDialog {...mockProps} />)

    // Wait for shared users to load
    await waitFor(() => {
      expect(screen.getByText("Jane Doe")).toBeInTheDocument()
    })

    // Setup mock for remove share API call
    ;(global.fetch as jest.Mock).mockImplementationOnce(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ success: true }),
      }),
    )

    // Click remove button
    const removeButton = screen.getByRole("button", { name: "" }) // The X button has no accessible name
    fireEvent.click(removeButton)

    // Verify API call
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        "/api/files/file-1/shares/share-1",
        expect.objectContaining({
          method: "DELETE",
        }),
      )
    })

    // Verify toast and refresh
    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith("Share removed successfully")
      expect(mockProps.onSuccess).toHaveBeenCalled()
    })
  })

  test("closes dialog when close button is clicked", () => {
    render(<ShareFileDialog {...mockProps} />)

    const closeButton = screen.getByRole("button", { name: "Close" })
    fireEvent.click(closeButton)

    expect(mockProps.onClose).toHaveBeenCalled()
  })
})
