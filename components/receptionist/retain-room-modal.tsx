'use client';

import { FormEvent, useState } from 'react';
import { BedDouble, CalendarClock, X } from 'lucide-react';

type RetainRoomReservation = {
  _id: string;
  checkInDate: string;
  checkOutDate: string;
};
type RetainRoomDetails = { guestName: string; roomNumber: string; roomType: string; nightlyRate: number };

interface RetainRoomModalProps {
  reservation: RetainRoomReservation;
  details: RetainRoomDetails;
  onClose: () => void;
  onSubmit: (newCheckOutDate: string, reason: string) => Promise<void>;
}

function toLocalDateTime(value: string) {
  const date = new Date(value);
  if (!Number.isFinite(date.getTime())) return '';
  const pad = (part: number) => String(part).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export default function RetainRoomModal({ reservation, details, onClose, onSubmit }: RetainRoomModalProps) {
  const [newCheckout, setNewCheckout] = useState(() => {
    const current = new Date(reservation.checkOutDate);
    current.setDate(current.getDate() + 1);
    return toLocalDateTime(current.toISOString());
  });
  const [reason, setReason] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const proposedDate = new Date(newCheckout);
  const difference = proposedDate.getTime() - new Date(reservation.checkOutDate).getTime();
  const additionalNights = difference > 0 ? Math.ceil(difference / 86_400_000) : 0;
  const estimatedCharge = details.nightlyRate > 0 ? details.nightlyRate * additionalNights : null;

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (saving) return;
    const currentCheckout = new Date(reservation.checkOutDate);
    if (!Number.isFinite(proposedDate.getTime()) || proposedDate <= currentCheckout) {
      setError('Choose a checkout date and time later than the current expected checkout.');
      return;
    }
    if (!window.confirm(`Extend ${details.guestName}'s stay in room ${details.roomNumber} until ${proposedDate.toLocaleString()}?`)) return;
    setSaving(true);
    setError('');
    try {
      await onSubmit(proposedDate.toISOString(), reason.trim());
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Unable to extend this stay.');
    } finally {
      setSaving(false);
    }
  };

  const inputClass = 'mt-1.5 w-full rounded-xl border border-border bg-secondary px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50';
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4" onMouseDown={(event) => { if (event.target === event.currentTarget && !saving) onClose(); }}>
      <section role="dialog" aria-modal="true" aria-labelledby="retain-room-title" className="max-h-[92vh] w-full max-w-xl overflow-y-auto rounded-2xl border border-border bg-card shadow-2xl">
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <div><h2 id="retain-room-title" className="text-lg font-bold text-foreground">Retain Room</h2><p className="mt-1 text-xs text-muted-foreground">Extend the active stay in the guest’s current room.</p></div>
          <button type="button" onClick={onClose} disabled={saving} aria-label="Close retain room form" className="rounded-lg p-2 text-muted-foreground hover:bg-secondary disabled:opacity-50"><X size={17} /></button>
        </div>
        <form onSubmit={submit} className="space-y-5 p-6">
          <div className="grid grid-cols-2 gap-3 rounded-xl border border-border bg-secondary/40 p-4 text-sm">
            <p><span className="block text-xs text-muted-foreground">Guest</span><strong className="text-foreground">{details.guestName}</strong></p>
            <p><span className="block text-xs text-muted-foreground">Room</span><strong className="inline-flex items-center gap-1 text-foreground"><BedDouble size={14} /> {details.roomNumber} · {details.roomType}</strong></p>
            <p><span className="block text-xs text-muted-foreground">Checked in</span><strong className="text-foreground">{new Date(reservation.checkInDate).toLocaleString()}</strong></p>
            <p><span className="block text-xs text-muted-foreground">Current checkout</span><strong className="text-foreground">{new Date(reservation.checkOutDate).toLocaleString()}</strong></p>
          </div>
          <label className="block text-xs font-medium text-muted-foreground">New expected checkout *
            <input required type="datetime-local" min={toLocalDateTime(reservation.checkOutDate)} value={newCheckout} onChange={(event) => setNewCheckout(event.target.value)} className={inputClass} />
          </label>
          <div className="grid grid-cols-2 gap-3 rounded-xl border border-primary/20 bg-primary/5 p-4">
            <p className="text-xs text-muted-foreground"><CalendarClock size={14} className="mb-1 text-primary" /> Additional nights<strong className="block text-base text-foreground">{additionalNights || '—'}</strong></p>
            <p className="text-xs text-muted-foreground">Current room rate<strong className="block text-base text-foreground">{details.nightlyRate > 0 ? `₦${details.nightlyRate.toLocaleString()}/night` : 'Not available'}</strong></p>
            <p className="col-span-2 text-xs text-muted-foreground">Estimated additional accommodation charge<strong className="block text-base text-foreground">{estimatedCharge === null ? 'Not available' : `₦${estimatedCharge.toLocaleString()}`}</strong></p>
          </div>
          <label className="block text-xs font-medium text-muted-foreground">Reason or notes (optional)
            <textarea maxLength={1000} rows={3} value={reason} onChange={(event) => setReason(event.target.value)} className={inputClass} />
          </label>
          {error && <p role="alert" className="rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-400">{error}</p>}
          <div className="flex justify-end gap-3 border-t border-border pt-4">
            <button type="button" onClick={onClose} disabled={saving} className="rounded-xl border border-border px-4 py-2.5 text-sm text-foreground hover:bg-secondary disabled:opacity-50">Cancel</button>
            <button type="submit" disabled={saving || !additionalNights} className="rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground disabled:opacity-50">{saving ? 'Extending…' : 'Confirm Extension'}</button>
          </div>
        </form>
      </section>
    </div>
  );
}
