import { http, HttpResponse, delay } from "msw"
import { mockFiles, mockFolders, mockSharedFiles } from "./mockData"


type FileResponse = typeof mockFiles[0]
type FolderResponse = typeof mockFolders[0]
type SharedFileResponse = typeof mockSharedFiles[0]

const successResponse = <T>(data: T) => HttpResponse.json({
  success: true,
  data
})

const notFoundResponse = (entity: string) => HttpResponse.json({
  success: false,
  error: `${entity} not found`
}, { status: 404 })


const simulateNetworkDelay = async () => {
  await delay(150)
}

export const handlers = [
  
  http.post("/api/auth/signin", async () => {
    await simulateNetworkDelay()
    return successResponse({ success: true })
  }),

  http.post("/api/auth/register", async () => {
    await simulateNetworkDelay()
    return new HttpResponse(null, { status: 201 })
  }),

  // Files endpoints
  http.get("/api/files", async ({ request }) => {
    await simulateNetworkDelay()
    const url = new URL(request.url)
    const type = url.searchParams.get("type")
    const folderId = url.searchParams.get("folderId")

    switch (type) {
      case "starred":
        return successResponse(mockFiles.filter(file => file.starred))
        
      case "recent":
        return successResponse(
          [...mockFiles]
            .sort((a, b) => 
              new Date(b.lastAccessedAt || b.updatedAt).getTime() - 
              new Date(a.lastAccessedAt || a.updatedAt).getTime()
            )
            .slice(0, 10)
        )
        
      case "trash":
        return successResponse({
          files: mockFiles.filter(file => file.trashed),
          folders: mockFolders.filter(folder => folder.trashed)
        })
        
      case "shared":
        return successResponse(mockSharedFiles)
        
      default:
        return successResponse({
          files: mockFiles.filter(file => file.folderId === folderId && !file.trashed),
          folders: mockFolders.filter(folder => folder.parentId === folderId && !folder.trashed)
        })
    }
  }),

  http.post("/api/files", async ({ request }) => {
    await simulateNetworkDelay()
    const url = new URL(request.url)
    const folderId = url.searchParams.get("folderId")
    
    const newFile: FileResponse = {
      id: crypto.randomUUID(),
      name: "uploaded-file.pdf",
      type: "application/pdf",
      size: 1024000,
      url: "https://example.com/uploaded-file.pdf",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      userId: "user-id",
      folderId: folderId || null,
      starred: false,
      trashed: false,
      lastAccessedAt: null,
    }

    return HttpResponse.json({
      success: true,
      data: newFile
    }, { status: 201 })
  }),

  http.patch("/api/files/:id/star", async ({ params, request }) => {
    await simulateNetworkDelay()
    const { id } = params
    const { starred } = await request.json() as { starred: boolean }

    return successResponse({
      id,
      starred
    })
  }),

  http.patch("/api/files/:id/trash", async ({ params }) => {
    await simulateNetworkDelay()
    const { id } = params

    return successResponse({
      id,
      trashed: true,
      trashedAt: new Date().toISOString()
    })
  }),

  http.patch("/api/files/:id/restore", async ({ params }) => {
    await simulateNetworkDelay()
    const { id } = params

    return successResponse({
      id,
      trashed: false,
      trashedAt: null
    })
  }),

  http.post("/api/files/:id/share", async ({ params, request }) => {
    await simulateNetworkDelay()
    const { id } = params
    const { email, permission } = await request.json() as { 
      email: string; permission: string 
    }

    return successResponse({
      id: "share-id",
      fileId: id,
      userId: "user-id",
      permission,
      createdAt: new Date().toISOString()
    })
  }),

  http.get("/api/files/:id/shares", async ({ params }) => {
    await simulateNetworkDelay()
    const { id } = params

    return successResponse([{
      id: "share-1",
      fileId: id,
      userId: "user-2",
      permission: "VIEW",
      createdAt: new Date().toISOString(),
      user: {
        id: "user-2",
        name: "Jane Doe",
        email: "jane@example.com",
        image: null
      }
    }])
  }),

  http.delete("/api/files/:id/shares/:shareId", async () => {
    await simulateNetworkDelay()
    return new HttpResponse(null, { status: 204 })
  }),

  // Folders endpoints
  http.get("/api/folders", async () => {
    await simulateNetworkDelay()
    return successResponse({
      folders: mockFolders.filter(folder => !folder.trashed)
    })
  }),

  http.post("/api/folders", async ({ request }) => {
    await simulateNetworkDelay()
    const { name, parentId } = await request.json() as { 
      name: string; parentId?: string 
    }

    const newFolder: FolderResponse & { _count: { files: number; children: number } } = {
      id: crypto.randomUUID(),
      name,
      parentId: parentId || null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      userId: "user-1",
      trashed: false,
      _count: {
        files: 0,
        children: 0
      }
    }

    return HttpResponse.json({
      success: true,
      data: newFolder
    }, { status: 201 })
  }),

  http.get("/api/folders/:id", async ({ params }) => {
    await simulateNetworkDelay()
    const { id } = params
    const folder = mockFolders.find(f => f.id === id)

    if (!folder) {
      return notFoundResponse("Folder")
    }

    return successResponse(folder)
  })
]