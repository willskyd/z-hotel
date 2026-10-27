'use client';

import { FormEvent, useState } from 'react';

type ReservationGuest = { _id: string; firstName: string; lastName: string; email?: string };
type ReservationRoom = { _id: string; roomNumber: string; type: string; capacity: number; pricePerNight: number; status: string };
type ReservationInput = {
  guestId: string;
  roomId: string;
  checkInDate: string;
  checkOutDate: string;
  numberOfGuests: number;
  totalPrice: number;
  notes: string;
};

interface CreateReservationModalProps {
  onClose: () => void;
  onSubmit: (data: ReservationInput) => Promise<void>;
  guests: ReservationGuest[];
  rooms: ReservationRoom[];
}

const localDate = (date: Date) => {
  const pad = (value: number) => String(value).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
};

export default function CreateReservationModal({ onClose, onSubmit, guests, rooms }: CreateReservationModalProps) {
  const today = localDate(new Date());
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const [formData, setFormData] = useState({
    guestId: '', roomId: '', checkInDate: today, checkOutDate: localDate(tomorrow),
    numberOfGuests: '1', totalPrice: '', notes: '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const selectedRoom = rooms.find((room) => room._id === formData.roomId);
  const nights = Math.max(1, Math.ceil((new Date(formData.checkOutDate).getTime() - new Date(formData.checkInDate).getTime()) / 86_400_000));
  const total = formData.totalPrice === '' ? (selectedRoom?.pricePerNight ?? 0) * nights : Number(formData.totalPrice);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (saving) return;
    if (new Date(formData.checkOutDate) <= new Date(formData.checkInDate)) {
      setError('Checkout must be after check-in.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      await onSubmit({
        guestId: formData.guestId,
        roomId: formData.roomId,
        checkInDate: new Date(`${formData.checkInDate}T14:00:00`).toISOString(),
        checkOutDate: new Date(`${formData.checkOutDate}T11:00:00`).toISOString(),
        numberOfGuests: Number(formData.numberOfGuests),
        totalPrice: total,
        notes: formData.notes,
      });
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Unable to create reservation.');
    } finally {
      setSaving(false);
    }
  };

  const inputClass = 'mt-1.5 w-full rounded-xl border border-border bg-secondary px-3.5 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onMouseDown={(event) => { if (event.target === event.currentTarget && !saving) onClose(); }}>
      <section role="dialog" aria-modal="true" aria-labelledby="reservation-title" className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-2xl border border-border bg-card p-6 shadow-2xl">
        <h2 id="reservation-title" className="text-xl font-bold text-foreground">New Reservation</h2>
        <p className="mb-5 mt-1 text-sm text-muted-foreground">Choose a registered guest and a room for the stay.</p>
        {guests.length === 0 && <p className="mb-4 rounded-lg bg-amber-500/10 p-3 text-sm text-amber-400">Register a guest before creating a reservation.</p>}
        {rooms.length === 0 && <p className="mb-4 rounded-lg bg-amber-500/10 p-3 text-sm text-amber-400">No rooms are currently available to book.</p>}
        <form onSubmit={submit} className="space-y-4">
          <label className="block text-xs font-medium text-muted-foreground">Guest *
            <select required value={formData.guestId} onChange={(event) => setFormData({ ...formData, guestId: event.target.value })} className={inputClass}>
              <option value="">Select guest</option>
              {guests.map((guest) => <option key={guest._id} value={guest._id}>{guest.firstName} {guest.lastName}{guest.email ? ` · ${guest.email}` : ''}</option>)}
            </select>
          </label>
          <label className="block text-xs font-medium text-muted-foreground">Room *
            <select required value={formData.roomId} onChange={(event) => setFormData({ ...formData, roomId: event.target.value, totalPrice: '' })} className={inputClass}>
              <option value="">Select room</option>
              {rooms.map((room) => <option key={room._id} value={room._id}>Room {room.roomNumber} · {room.type} · max {room.capacity} guests</option>)}
            </select>
          </label>
          <div className="grid grid-cols-2 gap-4">
            <label className="text-xs font-medium text-muted-foreground">Check-in *
              <input required type="date" min={today} value={formData.checkInDate} onChange={(event) => setFormData({ ...formData, checkInDate: event.target.value })} className={inputClass} />
            </label>
            <label className="text-xs font-medium text-muted-foreground">Checkout *
              <input required type="date" min={formData.checkInDate} value={formData.checkOutDate} onChange={(event) => setFormData({ ...formData, checkOutDate: event.target.value })} className={inputClass} />
            </label>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <label className="text-xs font-medium text-muted-foreground">Number of guests *
              <input required type="number" min="1" max={selectedRoom?.capacity ?? 30} value={formData.numberOfGuests} onChange={(event) => setFormData({ ...formData, numberOfGuests: event.target.value })} className={inputClass} />
            </label>
            <label className="text-xs font-medium text-muted-foreground">Total price (₦)
              <input type="number" min="0" step="0.01" value={formData.totalPrice === '' ? total : formData.totalPrice} onChange={(event) => setFormData({ ...formData, totalPrice: event.target.value })} className={inputClass} />
            </label>
          </div>
          <label className="block text-xs font-medium text-muted-foreground">Notes (optional)
            <textarea maxLength={1000} rows={3} value={formData.notes} onChange={(event) => setFormData({ ...formData, notes: event.target.value })} className={inputClass} />
          </label>
          {error && <p role="alert" className="text-sm text-red-400">{error}</p>}
          <div className="flex justify-end gap-3 border-t border-border pt-4">
            <button type="button" onClick={onClose} disabled={saving} className="rounded-xl border border-border px-4 py-2.5 text-sm text-foreground hover:bg-secondary disabled:opacity-50">Cancel</button>
            <button type="submit" disabled={saving || guests.length === 0 || rooms.length === 0} className="rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground disabled:opacity-50">{saving ? 'Saving…' : 'Create Reservation'}</button>
          </div>
        </form>
      </section>
    </div>
  );
}
