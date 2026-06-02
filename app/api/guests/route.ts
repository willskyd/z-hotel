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
    const guestsCollection = db.collection('guests');
    const guests = await guestsCollection.find({}).toArray();

    return NextResponse.json(guests, { status: 200 });
  } catch (error) {
    console.error('[v0] Get guests error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch guests' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = extractTokenFromHeader(request.headers.get('Authorization'));
    if (!token || !verifyToken(token)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { firstName, lastName, email, phone, address, city, country, passportNumber } = body;

    if (!firstName || !lastName || !email) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const db = await getDatabase();
    const guestsCollection = db.collection('guests');

    // Check if guest already exists
    const existingGuest = await guestsCollection.findOne({ email });
    if (existingGuest) {
      return NextResponse.json(
        { error: 'Guest already exists' },
        { status: 409 }
      );
    }

    const newGuest = {
      _id: new ObjectId(),
      firstName,
      lastName,
      email,
      phone: phone || '',
      address: address || '',
      city: city || '',
      country: country || '',
      passportNumber: passportNumber || '',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await guestsCollection.insertOne(newGuest);

    return NextResponse.json(newGuest, { status: 201 });
  } catch (error) {
    console.error('[v0] Create guest error:', error);
    return NextResponse.json(
      { error: 'Failed to create guest' },
      { status: 500 }
    );
  }
}
