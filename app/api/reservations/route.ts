import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { verifyToken, extractTokenFromHeader } from '@/lib/auth';
import { ObjectId } from 'mongodb';

export async function GET(request: NextRequest) {
  try {
    const token = extractTokenFromHeader(request.headers.get('Authorization'));
    if (!token || !verifyToken(token)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { db } = await connectToDatabase();
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

    let body: Record<string, unknown>;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }
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

    if (
      typeof guestId !== 'string' || !ObjectId.isValid(guestId) ||
      typeof roomId !== 'string' || !ObjectId.isValid(roomId) ||
      typeof checkInDate !== 'string' || !Number.isFinite(new Date(checkInDate).getTime()) ||
      typeof checkOutDate !== 'string' || !Number.isFinite(new Date(checkOutDate).getTime())
    ) {
      return NextResponse.json(
        { error: 'A valid guest, room, check-in date, and checkout date are required' },
        { status: 400 }
      );
    }

    const checkIn = new Date(checkInDate);
    const checkOut = new Date(checkOutDate);
    if (checkOut <= checkIn) {
      return NextResponse.json({ error: 'Checkout must be later than check-in' }, { status: 400 });
    }
    const guestsCount = Number(numberOfGuests ?? 1);
    if (!Number.isInteger(guestsCount) || guestsCount < 1) {
      return NextResponse.json({ error: 'Number of guests must be at least one' }, { status: 400 });
    }

    const { client, db } = await connectToDatabase();
    const session = client.startSession();
    let newReservation: Record<string, unknown> | null = null;
    try {
      await session.withTransaction(async () => {
        const rooms = db.collection('rooms');
        const reservationsCollection = db.collection('reservations');
        const roomObjectId = new ObjectId(roomId);
        const guestObjectId = new ObjectId(guestId);
        const room = await rooms.findOne({ _id: roomObjectId }, { session });
        const guest = await db.collection('guests').findOne({ _id: guestObjectId }, { session });
        if (!room || !guest) throw new Error('RELATED_RECORD_NOT_FOUND');
        if (['maintenance', 'cleaning'].includes(String(room.status))) throw new Error('ROOM_NOT_BOOKABLE');
        if (guestsCount > Number(room.capacity ?? 1)) throw new Error('ROOM_CAPACITY_EXCEEDED');

        const conflictingReservation = await reservationsCollection.findOne({
          roomId: roomObjectId,
          status: { $in: ['pending', 'confirmed', 'checked-in', 'checked_in', 'in-house', 'in_house'] },
          checkInDate: { $lt: checkOut },
          checkOutDate: { $gt: checkIn },
        }, { session });
        if (conflictingReservation) throw new Error('ROOM_DATE_CONFLICT');

        // Updating the room in the same transaction serializes competing room bookings.
        const roomWrite = await rooms.updateOne(
          { _id: roomObjectId, status: { $nin: ['maintenance', 'cleaning'] } },
          { $inc: { reservationVersion: 1 }, $set: { updatedAt: new Date() } },
          { session },
        );
        if (roomWrite.modifiedCount !== 1) throw new Error('ROOM_NOT_BOOKABLE');
        const record = {
          _id: new ObjectId(),
          guestId: guestObjectId,
          roomId: roomObjectId,
          guestName: `${guest.firstName ?? ''} ${guest.lastName ?? ''}`.trim(),
          checkInDate: checkIn,
          checkOutDate: checkOut,
          numberOfGuests: guestsCount,
          totalPrice: Number.isFinite(Number(totalPrice)) ? Number(totalPrice) : 0,
          status: typeof status === 'string' && ['pending', 'confirmed'].includes(status) ? status : 'confirmed',
          notes: typeof notes === 'string' ? notes.trim() : '',
          createdAt: new Date(),
          updatedAt: new Date(),
          createdBy: decoded.email ?? 'unknown',
        };
        await reservationsCollection.insertOne(record, { session });
        newReservation = record;
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : '';
      if (message === 'RELATED_RECORD_NOT_FOUND') {
        return NextResponse.json({ error: 'Guest or room not found' }, { status: 404 });
      }
      if (message === 'ROOM_NOT_BOOKABLE') {
        return NextResponse.json({ error: 'A room in maintenance or cleaning cannot be booked' }, { status: 409 });
      }
      if (message === 'ROOM_CAPACITY_EXCEEDED') {
        return NextResponse.json({ error: 'The selected room does not have enough capacity' }, { status: 400 });
      }
      if (message === 'ROOM_DATE_CONFLICT') {
        return NextResponse.json({ error: 'This room already has a reservation for the selected dates' }, { status: 409 });
      }
      console.error('[v0] Create reservation transaction error:', error);
      return NextResponse.json({ error: 'Unable to create reservation; no changes were saved' }, { status: 500 });
    } finally {
      await session.endSession();
    }

    return NextResponse.json(newReservation, { status: 201 });
  } catch (error) {
    console.error('[v0] Create reservation error:', error);
    return NextResponse.json(
      { error: 'Failed to create reservation' },
      { status: 500 }
    );
  }
}
