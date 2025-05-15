import { authOptions, prisma, API_ERRORS, ApiError } from "@/lib"
import { getServerSession } from "next-auth"
import { type NextRequest, NextResponse } from "next/server"

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string; shareId: string }> }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      throw new ApiError(
        API_ERRORS.UNAUTHORIZED.message,
        API_ERRORS.UNAUTHORIZED.statusCode,
        API_ERRORS.UNAUTHORIZED.code,
      )
    }

    const { id: fileId, shareId } = await params

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

    // Validate share exists
    const share = await prisma.fileShare.findFirst({
      where: {
        id: shareId,
        fileId: fileId,
      },
    })

    if (!share) {
      throw new ApiError("Share not found", 404, "SHARE_001")
    }

    // Delete share
    await prisma.fileShare.delete({
      where: {
        id: shareId,
      },
    })

    return NextResponse.json({ success: true }, { status: 200 })
  } catch (error) {
    if (error instanceof ApiError) {
      return NextResponse.json({ success: false, error: error.message, code: error.code }, { status: error.statusCode })
    }

    console.error("Delete share error:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}
