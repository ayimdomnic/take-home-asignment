// Types for our mock data
type File = {
    id: string
    name: string
    type: string
    size: number
    url: string
    createdAt: string
    updatedAt: string
    lastAccessedAt: string | null
    folderId: string | null
    userId: string
    starred: boolean
    trashed: boolean
    trashedAt?: string
  }
  
  type Folder = {
    id: string
    name: string
    parentId: string | null
    userId: string
    createdAt: string
    updatedAt: string
    trashed: boolean
    trashedAt?: string
    _count: {
      files: number
      children: number
    }
  }
  
  type SharedFile = {
    id: string
    fileId: string
    userId: string
    permission: 'VIEW' | 'EDIT'
    createdAt: string
    file: {
      id: string
      name: string
      type: string
      size: number
      url: string
      createdAt: string
      updatedAt: string
      userId: string
    }
    user: {
      id: string
      name: string
      email: string
      image: string | null
    }
  }
  
  // Helper function to generate consistent mock dates
  const mockDate = (daysAgo: number) => {
    const date = new Date()
    date.setDate(date.getDate() - daysAgo)
    return date.toISOString()
  }
  
  // Mock data
  export const mockFiles: File[] = [
    {
      id: "file-1",
      name: "Annual Report 2023.pdf",
      type: "application/pdf",
      size: 2_500_000, // 2.5MB
      url: "https://example.com/documents/annual-report-2023.pdf",
      createdAt: mockDate(30),
      updatedAt: mockDate(5),
      lastAccessedAt: mockDate(2),
      folderId: null,
      userId: "user-1",
      starred: false,
      trashed: false,
    },
    {
      id: "file-2",
      name: "Product Launch Deck.pptx",
      type: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
      size: 5_120_000, // 5.1MB
      url: "https://example.com/presentations/product-launch.pptx",
      createdAt: mockDate(25),
      updatedAt: mockDate(10),
      lastAccessedAt: mockDate(1),
      folderId: null,
      userId: "user-1",
      starred: true,
      trashed: false,
    },
    {
      id: "file-3",
      name: "Financial Q1 2023.xlsx",
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      size: 1_280_000, // 1.3MB
      url: "https://example.com/spreadsheets/financial-q1-2023.xlsx",
      createdAt: mockDate(20),
      updatedAt: mockDate(15),
      lastAccessedAt: mockDate(3),
      folderId: "folder-1",
      userId: "user-1",
      starred: false,
      trashed: false,
    },
    {
      id: "file-4",
      name: "Team Photo.jpg",
      type: "image/jpeg",
      size: 3_200_000, // 3.2MB
      url: "https://example.com/images/team-photo-2023.jpg",
      createdAt: mockDate(15),
      updatedAt: mockDate(8),
      lastAccessedAt: mockDate(0),
      folderId: "folder-2",
      userId: "user-1",
      starred: false,
      trashed: false,
    },
    {
      id: "file-5",
      name: "Old Proposal.txt",
      type: "text/plain",
      size: 12_800, // 12.8KB
      url: "https://example.com/documents/old-proposal.txt",
      createdAt: mockDate(60),
      updatedAt: mockDate(45),
      lastAccessedAt: null,
      folderId: null,
      userId: "user-1",
      starred: false,
      trashed: true,
      trashedAt: mockDate(10),
    },
    {
      id: "file-6",
      name: "User Manual.pdf",
      type: "application/pdf",
      size: 4_200_000, // 4.2MB
      url: "https://example.com/documents/user-manual.pdf",
      createdAt: mockDate(10),
      updatedAt: mockDate(3),
      lastAccessedAt: mockDate(1),
      folderId: "folder-1",
      userId: "user-1",
      starred: true,
      trashed: false,
    }
  ]
  
  export const mockFolders: Folder[] = [
    {
      id: "folder-1",
      name: "Work Documents",
      parentId: null,
      userId: "user-1",
      createdAt: mockDate(90),
      updatedAt: mockDate(7),
      trashed: false,
      _count: {
        files: 2,
        children: 1,
      },
    },
    {
      id: "folder-2",
      name: "Media",
      parentId: null,
      userId: "user-1",
      createdAt: mockDate(75),
      updatedAt: mockDate(14),
      trashed: false,
      _count: {
        files: 1,
        children: 0,
      },
    },
    {
      id: "folder-3",
      name: "Projects",
      parentId: "folder-1",
      userId: "user-1",
      createdAt: mockDate(60),
      updatedAt: mockDate(21),
      trashed: false,
      _count: {
        files: 0,
        children: 0,
      },
    },
    {
      id: "folder-4",
      name: "Archived",
      parentId: null,
      userId: "user-1",
      createdAt: mockDate(45),
      updatedAt: mockDate(10),
      trashed: true,
      trashedAt: mockDate(5),
      _count: {
        files: 0,
        children: 0,
      },
    }
  ]
  
  export const mockSharedFiles: SharedFile[] = [
    {
      id: "share-1",
      fileId: "file-1",
      userId: "user-1",
      permission: "VIEW",
      createdAt: mockDate(7),
      file: {
        ...mockFiles[0],
        userId: "user-1"
      },
      user: {
        id: "user-2",
        name: "Alex Johnson",
        email: "alex.johnson@example.com",
        image: "https://example.com/avatars/alex.jpg",
      },
    },
    {
      id: "share-2",
      fileId: "file-2",
      userId: "user-1",
      permission: "EDIT",
      createdAt: mockDate(3),
      file: {
        ...mockFiles[1],
        userId: "user-1"
      },
      user: {
        id: "user-3",
        name: "Maria Garcia",
        email: "maria.garcia@example.com",
        image: null,
      },
    }
  ]
  
  // Utility function to find a file by ID
  export const findFileById = (id: string): File | undefined => 
    mockFiles.find(file => file.id === id)
  
  // Utility function to find a folder by ID
  export const findFolderById = (id: string): Folder | undefined => 
    mockFolders.find(folder => folder.id === id)