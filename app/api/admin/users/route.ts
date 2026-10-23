import { NextRequest, NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import { getDatabase, describeMongoError } from '@/lib/mongodb';
import {
  extractTokenFromHeader,
  verifyToken,
  hashPassword,
} from '@/lib/auth';

async function requireAdmin(request: NextRequest) {
  const token = extractTokenFromHeader(
    request.headers.get('authorization')
  );

  if (!token) {
    return {
      error: NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      ),
      db: null,
    };
  }

  const payload = verifyToken(token);

  if (!payload?.userId || !ObjectId.isValid(payload.userId)) {
    return {
      error: NextResponse.json(
        { error: 'Invalid or expired access token' },
        { status: 401 }
      ),
      db: null,
    };
  }

  const db = await getDatabase();
  const admin = await db.collection('users').findOne({
    _id: new ObjectId(payload.userId),
    status: 'active',
  });

  if (!admin || String(admin.role).toLowerCase() !== 'admin') {
    return {
      error: NextResponse.json(
        { error: 'Only an active Admin can manage user accounts' },
        { status: 403 }
      ),
      db: null,
    };
  }

  return { error: null, db };
}

// List accounts without exposing password hashes.
export async function GET(request: NextRequest) {
  try {
    const auth = await requireAdmin(request);
    if (auth.error) return auth.error;

    const users = await auth.db!
      .collection('users')
      .find(
        {},
        {
          projection: {
            password: 0,
          },
        }
      )
      .sort({ createdAt: -1 })
      .toArray();

    return NextResponse.json({
      users: users.map((user) => ({
        id: user._id.toString(),
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        status: user.status,
        createdAt: user.createdAt,
      })),
    });
  } catch (error) {
    console.error('[admin/users GET]', describeMongoError(error));
    return NextResponse.json(
      { error: 'Unable to load user accounts' },
      { status: 500 }
    );
  }
}

// Admin can create Manager and Staff accounts only.
export async function POST(request: NextRequest) {
  try {
    const auth = await requireAdmin(request);
    if (auth.error) return auth.error;

    const body = await request.json();
    const fullName =
      typeof body.fullName === 'string' ? body.fullName.trim() : '';
    const email =
      typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
    const password =
      typeof body.password === 'string' ? body.password : '';
    const role =
      typeof body.role === 'string' ? body.role.trim().toLowerCase() : '';

    if (!fullName || !email || !password || !role) {
      return NextResponse.json(
        { error: 'Full name, email, password and role are required' },
        { status: 400 }
      );
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { error: 'Enter a valid email address' },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Password must contain at least 8 characters' },
        { status: 400 }
      );
    }

    if (role !== 'manager' && role !== 'staff') {
      return NextResponse.json(
        { error: 'Allowed roles are Manager and Staff' },
        { status: 400 }
      );
    }

    const users = auth.db!.collection('users');

    const existingUser = await users.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { error: 'An account with this email already exists' },
        { status: 409 }
      );
    }

    const now = new Date();
    const newUser = {
      _id: new ObjectId(),
      fullName,
      email,
      password: await hashPassword(password),
      role,
      status: 'active',
      createdAt: now,
      updatedAt: now,
    };

    await users.insertOne(newUser);

    return NextResponse.json(
      {
        message: 'User account created successfully',
        user: {
          id: newUser._id.toString(),
          fullName: newUser.fullName,
          email: newUser.email,
          role: newUser.role,
          status: newUser.status,
          createdAt: newUser.createdAt,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    if (
      error &&
      typeof error === 'object' &&
      'code' in error &&
      error.code === 11000
    ) {
      return NextResponse.json(
        { error: 'An account with this email already exists' },
        { status: 409 }
      );
    }

    console.error('[admin/users POST]', describeMongoError(error));
    return NextResponse.json(
      { error: 'Unable to create user account' },
      { status: 500 }
    );
  }
}
