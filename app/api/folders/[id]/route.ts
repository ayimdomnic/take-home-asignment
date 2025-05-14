import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions, ApiError, prisma, API_ERRORS } from '@/lib';
import { validate } from '@/lib/validations';

type RouteParams = {
  params: Promise<{ id: string }>;
};

export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const id = (await params).id
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      throw new ApiError(
        API_ERRORS.UNAUTHORIZED.message,
        API_ERRORS.UNAUTHORIZED.statusCode,
        API_ERRORS.UNAUTHORIZED.code
      );
    }

    validate('cuid', id);

    const folder = await prisma.folder.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
      select: {
        id: true,
        name: true,
        parentId: true,
        createdAt: true,
        updatedAt: true,
        parent: {
          select: {
            id: true,
            name: true,
          },
        },
        _count: {
          select: {
            children: true,
            files: true,
          },
        },
      },
    });

    if (!folder) {
      throw new ApiError(
        API_ERRORS.NOT_FOUND.message,
        API_ERRORS.NOT_FOUND.statusCode,
        API_ERRORS.NOT_FOUND.code
      );
    }

    return NextResponse.json(
      { success: true, data: folder },
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

    console.error('Folder fetch error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Internal server error' 
      },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const session = await getServerSession(authOptions);
    const id = await (await params).id
    if (!session?.user?.id) {
      throw new ApiError(
        API_ERRORS.UNAUTHORIZED.message,
        API_ERRORS.UNAUTHORIZED.statusCode,
        API_ERRORS.UNAUTHORIZED.code
      );
    }

    validate('cuid', id);

    const body = await request.json();
    const updateData = validate('updateFolder', {
      ...body,
      id: id,
    });

    // Verify folder exists and belongs to user
    const existingFolder = await prisma.folder.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
    });

    if (!existingFolder) {
      throw new ApiError(
        API_ERRORS.NOT_FOUND.message,
        API_ERRORS.NOT_FOUND.statusCode,
        API_ERRORS.NOT_FOUND.code
      );
    }

    // Verify new parent exists and belongs to user if changing parent
    if (updateData.parentId !== undefined) {
      if (updateData.parentId === null) {
        // Allow setting to null (root folder)
      } else {
        // Prevent circular references
        if (updateData.parentId === id) {
          throw new ApiError(
            'Folder cannot be its own parent',
            400,
            'FOLDER_003'
          );
        }

        const parentFolder = await prisma.folder.findFirst({
          where: {
            id: updateData.parentId,
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
    }

    const updatedFolder = await prisma.folder.update({
      where: { id },
      data: {
        name: updateData.name,
        parentId: updateData.parentId,
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
      { success: true, data: updatedFolder },
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

    console.error('Folder update error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Internal server error' 
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const id = (await params).id
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      throw new ApiError(
        API_ERRORS.UNAUTHORIZED.message,
        API_ERRORS.UNAUTHORIZED.statusCode,
        API_ERRORS.UNAUTHORIZED.code
      );
    }

    validate('cuid', id);

    // Verify folder exists and belongs to user
    const folder = await prisma.folder.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
      include: {
        _count: {
          select: {
            children: true,
            files: true,
          },
        },
      },
    });

    if (!folder) {
      throw new ApiError(
        API_ERRORS.NOT_FOUND.message,
        API_ERRORS.NOT_FOUND.statusCode,
        API_ERRORS.NOT_FOUND.code
      );
    }

    // Prevent deletion of non-empty folders
    if (folder._count.children > 0 || folder._count.files > 0) {
      throw new ApiError(
        'Folder is not empty',
        400,
        'FOLDER_004'
      );
    }

    await prisma.folder.delete({
      where: { id },
    });

    return new NextResponse(null, { status: 204 });
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

    console.error('Folder deletion error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Internal server error' 
      },
      { status: 500 }
    );
  }
}