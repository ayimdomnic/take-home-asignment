import { authOptions, prisma, API_ERRORS, ApiError } from "@/lib"
import { getServerSession } from "next-auth"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      throw new ApiError(
        API_ERRORS.UNAUTHORIZED.message,
        API_ERRORS.UNAUTHORIZED.statusCode,
        API_ERRORS.UNAUTHORIZED.code,
      )
    }

    const fileId = (await params).id

    // Validate file exists and belongs to user
    const file = await prisma.file.findFirst({
      where: {
        id: fileId,
        userId: session.user.id,
        trashed: false,
      },
    })

    if (!file) {
      throw new ApiError("File not found", 404, "FILE_001")
    }

    // Get all shares for this file
    const shares = await prisma.fileShare.findMany({
      where: {
        fileId: fileId,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
      },
    })

    return NextResponse.json({ success: true, data: shares }, { status: 200 })
  } catch (error) {
    if (error instanceof ApiError) {
      return NextResponse.json({ success: false, error: error.message, code: error.code }, { status: error.statusCode })
    }

    console.error("Get shares error:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}
