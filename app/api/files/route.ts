import { File as FileModel } from "@/app/generated/prisma";
import { API_ERRORS, ApiError, authOptions, prisma, upload } from "@/lib";
import { validate } from "@/lib/validations";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            throw new ApiError(
                API_ERRORS.UNAUTHORIZED.message,
                API_ERRORS.UNAUTHORIZED.statusCode,
                API_ERRORS.UNAUTHORIZED.code
            )
        }

        const formData = await request.formData();
        const file = formData.get('file') as File;
        const metadata = formData.get('metadata') as string;

        if (!file || !metadata) {
            throw new ApiError(
                'File and metadata are required',
                400,
                'VALIDATION_002'
            )
        }

        const parsedMetadata = validate('fileUpload', {
            file,
            metadata: JSON.parse(metadata)
        });

        const { name, type, size, folderId } = parsedMetadata.metadata;
        if (folderId) {
            const folder = await prisma.folder.findFirst({
                where: {
                    id: folderId,
                    userId: session.user.id
                }
            })

            if (!folder) {
                throw new ApiError(
                    'Folder not found',
                    404,
                    "FOLDER_001"
                );
            }

            const { url, path, blobId } = await upload({
                file,
                userId: session.user.id,
                folderId
            })

            const createdFile = await prisma.file.create({
                data: {
                    name,
                    type,
                    size,
                    url,
                    storagePath: path,
                    blobId,
                    userId: session.user.id,
                    folderId: folderId
                }
            })

            return NextResponse.json(
                { success: true, data: createdFile },
                { status: 201 }
            )
        }
    } catch (error) {
        if (error instanceof ApiError) {
            return NextResponse.json(
                { success: false, error: error.message, code: error.code },
                { status: error.statusCode }
            )
        }

        return NextResponse.json(
            {
                success: false,
                error: "Internal Server Error"
            },
            { status: 500 }
        )
    }
}

export async function GET(request: Request) {
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
        const folderId = searchParams.get('folderId');
        const limit = parseInt(searchParams.get('limit') || "20")
        const includeFiles = searchParams.get('includeFiles') === 'true';
        const type = searchParams.get('type') // recent, starred, trash

        if (type === 'recent') {
            const recentFiles = await prisma.file.findMany({
                where: {
                    userId: session.user.id,
                    trashed: false,
                    lastAccessedAt: { not: null }
                },
                orderBy: {
                    lastAccessedAt: "desc",
                },
                take: limit,
                select: {
                    id: true,
                    name: true,
                    type: true,
                    size: true,
                    url: true,
                    createdAt: true,
                    updatedAt: true,
                    lastAccessedAt: true
                }
            })

            return NextResponse.json({ success: true, data: recentFiles }, { status: 200 })
        }


        if (type === 'starred') {
            const starredFiles = await prisma.file.findMany({
                where: {
                    userId: session.user.id,
                    starred: true,
                    trashed: false
                },
                orderBy: {
                    updatedAt: 'desc'
                },
                select: {
                    id: true,
                    name: true,
                    type: true,
                    size: true,
                    url: true,
                    createdAt: true,
                    updatedAt: true,
                    starred: true
                }
            });

            return NextResponse.json({ success: true, data: starredFiles }, { status: 200 });
        }

        if (type === 'shared') {
            const sharedFiles = await prisma.fileShare.findMany({
              where: {
                userId: session.user.id
              },
              include: {
                file: {
                  select: {
                    id: true,
                    name: true,
                    type: true,
                    size: true,
                    url: true,
                    createdAt: true,
                    updatedAt: true
                  }
                },
                user: {
                  select: {
                    id: true,
                    name: true,
                    email: true
                  }
                }
              },
              orderBy: {
                updatedAt: 'desc'
              }
            });
      
            return NextResponse.json({ success: true, data: sharedFiles }, { status: 200 });
        }

        // Validate query parameters
        const query = validate('folderQuery', {
            parentId: folderId,
            includeFiles
        });



        const folders = await prisma.folder.findMany({
            where: {
                userId: session.user.id,
                parentId: query.parentId || null,
            },
            orderBy: {
                createdAt: 'desc',
            },
        });

        let files: FileModel[] = [];
        if (query.includeFiles) {
            files = await prisma.file.findMany({
                where: {
                    userId: session?.user.id,
                    folderId: query.parentId || null,
                },
                orderBy: {
                    createdAt: 'desc',
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

        console.error('File list error:', error);
        return NextResponse.json(
            {
                success: false,
                error: 'Internal server error'
            },
            { status: 500 }
        );
    }
}


export async function PATCH(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (session?.user?.id) {
            throw new ApiError(API_ERRORS.UNAUTHORIZED.message, API_ERRORS.UNAUTHORIZED.statusCode, API_ERRORS.UNAUTHORIZED.code);
        }

        const { fileId, starred } = await request.json();
        const updatedFile = await prisma.file.update({
            where: {
                id: fileId,
                userId: session?.user.id

            },
            data: {
                starred
            }
        })

        return NextResponse.json({ success: true, data: updatedFile }, { status: 200 });
    } catch (error) {
        console.error('File starring error:', error);
        return NextResponse.json(
            {
                success: false,
                error: 'Internal server error'
            },
            { status: 500 }
        );
    }
}