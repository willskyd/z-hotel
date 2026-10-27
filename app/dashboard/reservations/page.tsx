'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import ReservationsList from '@/components/reservations/reservations-list';
import CreateReservationModal from '@/components/reservations/create-reservation-modal';

type Guest = { _id: string; firstName: string; lastName: string; email?: string };
type Room = { _id: string; roomNumber: string; type: string; capacity: number; pricePerNight: number; status: string };
type ReservationRecord = {
  _id: string;
  guestId: string;
  roomId: string;
  guestName?: string;
  checkInDate: string;
  checkOutDate: string;
  numberOfGuests?: number;
  totalPrice?: number;
  status: string;
};
type ReservationInput = {
  guestId: string;
  roomId: string;
  checkInDate: string;
  checkOutDate: string;
  numberOfGuests: number;
  totalPrice: number;
  notes: string;
};

export default function ReservationsPage() {
  const [reservations, setReservations] = useState<ReservationRecord[]>([]);
  const [guests, setGuests] = useState<Guest[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [showModal, setShowModal] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch('/api/receptionist', {
        headers: { Authorization: `Bearer ${token ?? ''}` },
        cache: 'no-store',
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? 'Unable to load reservations');
      setReservations(data.reservations);
      setGuests(data.guests);
      setRooms(data.rooms);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Unable to load reservations');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void loadData(); }, [loadData]);

  const guestMap = useMemo(() => new Map(guests.map((guest) => [guest._id, guest])), [guests]);
  const roomMap = useMemo(() => new Map(rooms.map((room) => [room._id, room])), [rooms]);
  const viewReservations = reservations.map((reservation) => {
    const guest = guestMap.get(reservation.guestId);
    const room = roomMap.get(reservation.roomId);
    const checkIn = new Date(reservation.checkInDate);
    const checkOut = new Date(reservation.checkOutDate);
    return {
      id: reservation._id,
      reservationId: reservation._id.slice(-8).toUpperCase(),
      guestName: reservation.guestName || (guest ? `${guest.firstName} ${guest.lastName}`.trim() : 'Guest'),
      email: guest?.email ?? '',
      roomNumber: room?.roomNumber ?? '—',
      checkIn: Number.isFinite(checkIn.getTime()) ? checkIn.toLocaleDateString('en-NG') : '—',
      checkOut: Number.isFinite(checkOut.getTime()) ? checkOut.toLocaleDateString('en-NG') : '—',
      nights: Number.isFinite(checkIn.getTime()) && Number.isFinite(checkOut.getTime()) ? Math.max(1, Math.ceil((checkOut.getTime() - checkIn.getTime()) / 86_400_000)) : 0,
      totalPrice: Number(reservation.totalPrice ?? 0),
      status: reservation.status,
    };
  });

  const handleAddReservation = async (data: ReservationInput) => {
    const token = localStorage.getItem('accessToken');
    const response = await fetch('/api/reservations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token ?? ''}` },
      body: JSON.stringify(data),
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error ?? 'Unable to create reservation');
    setShowModal(false);
    setNotice('Reservation saved. Room remains available until the guest checks in.');
    await loadData();
  };

  const bookableRooms = rooms.filter((room) => !['maintenance', 'cleaning'].includes(room.status));

  return (
    <div className="mx-auto max-w-[1400px] space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold gradient-text mb-2">Reservations</h1>
          <p className="text-muted-foreground">Manage bookings, arrivals, and expected departures.</p>
        </div>
        <button onClick={() => { setNotice(''); setShowModal(true); }} className="min-h-10 shrink-0 rounded-xl bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground transition-all hover:shadow-lg hover:shadow-primary/25 sm:px-4 sm:text-sm" disabled={loading}>
          + New Reservation
        </button>
      </div>
      {error && <p role="alert" className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">{error}</p>}
      {notice && <p role="status" className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-400">{notice}</p>}
      {loading ? (
        <div className="card-premium p-10 text-center text-sm text-muted-foreground">Loading reservations…</div>
      ) : viewReservations.length ? (
        <ReservationsList reservations={viewReservations} />
      ) : (
        <div className="card-premium p-10 text-center">
          <p className="font-medium text-foreground">No reservations yet</p>
          <p className="mt-1 text-sm text-muted-foreground">Create a reservation to see arrivals and availability reflected across the hotel.</p>
        </div>
      )}
      {showModal && (
        <CreateReservationModal
          onClose={() => setShowModal(false)}
          onSubmit={handleAddReservation}
          guests={guests}
          rooms={bookableRooms}
        />
      )}
    </div>
  );
}
