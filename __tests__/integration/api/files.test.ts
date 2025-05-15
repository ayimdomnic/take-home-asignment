import { createMocks } from "node-mocks-http"
import { getServerSession } from "next-auth"
import { POST as starFile } from "@/app/api/files/[id]/star/route"
import { POST as trashFile } from "@/app/api/files/[id]/trash/route"
import { POST as restoreFile } from "@/app/api/files/[id]/restore/route"

// Mock next-auth
jest.mock("next-auth", () => ({
  getServerSession: jest.fn(),
}))

// Mock prisma
jest.mock("@/lib/prisma", () => ({
  prisma: {
    file: {
      findFirst: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    user: {
      findUnique: jest.fn(),
    },
    fileShare: {
      findFirst: jest.fn(),
      findMany: jest.fn(),
      upsert: jest.fn(),
      delete: jest.fn(),
    },
  },
}))

describe('File API Endpoints', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock authenticated session
    (getServerSession as jest.Mock).mockResolvedValue({
      user: { id: 'user-1', name: 'Test User', email: 'test@example.com' },
    });
  });

  describe('POST /api/files/[id]/star', () => {
    it('should star a file', async () => {
      const { req, res } = createMocks({
        method: 'POST',
        body: { starred: true },
      });

      const prisma = require('@/lib/prisma').prisma;
      prisma.file.findFirst.mockResolvedValue({
        id: 'file-1',
        name: 'test.pdf',
        userId: 'user-1',
        trashed: false,
      });
      
      prisma.file.update.mockResolvedValue({
        id: 'file-1',
        name: 'test.pdf',
        starred: true,
      });

      await starFile(req, res, { params: { id: 'file-1' } });

      expect(prisma.file.findFirst).toHaveBeenCalledWith({
        where: {
          id: 'file-1',
          userId: 'user-1',
          trashed: false,
        },
      });

      expect(prisma.file.update).toHaveBeenCalledWith({
        where: { id: 'file-1' },
        data: { starred: true },
      });

      expect(res._getStatusCode()).toBe(200);
      expect(JSON.parse(res._getData())).toEqual({
        success: true,
        data: {
          id: 'file-1',
          name: 'test.pdf',
          starred: true,
        },
      });
    });

    it('should return 404 if file not found', async () => {
      const { req, res } = createMocks({
        method: 'POST',
        body: { starred: true },
      });

      const prisma = require('@/lib/prisma').prisma;
      prisma.file.findFirst.mockResolvedValue(null);

      await starFile(req, res, { params: { id: 'nonexistent-file' } });

      expect(res._getStatusCode()).toBe(404);
      expect(JSON.parse(res._getData())).toEqual({
        success: false,
        error: 'File not found',
        code: 'FILE_001',
      });
    });

    it('should return 401 if not authenticated', async () => {
      const { req, res } = createMocks({
        method: 'POST',
        body: { starred: true },
      });

      (getServerSession as jest.Mock).mockResolvedValue(null);

      await starFile(req, res, { params: { id: 'file-1' } });

      expect(res._getStatusCode()).toBe(401);
      expect(JSON.parse(res._getData())).toEqual({
        success: false,
        error: 'Unauthorized',
        code: 'AUTH_001',
      });
    });
  });

  describe('POST /api/files/[id]/trash', () => {
    it('should move a file to trash', async () => {
      const { req, res } = createMocks({
        method: 'POST',
      });

      const prisma = require('@/lib/prisma').prisma;
      prisma.file.findFirst.mockResolvedValue({
        id: 'file-1',
        name: 'test.pdf',
        userId: 'user-1',
        trashed: false,
      });
      
      prisma.file.update.mockResolvedValue({
        id: 'file-1',
        name: 'test.pdf',
        trashed: true,
        trashedAt: new Date(),
      });

      await trashFile(req, res, { params: { id: 'file-1' } });

      expect(prisma.file.update).toHaveBeenCalledWith({
        where: { id: 'file-1' },
        data: {
          trashed: true,
          trashedAt: expect.any(Date),
        },
      });

      expect(res._getStatusCode()).toBe(200);
      expect(JSON.parse(res._getData())).toEqual({
        success: true,
        data: {
          id: 'file-1',
          name: 'test.pdf',
          trashed: true,
          trashedAt: expect.any(String),
        },
      });
    });
  });

  describe('POST /api/files/[id]/restore', () => {
    it('should restore a file from trash', async () => {
      const { req, res } = createMocks({
        method: 'POST',
      });

      const prisma = require('@/lib/prisma').prisma;
      prisma.file.findFirst.mockResolvedValue({
        id: 'file-1',
        name: 'test.pdf',
        userId: 'user-1',
        trashed: true,
      });
      
      prisma.file.update.mockResolvedValue({
        id: 'file-1',
        name: 'test.pdf',
        trashed: false,
        trashedAt: null,
      });

      await restoreFile(req, res, { params: { id: 'file-1' } });

      expect(prisma.file.update).toHaveBeenCalledWith({
        where: { id: 'file-1' },
        data: {
          trashed: false,
          trashedAt: null,
        },
      });

      expect(res._getStatusCode()).toBe(200);
      expect(JSON.parse(res._getData())).toEqual({
        success: true,
        data: {
          id: 'file-1',
          name: 'test.pdf',
          trashed: false,
          trashedAt: null,
        },
      });
    });

    it('should return 404 if file not found in trash', async () => {
      const { req, res } = createMocks({
        method: 'POST',
      });

      const prisma = require('@/lib/prisma').prisma;
      prisma.file.findFirst.mockResolvedValue(null);

      await restoreFile(req, res, { params: { id: 'nonexistent-file' } });

      expect(res._getStatusCode()).toBe(404);
      expect(JSON.parse(res._getData())).toEqual({
        success: false,
        error: 'File not found in trash',
        code: 'FILE_002',
      });
    });
  });

  describe('POST /api/files/[id]/share', () => {
    it('should share a file with another user', async () => {
      const { req, res } = createMocks({
        method: 'POST',
        body: {
          email: 'friend@example.com',
          permission: 'VIEW',
        },
      });

      const prisma = require('@/lib/prisma').prisma;
      prisma.file.findFirst.mockResolvedValue({
        id: 'file-1',
        name: 'test.pdf',
        userId:\
