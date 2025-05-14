"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useSession } from "next-auth/react"
import { Sidebar } from "@/components/sidebar"
import { FileExplorer } from "@/components/file-explorer"
import { FileUploadButton } from "@/components/file-upload-button"
import { CreateFolderButton } from "@/components/create-folder-button"
import { Breadcrumbs } from "@/components/ui/breadcrumbs"
import { Button } from "@/components/ui/button"
import { Loader2, Search, Grid3X3, List, SlidersHorizontal } from 'lucide-react'
import { Input } from "@/components/ui/input"
import { SkeletonLoader } from "@/components/skeleton-loader"
import { useIsMobile } from "@/hooks/use-mobile"
import { toast } from "sonner"

export default function Dashboard() {
  const { data: session } = useSession()
  const router = useRouter()
  const searchParams = useSearchParams()
  const isMobile = useIsMobile()

  const [isLoading, setIsLoading] = useState(true)
  const [currentFolder, setCurrentFolder] = useState<any>(null)
  const [folderPath, setFolderPath] = useState<any[]>([])
  const [files, setFiles] = useState<any[]>([])
  const [folders, setFolders] = useState<any[]>([])
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [searchQuery, setSearchQuery] = useState("")
  const [isSidebarOpen, setIsSidebarOpen] = useState(!isMobile)
  const [error, setError] = useState<string | null>(null)

  const folderId = searchParams.get("folder")

  const fetchData = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      // Fetch current folder data if we're in a folder
      if (folderId) {
        const folderRes = await fetch(`/api/folders/${folderId}`)
        if (folderRes.ok) {
          const folderData = await folderRes.json()
          setCurrentFolder(folderData.data)
          await fetchFolderPath(folderData.data)
        } else {
          const errorData = await folderRes.json()
          console.error("Failed to load folder information:", errorData)
          toast.error("Failed to load folder information")
        }
      } else {
        setCurrentFolder(null)
        setFolderPath([])
      }

      // Fetch files and folders
      const url = `/api/files?${folderId ? `folderId=${folderId}` : ""}&includeFiles=true`
      const res = await fetch(url)

      if (res.ok) {
        const data = await res.json()
        console.log("Fetched data:", data)
        setFiles(data.data.files || [])
        setFolders(data.data.folders || [])
      } else {
        const errorData = await res.json()
        console.error("Failed to load files and folders:", errorData)
        toast.error("Failed to load files and folders")
      }
    } catch (error) {
      console.error("Error fetching data:", error)
      setError("Failed to load your files and folders. Please try again later.")
      toast.error("Something went wrong while loading your files")
    } finally {
      setIsLoading(false)
    }
  }, [folderId])

  useEffect(() => {
    if (session) {
      fetchData()
    }
  }, [session, fetchData])

  useEffect(() => {
    // Close sidebar on mobile by default
    setIsSidebarOpen(!isMobile)
  }, [isMobile])

  async function fetchFolderPath(folder: any) {
    if (!folder) return

    const path = []
    let current = folder

    try {
      while (current) {
        path.unshift(current)

        if (current.parentId) {
          const res = await fetch(`/api/folders/${current.parentId}`)
          if (res.ok) {
            const data = await res.json()
            current = data.data
          } else {
            break
          }
        } else {
          break
        }
      }

      setFolderPath(path)
    } catch (error) {
      console.error("Error fetching folder path:", error)
    }
  }

  function navigateToFolder(id: string | null) {
    if (id) {
      router.push(`/?folder=${id}`)
    } else {
      router.push("/")
    }
  }

  function handleRefresh() {
    fetchData()
  }

  function toggleSidebar() {
    setIsSidebarOpen(!isSidebarOpen)
  }

  // Filter files and folders based on search query
  const filteredFolders = folders.filter((folder) => folder.name.toLowerCase().includes(searchQuery.toLowerCase()))

  const filteredFiles = files.filter((file) => file.name.toLowerCase().includes(searchQuery.toLowerCase()))

  // For debugging
  console.log("Current state:", {
    isLoading,
    files: files.length,
    folders: folders.length,
    filteredFiles: filteredFiles.length,
    filteredFolders: filteredFolders.length,
    error,
  })

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar currentFolderId={folderId} isOpen={isSidebarOpen} onToggle={toggleSidebar} />

      <div className="flex flex-col flex-1 overflow-hidden">
        <header className="border-b bg-card p-3 shadow-sm">
          <div className="flex items-center">
            {/* Mobile menu button */}
            {isMobile && (
              <Button variant="ghost" size="icon" onClick={toggleSidebar} className="mr-2">
                <svg viewBox="0 0 24 24" className="h-6 w-6 text-foreground/70" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </Button>
            )}

            {/* Logo for mobile */}
            {isMobile && (
              <div className="mr-4">
                <svg viewBox="0 0 87 24" className="h-6 w-auto">
                  <path
                    d="M17.64 9.2c-.6-.24-1.08-.72-1.32-1.32-.24-.6-.36-1.32-.36-2.04 0-.72.12-1.44.36-2.04.24-.6.72-1.08 1.32-1.32.6-.24 1.32-.36 2.04-.36.72 0 1.44.12 2.04.36.6.24 1.08.72 1.32 1.32.24.6.36 1.32.36 2.04 0 .72-.12 1.44-.36 2.04-.24.6-.72 1.08-1.32 1.32-.6.24-1.32.36-2.04.36-.72 0-1.44-.12-2.04-.36zm14.4 2.4c0 .72-.12 1.44-.36 2.04-.24.6-.72 1.08-1.32 1.32-.6.24-1.32.36-2.04.36-.72 0-1.44-.12-2.04-.36-.6-.24-1.08-.72-1.32-1.32-.24-.6-.36-1.32-.36-2.04 0-.72.12-1.44.36-2.04.24-.6.72-1.08 1.32-1.32.6-.24 1.32-.36 2.04-.36.72 0 1.44.12 2.04.36.6.24 1.08.72 1.32 1.32.24.6.36 1.32.36 2.04zm-14.4 7.2c0 .72-.12 1.44-.36 2.04-.24.6-.72 1.08-1.32 1.32-.6.24-1.32.36-2.04.36-.72 0-1.44-.12-2.04-.36-.6-.24-1.08-.72-1.32-1.32-.24-.6-.36-1.32-.36-2.04 0-.72.12-1.44.36-2.04.24-.6.72-1.08 1.32-1.32.6-.24 1.32-.36 2.04-.36.72 0 1.44.12 2.04.36.6.24 1.08.72 1.32 1.32.24.6.36 1.32.36 2.04zm14.4-7.2c0 .72-.12 1.44-.36 2.04-.24.6-.72 1.08-1.32 1.32-.6.24-1.32.36-2.04.36-.72 0-1.44-.12-2.04-.36-.6-.24-1.08-.72-1.32-1.32-.24-.6-.36-1.32-.36-2.04 0-.72.12-1.44.36-2.04.24-.6.72-1.08 1.32-1.32.6-.24 1.32-.36 2.04-.36.72 0 1.44.12 2.04.36.6.24 1.08.72 1.32 1.32.24.6.36 1.32.36 2.04z"
                    fill="var(--google-blue)"
                  />
                  <path
                    d="M42.48 24h3.84v-7.68h7.68v-3.84h-7.68v-7.68h-3.84v7.68h-7.68v3.84h7.68v7.68z"
                    fill="var(--google-red)"
                  />
                  <path
                    d="M56.4 24h3.84v-7.68h7.68v-3.84h-7.68v-7.68h-3.84v7.68h-7.68v3.84h7.68v7.68z"
                    fill="var(--google-yellow)"
                  />
                  <path
                    d="M70.32 24h3.84v-7.68h7.68v-3.84h-7.68v-7.68h-3.84v7.68h-7.68v3.84h7.68v7.68z"
                    fill="var(--google-green)"
                  />
                </svg>
              </div>
            )}

            {/* Search bar */}
            <div className="relative flex-1 max-w-2xl mx-auto">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-muted-foreground" />
                </div>
                <Input
                  type="text"
                  placeholder="Search in Drive"
                  className="pl-10 h-10 w-full bg-secondary border-none"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            {/* View options */}
            <div className="ml-4 flex items-center space-x-1">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setViewMode("grid")}
                className={viewMode === "grid" ? "bg-accent text-accent-foreground" : ""}
                aria-label="Grid view"
              >
                <Grid3X3 className="h-5 w-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setViewMode("list")}
                className={viewMode === "list" ? "bg-accent text-accent-foreground" : ""}
                aria-label="List view"
              >
                <List className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon" className="hidden sm:flex" aria-label="Settings">
                <SlidersHorizontal className="h-5 w-5" />
              </Button>
            </div>
          </div>

          <div className="flex items-center justify-between mt-2">
            <Breadcrumbs
              items={[
                { name: "My Drive", id: null },
                ...folderPath.map((folder) => ({
                  name: folder.name,
                  id: folder.id,
                })),
              ]}
              onNavigate={navigateToFolder}
            />

            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleRefresh}
                disabled={isLoading}
                className="text-foreground/70"
              >
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Refresh"}
              </Button>
              <CreateFolderButton parentId={folderId} onSuccess={handleRefresh} />
              <FileUploadButton folderId={folderId} onSuccess={handleRefresh} />
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-auto p-6">
          {isLoading ? (
            <SkeletonLoader viewMode={viewMode} />
          ) : error ? (
            <div className="flex flex-col items-center justify-center h-64 text-center bg-card rounded-lg border p-8 fade-in">
              <div className="text-destructive mb-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="48"
                  height="48"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
              </div>
              <h3 className="text-lg font-medium">Error Loading Content</h3>
              <p className="text-sm text-muted-foreground mt-1">{error}</p>
              <Button onClick={handleRefresh} className="mt-4">
                Try Again
              </Button>
            </div>
          ) : (
            <FileExplorer
              files={filteredFiles}
              folders={filteredFolders}
              onNavigate={navigateToFolder}
              onRefresh={handleRefresh}
              currentFolderId={folderId}
              viewMode={viewMode}
            />
          )}
        </main>
      </div>
    </div>
  )
}
