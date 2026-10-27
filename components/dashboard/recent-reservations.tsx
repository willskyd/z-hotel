'use client';

import { ArrowRight, ChevronDown } from 'lucide-react';
import { formatNaira } from '@/lib/utils';
import { useRouter } from 'next/navigation';

interface Reservation {
  id: string;
  guestName: string;
  roomNumber: string;
  checkIn: string;
  checkOut: string;
  status: string;
  amount?: number;
}

const STATUS_MAP: Record<string, { label: string; classes: string }> = {
  'checked-in': { label: 'Checked In', classes: 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/25' },
  'in-house': { label: 'In House', classes: 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/25' },
  confirmed: { label: 'Confirmed', classes: 'bg-blue-500/15 text-blue-400 border border-blue-500/25' },
  pending: { label: 'Pending', classes: 'bg-amber-500/15 text-amber-400 border border-amber-500/25' },
  'checked-out': { label: 'Checked Out', classes: 'bg-muted/60 text-muted-foreground border border-border' },
  cancelled: { label: 'Cancelled', classes: 'bg-red-500/15 text-red-400 border border-red-500/25' },
  canceled: { label: 'Cancelled', classes: 'bg-red-500/15 text-red-400 border border-red-500/25' },
};

function getStatus(status: string) {
  const normalized = status.trim().toLowerCase().replace(/[_\s]+/g, '-');
  return STATUS_MAP[normalized] ?? {
    label: normalized ? normalized.replace(/-/g, ' ').replace(/\b\w/g, (letter) => letter.toUpperCase()) : 'Unknown',
    classes: 'bg-muted/60 text-muted-foreground border border-border',
  };
}

export default function RecentReservations({ reservations }: { reservations: Reservation[] }) {
  const router = useRouter();
  return (
    <div className="bg-card border border-border rounded-2xl overflow-hidden hover:border-primary/20 transition-all duration-300">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 px-4 py-3 border-b border-border sm:px-6 sm:py-4">
        <h3 className="min-w-0 text-sm font-semibold text-foreground">Recent Reservations</h3>
        <button
          onClick={() => router.push('/dashboard/reservations')}
          className="shrink-0 text-[11px] text-primary hover:text-accent flex items-center gap-1 transition-colors font-medium sm:text-xs"
        >
          View All <ArrowRight size={12} />
        </button>
      </div>

      <div className="divide-y divide-border/60 lg:hidden">
        {reservations.map((reservation) => {
          const status = getStatus(reservation.status);
          const initials = reservation.guestName.trim().split(/\s+/).filter(Boolean).map((name) => name[0]).join('').slice(0, 2) || 'G';
          return (
            <article key={reservation.id} className="min-w-0 px-4 py-3">
              <div className="flex min-w-0 items-start justify-between gap-2.5">
                <div className="flex min-w-0 items-center gap-2.5">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-primary/20 bg-primary/15 text-[10px] font-bold text-primary">{initials}</div>
                  <div className="min-w-0"><p className="break-words text-xs font-semibold text-foreground">{reservation.guestName}</p><p className="mt-0.5 text-[10px] text-muted-foreground">Room #{reservation.roomNumber}</p></div>
                </div>
                <span title={status.label} className={`max-w-[45%] shrink-0 truncate rounded-full px-2 py-1 text-[9px] font-semibold leading-none ${status.classes}`}>{status.label}</span>
              </div>
              <details className="group mt-2 border-t border-border/60 pt-1">
                <summary className="flex min-h-8 cursor-pointer list-none items-center justify-between text-[10px] font-semibold text-primary [&::-webkit-details-marker]:hidden">
                  Details<ChevronDown size={13} className="transition-transform group-open:rotate-180" />
                </summary>
                <div className="grid grid-cols-2 gap-2 pb-1 text-[10px]">
                  <div className="min-w-0"><p className="text-muted-foreground">Check-in</p><p className="break-words text-foreground">{reservation.checkIn}</p></div>
                  <div className="min-w-0"><p className="text-muted-foreground">Check-out</p><p className="break-words text-foreground">{reservation.checkOut}</p></div>
                  <div className="min-w-0"><p className="text-muted-foreground">Amount</p><p className="break-words font-semibold text-foreground">{reservation.amount != null ? formatNaira(reservation.amount) : 'Not recorded'}</p></div>
                </div>
              </details>
            </article>
          );
        })}
        {reservations.length === 0 && <p className="p-5 text-center text-xs text-muted-foreground">No recent reservations.</p>}
      </div>

      {/* Compact table for wider screens */}
      <div className="hidden overflow-x-auto lg:block">
        <table className="w-full table-fixed">
          <thead>
            <tr className="border-b border-border/60">
              <th className="w-[29%] px-4 py-2.5 text-left text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Guest</th>
              <th className="w-[11%] px-2 py-2.5 text-left text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Room</th>
              <th className="w-[15%] px-2 py-2.5 text-left text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Check-In</th>
              <th className="w-[15%] px-2 py-2.5 text-left text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Check-Out</th>
              <th className="w-[15%] px-2 py-2.5 text-left text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Amount</th>
              <th className="w-[15%] px-2 py-2.5 text-left text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Status</th>
            </tr>
          </thead>
          <tbody>
            {reservations.map((r, i) => {
              const s = getStatus(r.status);
              return (
                <tr
                  key={r.id}
                  className={`hover:bg-secondary/40 transition-colors cursor-pointer ${i < reservations.length - 1 ? 'border-b border-border/40' : ''}`}
                >
                  <td className="min-w-0 px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-primary/15 border border-primary/20 flex items-center justify-center text-xs font-bold text-primary shrink-0">
                        {r.guestName.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                      </div>
                      <span className="min-w-0 break-words text-xs font-medium text-foreground">{r.guestName}</span>
                    </div>
                  </td>
                  <td className="break-words px-2 py-3 text-xs font-mono text-foreground">#{r.roomNumber}</td>
                  <td className="break-words px-2 py-3 text-[11px] text-muted-foreground">{r.checkIn}</td>
                  <td className="break-words px-2 py-3 text-[11px] text-muted-foreground">{r.checkOut}</td>
                  <td className="break-words px-2 py-3 text-xs font-semibold text-foreground">
                    {r.amount != null ? formatNaira(r.amount) : '—'}
                  </td>
                  <td className="px-2 py-3">
                    <span title={s.label} className={`inline-flex max-w-full truncate whitespace-nowrap text-[9px] font-semibold px-2 py-1 rounded-full ${s.classes}`}>
                      {s.label}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
