"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useSession } from "next-auth/react"
import { Sidebar } from "@/components/sidebar"
import { FileExplorer } from "@/components/file-explorer"
import { FileUploadButton } from "@/components/file-upload-button"
import { CreateFolderButton } from "@/components/create-folder-button"
import { Breadcrumbs } from "@/components/ui/breadcrumbs"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"

export default function Dashboard() {
  const { data: session } = useSession()
  const router = useRouter()
  const searchParams = useSearchParams()

  const [isLoading, setIsLoading] = useState(true)
  const [currentFolder, setCurrentFolder] = useState<any>(null)
  const [folderPath, setFolderPath] = useState<any[]>([])
  const [files, setFiles] = useState<any[]>([])
  const [folders, setFolders] = useState<any[]>([])

  const folderId = searchParams.get("folder")

  useEffect(() => {
    if (session) {
      fetchData()
    }
  }, [session, folderId])

  async function fetchData() {
    setIsLoading(true)
    try {
      // Fetch current folder data if we're in a folder
      if (folderId) {
        const folderRes = await fetch(`/api/folders/${folderId}`)
        if (folderRes.ok) {
          const folderData = await folderRes.json()
          setCurrentFolder(folderData.data)
          await fetchFolderPath(folderData.data)
        } else {
          toast.error( "Error", {
            description: "Failed to load folder information",
          })
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
        setFiles(data.data.files || [])
        setFolders(data.data.folders || [])
      } else {
        toast.error( "Error", {
          description: "Failed to load files and folders",
        })
      }
    } catch (error) {
      console.error("Error fetching data:", error)
      toast.error("Error", {
        description: "Something went wrong while loading your files",
      })
    } finally {
      setIsLoading(false)
    }
  }

  async function fetchFolderPath(folder: any) {
    const path = []
    let current = folder

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

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar currentFolderId={folderId} />

      <div className="flex flex-col flex-1 overflow-hidden">
        <header className="border-b bg-background p-4">
          <div className="flex items-center justify-between">
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
              <Button variant="outline" size="sm" onClick={handleRefresh} disabled={isLoading}>
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Refresh"}
              </Button>
              <CreateFolderButton parentId={folderId} onSuccess={handleRefresh} />
              <FileUploadButton folderId={folderId} onSuccess={handleRefresh} />
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-auto p-6">
          {isLoading ? (
            <div className="flex h-full items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <FileExplorer
              files={files}
              folders={folders}
              onNavigate={navigateToFolder}
              onRefresh={handleRefresh}
              currentFolderId={folderId}
            />
          )}
        </main>
      </div>
    </div>
  )
}
