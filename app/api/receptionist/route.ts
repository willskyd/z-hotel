import { NextRequest, NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import { connectToDatabase } from '@/lib/mongodb';
import { extractTokenFromHeader, verifyToken } from '@/lib/auth';

const ACTIVE_STATUSES = ['pending', 'confirmed', 'checked-in', 'checked_in', 'in-house', 'in_house'];

function getUser(request: NextRequest) {
  const token = extractTokenFromHeader(request.headers.get('Authorization'));
  return token ? verifyToken(token) : null;
}

function validDate(value: unknown): value is string {
  return typeof value === 'string' && Number.isFinite(new Date(value).getTime());
}

export async function GET(request: NextRequest) {
  const user = getUser(request);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { db } = await connectToDatabase();
    const { searchParams } = new URL(request.url);
    if (searchParams.get('view') === 'checkout-history') {
      const page = Math.min(1_000_000, Math.max(1, Number.parseInt(searchParams.get('page') ?? '1', 10) || 1));
      const limit = Math.min(50, Math.max(1, Number.parseInt(searchParams.get('limit') ?? '20', 10) || 20));
      const search = searchParams.get('search')?.trim().slice(0, 100);
      const from = searchParams.get('from');
      const to = searchParams.get('to');
      const roomNumber = searchParams.get('roomNumber')?.trim().slice(0, 20);
      const roomType = searchParams.get('roomType')?.trim().slice(0, 60);
      const sortOrder = searchParams.get('sort') === 'oldest' ? 1 : -1;
      const dateFilter: Record<string, Date> = {};
      if (from) {
        if (!Number.isFinite(new Date(from).getTime())) {
          return NextResponse.json({ error: 'Invalid checkout start date' }, { status: 400 });
        }
        dateFilter.$gte = new Date(from);
      }
      if (to) {
        if (!Number.isFinite(new Date(to).getTime())) {
          return NextResponse.json({ error: 'Invalid checkout end date' }, { status: 400 });
        }
        dateFilter.$lte = new Date(to);
      }
      if (dateFilter.$gte && dateFilter.$lte && dateFilter.$gte > dateFilter.$lte) {
        return NextResponse.json({ error: 'Checkout start date must be before end date' }, { status: 400 });
      }

      const pipeline: Record<string, unknown>[] = [
        { $match: {
          status: { $in: ['checked-out', 'checked_out', 'completed'] },
          ...(Object.keys(dateFilter).length ? { actualCheckOutAt: { $type: 'date', ...dateFilter } } : {}),
        } },
        { $lookup: { from: 'guests', localField: 'guestId', foreignField: '_id', as: 'guest' } },
        { $unwind: { path: '$guest', preserveNullAndEmptyArrays: true } },
        { $lookup: { from: 'rooms', localField: 'roomId', foreignField: '_id', as: 'room' } },
        { $unwind: { path: '$room', preserveNullAndEmptyArrays: true } },
        { $addFields: {
          stayReference: { $toString: '$_id' },
          guestReference: { $toString: '$guestId' },
          roomReference: { $toString: '$roomId' },
          guestFullName: { $concat: [{ $ifNull: ['$guest.firstName', ''] }, ' ', { $ifNull: ['$guest.lastName', ''] }] },
        } },
      ];
      if (roomNumber) {
        pipeline.push({ $match: { $or: [{ 'room.roomNumber': roomNumber }, { roomNumberAtCheckout: roomNumber }] } });
      }
      if (roomType) {
        pipeline.push({ $match: { $or: [{ 'room.type': roomType }, { roomTypeAtCheckout: roomType }] } });
      }
      if (search) {
        const escaped = search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const expression = { $regex: escaped, $options: 'i' };
        pipeline.push({ $match: { $or: [
          { 'guest.firstName': expression },
          { 'guest.lastName': expression },
          { guestFullName: expression },
          { guestNameAtCheckout: expression },
          { 'guest.email': expression },
          { 'guest.phone': expression },
          { 'room.roomNumber': expression },
          { roomNumberAtCheckout: expression },
          { stayReference: expression },
          { guestReference: expression },
        ] } });
      }
      pipeline.push({
        $facet: {
          records: [
            { $sort: { actualCheckOutAt: sortOrder, updatedAt: sortOrder, _id: sortOrder } },
            { $skip: (page - 1) * limit },
            { $limit: limit },
            { $project: {
              _id: 1, stayReference: 1, guestId: 1, guestReference: 1, roomId: 1, roomReference: 1,
              guestName: { $ifNull: ['$guestNameAtCheckout', { $concat: [{ $ifNull: ['$guest.firstName', ''] }, ' ', { $ifNull: ['$guest.lastName', ''] }] }] },
              guestEmail: '$guest.email', guestPhone: '$guest.phone',
              roomNumber: { $ifNull: ['$roomNumberAtCheckout', '$room.roomNumber'] },
              roomType: { $ifNull: ['$roomTypeAtCheckout', '$room.type'] },
              checkInDate: 1, actualCheckInAt: 1, checkOutDate: 1,
              expectedCheckOutAtCheckout: { $ifNull: ['$expectedCheckOutAtCheckout', '$checkOutDate'] },
              originalExpectedCheckout: 1, actualCheckOutAt: 1, numberOfGuests: 1, totalPrice: 1, status: 1, originalStatus: 1,
              extensions: { $ifNull: ['$extensions', []] }, checkoutNotes: 1, checkoutProcessedBy: 1,
              roomRate: 1, payments: 1, outstandingBalance: 1, createdBy: 1,
            } },
          ],
          totalCount: [{ $count: 'count' }],
        },
      });
      const [result] = await db.collection('reservations').aggregate(pipeline).toArray();
      const total = result?.totalCount?.[0]?.count ?? 0;
      return NextResponse.json({
        records: result?.records ?? [],
        pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
      });
    }

    const [rooms, guests, reservations] = await Promise.all([
      db.collection('rooms').find({}).sort({ roomNumber: 1 }).toArray(),
      db.collection('guests').find({}).toArray(),
      db.collection('reservations').find({}).sort({ checkInDate: 1 }).toArray(),
    ]);
    return NextResponse.json({ rooms, guests, reservations });
  } catch (error) {
    console.error('[receptionist] Load data failed:', error);
    return NextResponse.json({ error: 'Unable to load receptionist data' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const user = getUser(request);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  if (!['admin', 'manager', 'staff'].includes(String(user.role))) {
    return NextResponse.json({ error: 'You are not permitted to manage guest stays' }, { status: 403 });
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const action = body.action;
  const reservationId = body.reservationId;
  if (action !== 'walk-in' && action !== 'check-in' && action !== 'check-out' && action !== 'extend-stay') {
    return NextResponse.json({ error: 'Invalid receptionist action' }, { status: 400 });
  }
  if (action !== 'walk-in' && (typeof reservationId !== 'string' || !ObjectId.isValid(reservationId))) {
    return NextResponse.json({ error: 'A valid reservation is required' }, { status: 400 });
  }
  if (action === 'extend-stay' && (
    !validDate(body.newCheckOutDate) ||
    typeof body.reason !== 'undefined' && (typeof body.reason !== 'string' || body.reason.length > 1000)
  )) {
    return NextResponse.json({ error: 'A valid new checkout date and optional reason are required' }, { status: 400 });
  }

  if (action === 'walk-in') {
    const { firstName, lastName, phone, email, roomId, checkInDate, checkOutDate, numberOfGuests, notes } = body;
    if (
      typeof firstName !== 'string' || !firstName.trim() ||
      firstName.trim().length > 80 ||
      typeof lastName !== 'string' || !lastName.trim() ||
      lastName.trim().length > 80 ||
      typeof phone !== 'string' || phone.trim().length > 32 || phone.replace(/\D/g, '').length < 7 ||
      typeof roomId !== 'string' || !ObjectId.isValid(roomId) ||
      !validDate(checkInDate) || !validDate(checkOutDate) ||
      typeof numberOfGuests !== 'number' || !Number.isInteger(numberOfGuests) || numberOfGuests < 1 ||
      (email !== undefined && email !== '' && (typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)))
      || (typeof notes !== 'undefined' && (typeof notes !== 'string' || notes.length > 1000))
    ) {
      return NextResponse.json({ error: 'Complete all required guest, room, and stay details with valid values' }, { status: 400 });
    }

    const checkIn = new Date(checkInDate);
    const checkOut = new Date(checkOutDate);
    const now = new Date();
    if (checkOut <= checkIn || checkOut <= now || checkIn.getTime() > now.getTime() + 5 * 60_000) {
      return NextResponse.json({ error: 'Walk-ins must check in now and have a checkout time in the future' }, { status: 400 });
    }

    let createdReservation: Record<string, unknown> | null = null;
    const { client, db } = await connectToDatabase();
    const session = client.startSession();
    try {
      await session.withTransaction(async () => {
        const rooms = db.collection('rooms');
        const reservations = db.collection('reservations');
        const guests = db.collection('guests');
        const roomObjectId = new ObjectId(roomId);
        const room = await rooms.findOne({ _id: roomObjectId }, { session });
        if (!room) throw new Error('ROOM_NOT_FOUND');
        if (room.status !== 'available') throw new Error('ROOM_UNAVAILABLE');
        if (numberOfGuests > Number(room.capacity ?? 1)) throw new Error('ROOM_CAPACITY_EXCEEDED');

        const conflict = await reservations.findOne({
          roomId: roomObjectId,
          status: { $in: ACTIVE_STATUSES },
          checkInDate: { $lt: checkOut },
          checkOutDate: { $gt: checkIn },
        }, { session });
        if (conflict) throw new Error('ROOM_DATE_CONFLICT');

        const normalizedPhone = phone.trim();
        const normalizedEmail = typeof email === 'string' ? email.trim().toLowerCase() : '';
        const matchingGuests = await guests.find({
          $or: [
            { phone: normalizedPhone },
            ...(normalizedEmail ? [{ email: normalizedEmail }] : []),
          ],
        }, { session }).limit(2).toArray();
        if (matchingGuests.length > 1) throw new Error('GUEST_CONTACT_CONFLICT');
        let guest = matchingGuests[0] ?? null;
        if (
          (guest && guest.phone && guest.phone !== normalizedPhone) ||
          (guest && normalizedEmail && guest.email && guest.email !== normalizedEmail)
        ) {
          throw new Error('GUEST_CONTACT_CONFLICT');
        }
        const guestName = `${firstName.trim()} ${lastName.trim()}`;
        if (!guest) {
          const guestRecord = {
            _id: new ObjectId(),
            firstName: firstName.trim(),
            lastName: lastName.trim(),
            email: normalizedEmail,
            phone: normalizedPhone,
            country: typeof body.country === 'string' ? body.country.trim() : '',
            totalStays: 0,
            lastVisit: null,
            totalRevenue: 0,
            stayComments: [],
            stayHistory: [],
            createdAt: now,
            updatedAt: now,
          };
          await guests.insertOne(guestRecord, { session });
          guest = guestRecord;
        }

        const roomClaim = await rooms.updateOne(
          { _id: roomObjectId, status: 'available' },
          { $set: { status: 'occupied', currentGuest: guestName, checkOutDate: checkOut, updatedAt: now } },
          { session },
        );
        if (roomClaim.modifiedCount !== 1) throw new Error('ROOM_UNAVAILABLE');

        const record = {
          _id: new ObjectId(),
          guestId: guest._id,
          roomId: roomObjectId,
          checkInDate: checkIn,
          checkOutDate: checkOut,
          actualCheckInAt: now,
          numberOfGuests,
          totalPrice: Number(room.pricePerNight ?? 0) * Math.max(1, Math.ceil((checkOut.getTime() - checkIn.getTime()) / 86_400_000)),
          status: 'checked-in',
          notes: typeof notes === 'string' ? notes.trim() : '',
          createdAt: now,
          updatedAt: now,
        };
        await reservations.insertOne(record, { session });
        await db.collection('audit_logs').insertOne({
          _id: new ObjectId(),
          userId: user.userId ?? user.id ?? 'unknown',
          userEmail: user.email ?? 'unknown',
          userRole: user.role ?? 'unknown',
          action: 'WALK_IN_CHECK_IN',
          entity: 'reservation',
          entityId: record._id.toString(),
          details: `Registered walk-in ${guestName} in room ${room.roomNumber}`,
          metadata: { roomNumber: room.roomNumber, numberOfGuests },
          timestamp: now,
        }, { session });
        createdReservation = record;
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : '';
      const knownErrors: Record<string, { status: number; error: string }> = {
        ROOM_NOT_FOUND: { status: 404, error: 'Room not found' },
        ROOM_UNAVAILABLE: { status: 409, error: 'This room is no longer available' },
        ROOM_CAPACITY_EXCEEDED: { status: 400, error: 'The selected room does not have enough capacity' },
        ROOM_DATE_CONFLICT: { status: 409, error: 'The room has a conflicting reservation for these dates' },
        GUEST_CONTACT_CONFLICT: { status: 409, error: 'The phone number or email belongs to a different guest record; review the guest details before continuing' },
      };
      const known = knownErrors[message];
      if (known) return NextResponse.json({ error: known.error }, { status: known.status });
      console.error('[receptionist] Walk-in transaction failed:', error);
      return NextResponse.json({ error: 'Unable to register walk-in; no stay changes were saved' }, { status: 500 });
    } finally {
      await session.endSession();
    }
    return NextResponse.json({ reservation: createdReservation }, { status: 201 });
  }

  const { client, db } = await connectToDatabase();
  const session = client.startSession();
  let resultStatus = 200;
  let resultBody: Record<string, unknown> = {};
  try {
    await session.withTransaction(async () => {
      const reservations = db.collection('reservations');
      const rooms = db.collection('rooms');
      const reservation = await reservations.findOne({ _id: new ObjectId(reservationId as string) }, { session });
      if (!reservation) throw new Error('RESERVATION_NOT_FOUND');
      const room = await rooms.findOne({ _id: reservation.roomId }, { session });
      if (!room) throw new Error('ROOM_NOT_FOUND');
      const now = new Date();

      if (action === 'check-in') {
        if (!['pending', 'confirmed'].includes(String(reservation.status))) throw new Error('INVALID_CHECK_IN_STATUS');
        const guest = await db.collection('guests').findOne({ _id: reservation.guestId }, { session });
        if (!guest) throw new Error('GUEST_NOT_FOUND');
        if (!(reservation.checkInDate instanceof Date) || !(reservation.checkOutDate instanceof Date) || reservation.checkOutDate <= now) {
          throw new Error('INVALID_STAY_DATES');
        }
        if (reservation.checkInDate > now) throw new Error('CHECK_IN_NOT_DUE');
        if (!['available', 'reserved'].includes(String(room.status ?? 'available'))) throw new Error('ROOM_UNAVAILABLE');
        if (Number(reservation.numberOfGuests ?? 1) > Number(room.capacity ?? 1)) throw new Error('ROOM_CAPACITY_EXCEEDED');
        const conflict = await reservations.findOne({
          _id: { $ne: reservation._id },
          roomId: reservation.roomId,
          status: { $in: ACTIVE_STATUSES },
          checkInDate: { $lt: reservation.checkOutDate },
          checkOutDate: { $gt: reservation.checkInDate },
        }, { session });
        if (conflict) throw new Error('ROOM_DATE_CONFLICT');
        const claim = await rooms.updateOne(
          { _id: room._id, status: { $in: ['available', 'reserved'] } },
          { $set: { status: 'occupied', currentGuest: `${guest.firstName ?? ''} ${guest.lastName ?? ''}`.trim(), checkOutDate: reservation.checkOutDate, updatedAt: now } },
          { session },
        );
        if (claim.modifiedCount !== 1) throw new Error('ROOM_UNAVAILABLE');
        const update = await reservations.updateOne(
          { _id: reservation._id, status: { $in: ['pending', 'confirmed'] } },
          { $set: { status: 'checked-in', actualCheckInAt: now, updatedAt: now } },
          { session },
        );
        if (update.modifiedCount !== 1) throw new Error('INVALID_CHECK_IN_STATUS');
        resultBody = { reservationId: reservation._id.toString(), status: 'checked-in' };
      } else if (action === 'check-out') {
        if (!['checked-in', 'checked_in', 'in-house', 'in_house'].includes(String(reservation.status))) {
          throw new Error('INVALID_CHECK_OUT_STATUS');
        }
        const guest = await db.collection('guests').findOne({ _id: reservation.guestId }, { session });
        if (!guest) throw new Error('GUEST_NOT_FOUND');
        const release = await rooms.updateOne(
          { _id: room._id, status: 'occupied' },
          { $set: { status: 'cleaning', currentGuest: null, checkOutDate: null, updatedAt: now } },
          { session },
        );
        if (release.modifiedCount !== 1) throw new Error('ROOM_STATE_MISMATCH');
        const update = await reservations.updateOne(
          { _id: reservation._id, status: reservation.status },
          { $set: {
            status: 'checked-out',
            originalStatus: reservation.originalStatus ?? reservation.status,
            expectedCheckOutAtCheckout: reservation.checkOutDate,
            originalExpectedCheckout: reservation.originalExpectedCheckout ?? reservation.checkOutDate,
            actualCheckOutAt: now,
            checkoutNotes: typeof body.notes === 'string' ? body.notes.trim().slice(0, 1000) : '',
            checkoutProcessedBy: { userId: user.userId ?? user.id ?? null, email: user.email ?? null, role: user.role ?? null },
            guestNameAtCheckout: `${guest.firstName ?? ''} ${guest.lastName ?? ''}`.trim(),
            roomNumberAtCheckout: String(room.roomNumber ?? ''),
            roomTypeAtCheckout: String(room.type ?? ''),
            roomRate: Number(room.pricePerNight ?? reservation.roomRate ?? 0),
            updatedAt: now,
          } },
          { session },
        );
        if (update.modifiedCount !== 1) throw new Error('INVALID_CHECK_OUT_STATUS');
        const stayNights = Math.max(1, Math.ceil(
          (new Date(reservation.checkOutDate).getTime() - new Date(reservation.checkInDate).getTime()) / 86_400_000,
        ));
        const previousHistory = Array.isArray(guest.stayHistory) ? guest.stayHistory : [];
        const historyUpdate = await db.collection('guests').updateOne(
          { _id: guest._id },
          {
            $set: {
              totalStays: Number(guest.totalStays ?? 0) + 1,
              totalRevenue: Number(guest.totalRevenue ?? 0) + Number(reservation.totalPrice ?? 0),
              lastVisit: now,
              updatedAt: now,
              stayHistory: [...previousHistory, {
                checkIn: reservation.actualCheckInAt ?? reservation.checkInDate,
                checkOut: now,
                room: String(room.roomNumber),
                nights: stayNights,
                amount: Number(reservation.totalPrice ?? 0),
              }],
            },
          },
          { session },
        );
        if (historyUpdate.modifiedCount !== 1) throw new Error('GUEST_HISTORY_UPDATE_FAILED');
        resultBody = { reservationId: reservation._id.toString(), status: 'checked-out', actualCheckOutAt: now };
      } else {
        if (!['checked-in', 'checked_in', 'in-house', 'in_house'].includes(String(reservation.status))) {
          throw new Error('INVALID_EXTENSION_STATUS');
        }
        if (!(reservation.checkOutDate instanceof Date)) throw new Error('INVALID_STAY_DATES');
        const newCheckOut = new Date(body.newCheckOutDate as string);
        if (newCheckOut <= reservation.checkOutDate || newCheckOut <= now) throw new Error('EXTENSION_NOT_LATER');
        if (room.status !== 'occupied') throw new Error('ROOM_STATE_MISMATCH');

        const conflict = await reservations.findOne({
          _id: { $ne: reservation._id },
          roomId: room._id,
          status: { $in: ACTIVE_STATUSES },
          checkInDate: { $lt: newCheckOut },
          checkOutDate: { $gt: reservation.checkOutDate },
        }, { session });
        if (conflict) throw new Error('EXTENSION_CONFLICT');

        const previousCheckOut = reservation.checkOutDate;
        const additionalNights = Math.ceil((newCheckOut.getTime() - previousCheckOut.getTime()) / 86_400_000);
        const nightlyRate = Number(room.pricePerNight ?? reservation.roomRate ?? 0);
        const additionalCharge = nightlyRate > 0 ? nightlyRate * additionalNights : null;
        const staff = { userId: user.userId ?? user.id ?? null, email: user.email ?? null, role: user.role ?? null };
        const extension = {
          extensionId: new ObjectId(),
          stayId: reservation._id,
          guestId: reservation.guestId,
          roomId: room._id,
          previousExpectedCheckout: previousCheckOut,
          newExpectedCheckout: newCheckOut,
          extendedAt: now,
          staff,
          reason: typeof body.reason === 'string' ? body.reason.trim() : '',
          nightlyRate: nightlyRate > 0 ? nightlyRate : null,
          additionalNights,
          estimatedAdditionalCharge: additionalCharge,
        };
        const roomUpdate = await rooms.updateOne(
          { _id: room._id, status: 'occupied' },
          { $inc: { reservationVersion: 1 }, $set: { checkOutDate: newCheckOut, updatedAt: now } },
          { session },
        );
        if (roomUpdate.modifiedCount !== 1) throw new Error('ROOM_STATE_MISMATCH');
        const previousExtensions = Array.isArray(reservation.extensions) ? reservation.extensions : [];
        const update = await reservations.updateOne(
          { _id: reservation._id, status: reservation.status, checkOutDate: previousCheckOut },
          {
            $set: {
              checkOutDate: newCheckOut,
              originalExpectedCheckout: reservation.originalExpectedCheckout ?? previousCheckOut,
              extensions: [...previousExtensions, extension],
              updatedAt: now,
            },
          },
          { session },
        );
        if (update.modifiedCount !== 1) throw new Error('INVALID_EXTENSION_STATUS');
        resultBody = { reservationId: reservation._id.toString(), checkOutDate: newCheckOut, extension };
      }

      await db.collection('audit_logs').insertOne({
        _id: new ObjectId(),
        userId: user.userId ?? user.id ?? 'unknown',
        userEmail: user.email ?? 'unknown',
        userRole: user.role ?? 'unknown',
        action: action === 'check-in' ? 'GUEST_CHECK_IN' : action === 'check-out' ? 'GUEST_CHECK_OUT' : 'GUEST_STAY_EXTENDED',
        entity: 'reservation',
        entityId: reservation._id.toString(),
        details: action === 'check-in'
          ? `Checked in guest for room ${room.roomNumber}`
          : action === 'check-out'
            ? `Checked out guest from room ${room.roomNumber}`
            : `Extended stay in room ${room.roomNumber} to ${String(body.newCheckOutDate)}`,
        metadata: action === 'extend-stay'
          ? { roomNumber: room.roomNumber, previousExpectedCheckout: reservation.checkOutDate, newExpectedCheckout: body.newCheckOutDate }
          : { roomNumber: room.roomNumber },
        timestamp: now,
      }, { session });
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : '';
    const knownErrors: Record<string, { status: number; error: string }> = {
      RESERVATION_NOT_FOUND: { status: 404, error: 'Reservation not found' },
      GUEST_NOT_FOUND: { status: 404, error: 'The associated guest record could not be found' },
      GUEST_HISTORY_UPDATE_FAILED: { status: 500, error: 'Unable to update guest stay history; checkout was not saved' },
      INVALID_EXTENSION_STATUS: { status: 409, error: 'Only an active checked-in stay can be extended' },
      EXTENSION_NOT_LATER: { status: 400, error: 'The new checkout must be later than the current expected checkout' },
      EXTENSION_CONFLICT: { status: 409, error: 'This room has another reservation during the requested extension. Choose a different checkout time.' },
      ROOM_NOT_FOUND: { status: 404, error: 'The assigned room could not be found' },
      INVALID_CHECK_IN_STATUS: { status: 409, error: 'This reservation cannot be checked in' },
      INVALID_CHECK_OUT_STATUS: { status: 409, error: 'This stay has already been checked out or is not active' },
      INVALID_STAY_DATES: { status: 400, error: 'The reservation has invalid or expired stay dates' },
      CHECK_IN_NOT_DUE: { status: 409, error: 'The guest is not due to check in yet' },
      ROOM_UNAVAILABLE: { status: 409, error: 'The assigned room is not available for check-in' },
      ROOM_CAPACITY_EXCEEDED: { status: 400, error: 'The assigned room does not have enough capacity' },
      ROOM_DATE_CONFLICT: { status: 409, error: 'Another reservation conflicts with this stay' },
      ROOM_STATE_MISMATCH: { status: 409, error: 'Room status changed; refresh and try again' },
    };
    const known = knownErrors[message];
    if (known) {
      resultStatus = known.status;
      resultBody = { error: known.error };
    } else {
      console.error(`[receptionist] ${action} transaction failed:`, error);
      resultStatus = 500;
      resultBody = { error: 'Unable to complete the stay operation; no changes were saved' };
    }
  } finally {
    await session.endSession();
  }
  return NextResponse.json(resultBody, { status: resultStatus });
}
