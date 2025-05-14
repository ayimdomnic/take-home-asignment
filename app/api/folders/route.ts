import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions, ApiError, prisma, API_ERRORS } from '@/lib';
import { validate } from '@/lib/validations';
import { File } from '@/app/generated/prisma';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      throw new ApiError(
        API_ERRORS.UNAUTHORIZED.message,
        API_ERRORS.UNAUTHORIZED.statusCode,
        API_ERRORS.UNAUTHORIZED.code
      );
    }

    const body = await request.json();
    const folderData = validate('createFolder', {
      ...body,
      userId: session.user.id, // Inject user ID from session
    });

    // Verify parent folder exists and belongs to user if provided
    if (folderData.parentId) {
      const parentFolder = await prisma.folder.findFirst({
        where: {
          id: folderData.parentId,
          userId: session.user.id,
        },
      });

      if (!parentFolder) {
        throw new ApiError(
          'Parent folder not found or access denied',
          404,
          'FOLDER_002'
        );
      }
    }

    const newFolder = await prisma.folder.create({
      data: {
        name: folderData.name,
        userId: session.user.id,
        parentId: folderData.parentId || null,
      },
      select: {
        id: true,
        name: true,
        parentId: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json(
      { success: true, data: newFolder },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof ApiError) {
      return NextResponse.json(
        { 
          success: false, 
          error: error.message,
          code: error.code 
        },
        { status: error.statusCode }
      );
    }

    console.error('Folder creation error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Internal server error' 
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      throw new ApiError(
        API_ERRORS.UNAUTHORIZED.message,
        API_ERRORS.UNAUTHORIZED.statusCode,
        API_ERRORS.UNAUTHORIZED.code
      );
    }

    const { searchParams } = new URL(request.url);
    const parentId = searchParams.get('parentId');
    const includeFiles = searchParams.get('includeFiles') === 'true';

    // Validate query parameters
    const query = validate('folderQuery', {
      parentId,
      includeFiles,
    });

    // Get folders
    const folders = await prisma.folder.findMany({
      where: {
        userId: session.user.id,
        parentId: query.parentId || null,
      },
      select: {
        id: true,
        name: true,
        parentId: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            children: true,
            files: true,
          },
        },
      },
      orderBy: {
        name: 'asc',
      },
    });

    // Get files if requested
    let files: Array<Pick<File, 'id' | 'name' | 'type' | 'size'| 'createdAt'>> = [];
    if (query.includeFiles) {
      files = await prisma.file.findMany({
        where: {
          userId: session.user.id,
          folderId: query.parentId || null,
        },
        select: {
          id: true,
          name: true,
          type: true,
          size: true,
          createdAt: true,
          updatedAt: true,
        },
        orderBy: {
          name: 'asc',
        },
      });
    }

    return NextResponse.json(
      { success: true, data: { folders, files } },
      { status: 200 }
    );
  } catch (error) {
    if (error instanceof ApiError) {
      return NextResponse.json(
        { 
          success: false, 
          error: error.message,
          code: error.code 
        },
        { status: error.statusCode }
      );
    }

    console.error('Folder list error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Internal server error' 
      },
      { status: 500 }
    );
  }
}