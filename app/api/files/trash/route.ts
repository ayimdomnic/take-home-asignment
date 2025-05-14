import { authOptions, ApiError, API_ERRORS, prisma } from "@/lib";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(request: NextRequest) {
    try {
      const session = await getServerSession(authOptions);
      if (!session?.user?.id) {
        throw new ApiError(API_ERRORS.UNAUTHORIZED.message, API_ERRORS.UNAUTHORIZED.statusCode, API_ERRORS.UNAUTHORIZED.code);
      }
  
      const { fileId, trashed } = await request.json();
      
      const updatedFile = await prisma.file.update({
        where: {
          id: fileId,
          userId: session.user.id
        },
        data: {
          trashed,
          trashedAt: trashed ? new Date() : null
        }
      });
  
      return NextResponse.json({ success: true, data: updatedFile }, { status: 200 });
    } catch (error) {
      console.error("Trashing Error:", error)

      return NextResponse.json({ success: false,  error: "Internal Server Error"}, { status: 500 })
    }
  }