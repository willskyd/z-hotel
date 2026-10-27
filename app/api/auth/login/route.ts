import { NextRequest, NextResponse } from 'next/server';
import { describeMongoError, getDatabase } from '@/lib/mongodb';
import { verifyPassword, generateToken, generateRefreshToken } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
    const password = typeof body.password === 'string' ? body.password : '';

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password required' },
        { status: 400 }
      );
    }

    let db: Awaited<ReturnType<typeof getDatabase>>;
    try {
      db = await getDatabase();
    } catch (error) {
      // Keep connection details in server logs; return a useful, safe message to the client.
      console.error('[auth] Database connection failed:', describeMongoError(error));
      return NextResponse.json(
        {
          error: 'Database connection is unavailable. Check the server MONGODB_URI and database network access.',
        },
        { status: 503 }
      );
    }
    const usersCollection = db.collection('users');

    // Find user
    const user = await usersCollection.findOne({ email });
    if (!user) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Verify password
    const isPasswordValid = await verifyPassword(password, user.password);
    if (!isPasswordValid) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Generate tokens
    const accessToken = generateToken({
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
    });

    const refreshToken = generateRefreshToken({
      userId: user._id.toString(),
    });

    return NextResponse.json(
      {
        accessToken,
        refreshToken,
        user: {
          id: user._id.toString(),
          email: user.email,
          fullName: user.fullName,
          role: user.role,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('[auth] Login request failed:', describeMongoError(error));
    return NextResponse.json(
      { error: 'Login service is temporarily unavailable. Please try again.' },
      { status: 500 }
    );
  }
}
