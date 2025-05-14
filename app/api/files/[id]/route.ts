import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions, ApiError, prisma, API_ERRORS, deleteBlob } from '@/lib';
import { validate } from '@/lib/validations';

type RouteParams = {
    params: Promise<{
        id: string;
    }>
}


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

    
    const file = await prisma.file.findFirst({
      where: {
        id: id,
        userId: session.user.id,
      },
      include: {
        folder: {
          select: {
            id: true,
            name: true
          },
        },
      },
    });

    if (!file) {
      throw new ApiError(
        API_ERRORS.NOT_FOUND.message,
        API_ERRORS.NOT_FOUND.statusCode,
        API_ERRORS.NOT_FOUND.code
      );
    }

    return NextResponse.json(
      { 
        success: true, 
        data: {
          id: file.id,
          name: file.name,
          type: file.type,
          size: file.size,
          url: file.url,
          createdAt: file.createdAt,
          updatedAt: file.updatedAt,
          folder: file.folder ? {
            id: file.folder.id,
            name: file.folder.name,
          } : null,
        }
      },
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

    console.error('File fetch error:', error);
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
    const id = (await params).id
    // Authentication check
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      throw new ApiError(
        API_ERRORS.UNAUTHORIZED.message,
        API_ERRORS.UNAUTHORIZED.statusCode,
        API_ERRORS.UNAUTHORIZED.code
      );
    }

    
    validate('cuid', id);


    const body = await request.json();
    const updateData = validate('updateFile', {
      ...body,
      id, 
    });


    const existingFile = await prisma.file.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
    });

    if (!existingFile) {
      throw new ApiError(
        API_ERRORS.NOT_FOUND.message,
        API_ERRORS.NOT_FOUND.statusCode,
        API_ERRORS.NOT_FOUND.code
      );
    }

    
    if (updateData.folderId !== undefined) {
      if (updateData.folderId === null) {
        
      } else {
        const folder = await prisma.folder.findFirst({
          where: {
            id: updateData.folderId,
            userId: session.user.id,
          },
        });

        if (!folder) {
          throw new ApiError(
            'Folder not found or access denied',
            404,
            'FOLDER_001'
          );
        }
      }
    }

  
    const updatedFile = await prisma.file.update({
      where: { id },
      data: {
        name: updateData.name,
        folderId: updateData.folderId,
      },
      include: {
        folder: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return NextResponse.json(
      { 
        success: true, 
        data: {
          id: updatedFile.id,
          name: updatedFile.name,
          type: updatedFile.type,
          size: updatedFile.size,
          url: updatedFile.url,
          folder: updatedFile.folder ? {
            id: updatedFile.folder.id,
            name: updatedFile.folder.name,
          } : null,
        }
      },
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

    console.error('File update error:', error);
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

   
    const file = await prisma.file.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
    });

    if (!file) {
      throw new ApiError(
        API_ERRORS.NOT_FOUND.message,
        API_ERRORS.NOT_FOUND.statusCode,
        API_ERRORS.NOT_FOUND.code
      );
    }

    
    await deleteBlob(file.url);

    await prisma.file.delete({
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

    console.error('File deletion error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Internal server error' 
      },
      { status: 500 }
    );
  }
}