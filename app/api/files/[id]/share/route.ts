import { authOptions, prisma, API_ERRORS, ApiError } from "@/lib"
import { getServerSession } from "next-auth"
import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"

// Validation schema for share request
const shareSchema = z.object({
  email: z.string().email("Invalid email address"),
  permission: z.enum(["VIEW", "EDIT"]).default("VIEW")
})

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      throw new ApiError(
        API_ERRORS.UNAUTHORIZED.message,
        API_ERRORS.UNAUTHORIZED.statusCode,
        API_ERRORS.UNAUTHORIZED.code
      )
    }

    const fileId = (await params).id
    const body = await request.json()
    
    // Validate request body
    const validatedData = shareSchema.parse(body)

    // Validate file exists and belongs to user
    const file = await prisma.file.findFirst({
      where: {
        id: fileId,
        userId: session.user.id,
        trashed: false
      }
    })

    if (!file) {
      throw new ApiError(
        "File not found",
        404,
        "FILE_001"
      )
    }

    // Find or create user to share with
    const targetUser = await prisma.user.findUnique({
      where: {
        email: validatedData.email
      }
    })

    if (!targetUser) {
      throw new ApiError(
        "User not found",
        404,
        "USER_001"
      )
    }

    // Don't allow sharing with yourself
    if (targetUser.id === session.user.id) {
      throw new ApiError(
        "Cannot share with yourself",
        400,
        "SHARE_001"
      )
    }

    // Create or update share
    const share = await prisma.fileShare.upsert({
      where: {
        fileId_userId: {
          fileId: fileId,
          userId: targetUser.id
        }
      },
      update: {
        permission: validatedData.permission
      },
      create: {
        fileId: fileId,
        userId: targetUser.id,
        permission: validatedData.permission
      }
    })

    return NextResponse.json(
      { success: true, data: share },
      { status: 200 }
    )
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: "Invalid input", details: error.format() },
        { status: 400 }
      )
    }

    if (error instanceof ApiError) {
      return NextResponse.json(
        { success: false, error: error.message, code: error.code },
        { status: error.statusCode }
      )
    }

    console.error("File share error:", error)
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    )
  }
}
