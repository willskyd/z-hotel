import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { verifyToken, extractTokenFromHeader } from '@/lib/auth';
import { ObjectId } from 'mongodb';

export async function GET(request: NextRequest) {
  try {
    const token = extractTokenFromHeader(request.headers.get('Authorization') ?? undefined);
    const decoded = token ? verifyToken(token) : null;

    if (!decoded) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    // Only admins and managers can view audit logs
    if (decoded.role !== 'admin' && decoded.role !== 'manager') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const limit = Math.min(parseInt(searchParams.get('limit') ?? '100'), 500);
    const page = Math.max(parseInt(searchParams.get('page') ?? '1'), 1);
    const userId = searchParams.get('userId');
    const action = searchParams.get('action');

    const db = await getDatabase();
    const col = db.collection('audit_logs');

    const filter: Record<string, any> = {};
    if (userId) filter.userId = userId;
    if (action) filter.action = action;

    const total = await col.countDocuments(filter);
    const logs = await col
      .find(filter)
      .sort({ timestamp: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .toArray();

    return NextResponse.json({ logs, total, page, limit }, { status: 200 });
  } catch (error) {
    console.error('[v0] Get audit logs error:', error);
    return NextResponse.json({ error: 'Failed to fetch audit logs' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = extractTokenFromHeader(request.headers.get('Authorization') ?? undefined);
    const decoded = token ? verifyToken(token) : null;

    if (!decoded) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { action, entity, entityId, details, metadata } = body;

    if (!action || !entity) {
      return NextResponse.json({ error: 'action and entity are required' }, { status: 400 });
    }

    const db = await getDatabase();
    const col = db.collection('audit_logs');

    const entry = {
      _id: new ObjectId(),
      userId: decoded.userId ?? decoded.id ?? 'unknown',
      userEmail: decoded.email ?? 'unknown',
      userRole: decoded.role ?? 'unknown',
      action,
      entity,
      entityId: entityId ?? null,
      details: details ?? '',
      metadata: metadata ?? {},
      timestamp: new Date(),
    };

    await col.insertOne(entry);
    return NextResponse.json(entry, { status: 201 });
  } catch (error) {
    console.error('[v0] Create audit log error:', error);
    return NextResponse.json({ error: 'Failed to create audit log' }, { status: 500 });
  }
}
