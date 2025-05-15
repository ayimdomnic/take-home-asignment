import { authOptions, prisma, API_ERRORS, ApiError } from "@/lib"
import { getServerSession } from "next-auth"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
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
    const { starred } = await request.json()

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

    // Update star status
    const updatedFile = await prisma.file.update({
      where: {
        id: fileId,
      },
      data: {
        starred: Boolean(starred),
      },
    })

    return NextResponse.json({ success: true, data: updatedFile }, { status: 200 })
  } catch (error) {
    if (error instanceof ApiError) {
      return NextResponse.json({ success: false, error: error.message, code: error.code }, { status: error.statusCode })
    }

    console.error("File star error:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}
