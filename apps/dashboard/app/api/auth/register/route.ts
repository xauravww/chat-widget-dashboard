import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import bcrypt from 'bcryptjs';
// Prisma types might not be directly exported for instanceof checks in all versions/setups
// import { Prisma } from '@prisma/client'; 

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { username, password } = body;

    // Basic validation
    if (!username || !password) {
      return new NextResponse("Username and password are required", { status: 400 });
    }

    if (password.length < 6) { // Example: enforce minimum password length
       return new NextResponse("Password must be at least 6 characters long", { status: 400 });
    }

    // Hash the password
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Create user in database
    const newUser = await db.user.create({
      data: {
        username,
        passwordHash,
      },
    });

    // Don't return the password hash
    const { passwordHash: _, ...userWithoutPassword } = newUser;

    return NextResponse.json(userWithoutPassword, { status: 201 }); // 201 Created

  } catch (error: any) { // Use 'any' temporarily to access code property
    console.error("[API_REGISTER_POST]", error);

    // Check for unique constraint error code P2002
    if (error && typeof error === 'object' && 'code' in error && error.code === 'P2002') {
      return new NextResponse('Username already exists', { status: 409 });
    }

    return new NextResponse("Internal Server Error", { status: 500 });
  }
} 