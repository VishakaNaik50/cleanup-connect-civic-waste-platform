import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId');

    // Validate userId parameter
    if (!userId) {
      return NextResponse.json(
        { 
          error: 'User ID is required',
          code: 'MISSING_USER_ID' 
        },
        { status: 400 }
      );
    }

    // Validate userId is a valid integer
    const parsedUserId = parseInt(userId);
    if (isNaN(parsedUserId)) {
      return NextResponse.json(
        { 
          error: 'Valid user ID is required',
          code: 'INVALID_USER_ID' 
        },
        { status: 400 }
      );
    }

    // Query user from database
    const user = await db.select()
      .from(users)
      .where(eq(users.id, parsedUserId))
      .limit(1);

    // Check if user exists
    if (user.length === 0) {
      return NextResponse.json(
        { 
          error: 'User not found',
          code: 'USER_NOT_FOUND' 
        },
        { status: 404 }
      );
    }

    const foundUser = user[0];

    // Check if user is super-admin
    if (foundUser.role === 'super-admin') {
      // Return admin verification with user details (excluding password)
      const { password, ...userWithoutPassword } = foundUser;
      return NextResponse.json(
        {
          isAdmin: true,
          user: userWithoutPassword
        },
        { status: 200 }
      );
    }

    // User exists but is not super-admin
    return NextResponse.json(
      {
        isAdmin: false
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error')
      },
      { status: 500 }
    );
  }
}