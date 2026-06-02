import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { verifyToken, extractTokenFromHeader } from '@/lib/auth';
import { ObjectId } from 'mongodb';

export async function GET(request: NextRequest) {
  try {
    const token = extractTokenFromHeader(request.headers.get('Authorization'));
    if (!token || !verifyToken(token)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const db = await getDatabase();
    const roomsCollection = db.collection('rooms');
    const rooms = await roomsCollection.find({}).toArray();

    return NextResponse.json(rooms, { status: 200 });
  } catch (error) {
    console.error('[v0] Get rooms error:', error);
    return NextResponse.json({ error: 'Failed to fetch rooms' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = extractTokenFromHeader(request.headers.get('Authorization'));
    const decoded = token ? verifyToken(token) : null;

    if (!decoded || decoded.role !== 'manager') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { roomNumber, type, floor, capacity, pricePerNight, amenities, status } = body;

    if (!roomNumber || !type || !floor || !capacity || !pricePerNight) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const db = await getDatabase();
    const roomsCollection = db.collection('rooms');

    const newRoom = {
      _id: new ObjectId(),
      roomNumber,
      type,
      floor,
      capacity,
      pricePerNight,
      amenities: amenities || [],
      status: status || 'available',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await roomsCollection.insertOne(newRoom);

    return NextResponse.json(newRoom, { status: 201 });
  } catch (error) {
    console.error('[v0] Create room error:', error);
    return NextResponse.json({ error: 'Failed to create room' }, { status: 500 });
  }
}
