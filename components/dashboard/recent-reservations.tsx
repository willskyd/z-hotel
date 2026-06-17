'use client';

import { ArrowRight } from 'lucide-react';
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
  confirmed: { label: 'Confirmed', classes: 'bg-blue-500/15 text-blue-400 border border-blue-500/25' },
  pending: { label: 'Pending', classes: 'bg-amber-500/15 text-amber-400 border border-amber-500/25' },
  'checked-out': { label: 'Checked Out', classes: 'bg-muted/60 text-muted-foreground border border-border' },
  cancelled: { label: 'Cancelled', classes: 'bg-red-500/15 text-red-400 border border-red-500/25' },
};

export default function RecentReservations({ reservations }: { reservations: Reservation[] }) {
  const router = useRouter();
  return (
    <div className="bg-card border border-border rounded-2xl overflow-hidden hover:border-primary/20 transition-all duration-300">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-border">
        <h3 className="text-sm font-semibold text-foreground">Recent Reservations</h3>
        <button
          onClick={() => router.push('/dashboard/reservations')}
          className="text-xs text-primary hover:text-accent flex items-center gap-1 transition-colors font-medium"
        >
          View All <ArrowRight size={12} />
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border/60">
              <th className="px-6 py-3 text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Guest</th>
              <th className="px-4 py-3 text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Room</th>
              <th className="px-4 py-3 text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Check-In</th>
              <th className="px-4 py-3 text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Check-Out</th>
              <th className="px-4 py-3 text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Amount</th>
              <th className="px-4 py-3 text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Status</th>
            </tr>
          </thead>
          <tbody>
            {reservations.map((r, i) => {
              const s = STATUS_MAP[r.status] ?? STATUS_MAP['pending'];
              return (
                <tr
                  key={r.id}
                  className={`hover:bg-secondary/40 transition-colors cursor-pointer ${i < reservations.length - 1 ? 'border-b border-border/40' : ''}`}
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-primary/15 border border-primary/20 flex items-center justify-center text-xs font-bold text-primary shrink-0">
                        {r.guestName.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                      </div>
                      <span className="font-medium text-foreground text-sm">{r.guestName}</span>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-sm font-mono text-foreground">#{r.roomNumber}</td>
                  <td className="px-4 py-4 text-sm text-muted-foreground">{r.checkIn}</td>
                  <td className="px-4 py-4 text-sm text-muted-foreground">{r.checkOut}</td>
                  <td className="px-4 py-4 text-sm font-semibold text-foreground">
                    {r.amount ? formatNaira(r.amount) : '—'}
                  </td>
                  <td className="px-4 py-4">
                    <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full ${s.classes}`}>
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
