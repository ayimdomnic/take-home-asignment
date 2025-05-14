import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { validate } from "@/lib/validations";
import { ApiError } from "@/lib";


export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Validate request body
    const { name, email, password } = validate('register', body);

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new ApiError(
        "User with this email already exists",
        409,
        "AUTH_001"
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash: hashedPassword,
      },
      select: {
        id: true,
        name: true,
        email: true,
      },
    });

    return NextResponse.json({ 
      success: true, 
      data: user 
    }, { status: 201 });
  } catch (error) {
    console.error("Registration error:", error);
    
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

    return NextResponse.json(
      { 
        success: false, 
        error: "Something went wrong" 
      }, 
      { status: 500 }
    );
  }
}