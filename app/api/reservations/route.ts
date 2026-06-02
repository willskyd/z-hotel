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
    const reservationsCollection = db.collection('reservations');
    const reservations = await reservationsCollection
      .find({})
      .sort({ checkInDate: -1 })
      .toArray();

    return NextResponse.json(reservations, { status: 200 });
  } catch (error) {
    console.error('[v0] Get reservations error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch reservations' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = extractTokenFromHeader(request.headers.get('Authorization'));
    const decoded = token ? verifyToken(token) : null;

    if (!decoded) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      guestId,
      roomId,
      checkInDate,
      checkOutDate,
      numberOfGuests,
      totalPrice,
      status,
      notes,
    } = body;

    if (!guestId || !roomId || !checkInDate || !checkOutDate) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const db = await getDatabase();
    const reservationsCollection = db.collection('reservations');

    const newReservation = {
      _id: new ObjectId(),
      guestId: new ObjectId(guestId),
      roomId: new ObjectId(roomId),
      checkInDate: new Date(checkInDate),
      checkOutDate: new Date(checkOutDate),
      numberOfGuests,
      totalPrice: totalPrice || 0,
      status: status || 'confirmed',
      notes: notes || '',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await reservationsCollection.insertOne(newReservation);

    return NextResponse.json(newReservation, { status: 201 });
  } catch (error) {
    console.error('[v0] Create reservation error:', error);
    return NextResponse.json(
      { error: 'Failed to create reservation' },
      { status: 500 }
    );
  }
}
