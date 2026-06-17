import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { verifyToken, extractTokenFromHeader } from '@/lib/auth';
import { ObjectId } from 'mongodb';

export async function GET(request: NextRequest) {
  try {
    const token = extractTokenFromHeader(request.headers.get('Authorization') ?? undefined);
    if (!token || !verifyToken(token)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const db = await getDatabase();
    const rooms = await db.collection('rooms').find({}).sort({ roomNumber: 1 }).toArray();
    return NextResponse.json(rooms, { status: 200 });
  } catch (error) {
    console.error('[v0] Get rooms error:', error);
    return NextResponse.json({ error: 'Failed to fetch rooms' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = extractTokenFromHeader(request.headers.get('Authorization') ?? undefined);
    const decoded = token ? verifyToken(token) : null;

    if (!decoded || (decoded.role !== 'admin' && decoded.role !== 'manager')) {
      return NextResponse.json({ error: 'Manager or Admin access required' }, { status: 403 });
    }

    const body = await request.json();
    const { roomNumber, type, floor, capacity, pricePerNight, amenities, status, description } = body;

    if (!roomNumber || !type || floor == null || capacity == null || !pricePerNight) {
      return NextResponse.json({ error: 'Missing required fields: roomNumber, type, floor, capacity, pricePerNight' }, { status: 400 });
    }

    const db = await getDatabase();
    const existing = await db.collection('rooms').findOne({ roomNumber: String(roomNumber) });
    if (existing) {
      return NextResponse.json({ error: `Room ${roomNumber} already exists` }, { status: 409 });
    }

    const newRoom = {
      _id: new ObjectId(),
      roomNumber: String(roomNumber),
      type: String(type),
      floor: Number(floor),
      capacity: Number(capacity),
      pricePerNight: Number(pricePerNight),
      amenities: Array.isArray(amenities) ? amenities : [],
      status: status ?? 'available',
      description: description ?? '',
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: decoded.email ?? 'unknown',
    };

    await db.collection('rooms').insertOne(newRoom);

    // Non-fatal audit log
    try {
      await db.collection('audit_logs').insertOne({
        _id: new ObjectId(),
        userId: decoded.userId ?? decoded.id ?? 'unknown',
        userEmail: decoded.email ?? 'unknown',
        userRole: decoded.role ?? 'unknown',
        action: 'CREATE_ROOM',
        entity: 'room',
        entityId: newRoom._id.toString(),
        details: `Created room ${roomNumber} (${type}) at ₦${pricePerNight.toLocaleString()}/night`,
        metadata: { roomNumber, type, pricePerNight },
        timestamp: new Date(),
      });
    } catch (auditErr) {
      console.error('[v0] Audit log failed (non-fatal):', auditErr);
    }

    return NextResponse.json(newRoom, { status: 201 });
  } catch (error) {
    console.error('[v0] Create room error:', error);
    return NextResponse.json({ error: 'Failed to create room' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const token = extractTokenFromHeader(request.headers.get('Authorization') ?? undefined);
    const decoded = token ? verifyToken(token) : null;

    // Only admins can modify room details / pricing
    if (!decoded || decoded.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required to modify rooms' }, { status: 403 });
    }

    const body = await request.json();
    const { id, ...updates } = body;
    if (!id) return NextResponse.json({ error: 'Room id is required' }, { status: 400 });

    if (updates.pricePerNight != null) updates.pricePerNight = Number(updates.pricePerNight);
    if (updates.floor != null) updates.floor = Number(updates.floor);
    if (updates.capacity != null) updates.capacity = Number(updates.capacity);

    const db = await getDatabase();
    const result = await db.collection('rooms').findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: { ...updates, updatedAt: new Date(), updatedBy: decoded.email ?? 'unknown' } },
      { returnDocument: 'after' }
    );

    if (!result) return NextResponse.json({ error: 'Room not found' }, { status: 404 });

    try {
      await db.collection('audit_logs').insertOne({
        _id: new ObjectId(),
        userId: decoded.userId ?? decoded.id ?? 'unknown',
        userEmail: decoded.email ?? 'unknown',
        userRole: decoded.role ?? 'unknown',
        action: 'UPDATE_ROOM',
        entity: 'room',
        entityId: id,
        details: `Updated room ${(result as any)?.roomNumber ?? id}: fields — ${Object.keys(updates).join(', ')}`,
        metadata: updates,
        timestamp: new Date(),
      });
    } catch (auditErr) {
      console.error('[v0] Audit log failed (non-fatal):', auditErr);
    }

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error('[v0] Update room error:', error);
    return NextResponse.json({ error: 'Failed to update room' }, { status: 500 });
  }
}
