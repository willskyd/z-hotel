import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { verifyToken, extractTokenFromHeader } from '@/lib/auth';
import { ObjectId } from 'mongodb';

const DEFAULT_ROOM_TYPES = [
  { name: 'Standard', basePrice: 45000, description: 'Comfortable standard room with essential amenities', amenities: ['WiFi', 'TV', 'AC', 'En-suite bathroom'], maxCapacity: 2, color: '#6366f1' },
  { name: 'Deluxe', basePrice: 85000, description: 'Spacious deluxe room with premium furnishings', amenities: ['WiFi', 'TV', 'AC', 'En-suite bathroom', 'Mini bar', 'Room service'], maxCapacity: 3, color: '#8b5cf6' },
  { name: 'Suite', basePrice: 150000, description: 'Luxury suite with separate living area and premium services', amenities: ['WiFi', 'TV', 'AC', 'En-suite bathroom', 'Mini bar', 'Room service', 'Jacuzzi', 'Kitchenette', 'Lounge area'], maxCapacity: 4, color: '#f59e0b' },
  { name: 'Executive', basePrice: 120000, description: 'Executive room designed for business travellers', amenities: ['WiFi', 'TV', 'AC', 'En-suite bathroom', 'Work desk', 'Coffee machine', 'Express laundry'], maxCapacity: 2, color: '#10b981' },
];

export async function GET(request: NextRequest) {
  try {
    const token = extractTokenFromHeader(request.headers.get('Authorization') ?? undefined);
    if (!token || !verifyToken(token)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const db = await getDatabase();
    const col = db.collection('room_types');
    let types = await col.find({}).sort({ name: 1 }).toArray();

    // Seed defaults if empty
    if (types.length === 0) {
      const toInsert = DEFAULT_ROOM_TYPES.map((t) => ({
        ...t,
        _id: new ObjectId(),
        createdAt: new Date(),
        updatedAt: new Date(),
      }));
      await col.insertMany(toInsert);
      types = toInsert;
    }

    return NextResponse.json(types, { status: 200 });
  } catch (error) {
    console.error('[v0] Get room types error:', error);
    return NextResponse.json({ error: 'Failed to fetch room types' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = extractTokenFromHeader(request.headers.get('Authorization') ?? undefined);
    const decoded = token ? verifyToken(token) : null;

    if (!decoded || decoded.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const body = await request.json();
    const { name, basePrice, description, amenities, maxCapacity, color } = body;

    if (!name || !basePrice) {
      return NextResponse.json({ error: 'name and basePrice are required' }, { status: 400 });
    }

    const db = await getDatabase();
    const col = db.collection('room_types');

    const existing = await col.findOne({ name });
    if (existing) {
      return NextResponse.json({ error: 'Room type already exists' }, { status: 409 });
    }

    const newType = {
      _id: new ObjectId(),
      name,
      basePrice: Number(basePrice),
      description: description ?? '',
      amenities: amenities ?? [],
      maxCapacity: maxCapacity ?? 2,
      color: color ?? '#6366f1',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await col.insertOne(newType);
    return NextResponse.json(newType, { status: 201 });
  } catch (error) {
    console.error('[v0] Create room type error:', error);
    return NextResponse.json({ error: 'Failed to create room type' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const token = extractTokenFromHeader(request.headers.get('Authorization') ?? undefined);
    const decoded = token ? verifyToken(token) : null;

    if (!decoded || decoded.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json({ error: 'id is required' }, { status: 400 });
    }

    const db = await getDatabase();
    const col = db.collection('room_types');

    const result = await col.findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: { ...updates, updatedAt: new Date() } },
      { returnDocument: 'after' }
    );

    if (!result) {
      return NextResponse.json({ error: 'Room type not found' }, { status: 404 });
    }

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error('[v0] Update room type error:', error);
    return NextResponse.json({ error: 'Failed to update room type' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const token = extractTokenFromHeader(request.headers.get('Authorization') ?? undefined);
    const decoded = token ? verifyToken(token) : null;

    if (!decoded || decoded.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'id is required' }, { status: 400 });

    const db = await getDatabase();
    await db.collection('room_types').deleteOne({ _id: new ObjectId(id) });
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('[v0] Delete room type error:', error);
    return NextResponse.json({ error: 'Failed to delete room type' }, { status: 500 });
  }
}
