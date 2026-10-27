'use client';

import { useEffect, useState } from 'react';
import { ChevronDown, ChevronLeft, ChevronRight, Clock3, Search } from 'lucide-react';

type CheckoutExtension = {
  extensionId?: string;
  previousExpectedCheckout?: string;
  newExpectedCheckout?: string;
  extendedAt?: string;
  staff?: { email?: string; role?: string };
  reason?: string;
  additionalNights?: number;
  nightlyRate?: number | null;
  estimatedAdditionalCharge?: number | null;
};
type CheckoutRecord = {
  _id: string;
  stayReference?: string;
  guestId?: string;
  guestReference?: string;
  roomId?: string;
  roomReference?: string;
  guestName?: string;
  guestEmail?: string;
  guestPhone?: string;
  roomNumber?: string;
  roomType?: string;
  checkInDate?: string;
  actualCheckInAt?: string;
  checkOutDate?: string;
  expectedCheckOutAtCheckout?: string;
  originalExpectedCheckout?: string;
  actualCheckOutAt?: string;
  numberOfGuests?: number;
  totalPrice?: number;
  status?: string;
  originalStatus?: string;
  extensions?: CheckoutExtension[];
  checkoutNotes?: string;
  checkoutProcessedBy?: { email?: string; role?: string };
  roomRate?: number;
  outstandingBalance?: number;
  payments?: number | Array<{ amount?: number }>;
};
type HistoryResponse = {
  records: CheckoutRecord[];
  pagination: { page: number; limit: number; total: number; totalPages: number };
};
type RoomFilter = { roomNumber: string; type: string };

interface CheckoutHistoryProps {
  rooms: RoomFilter[];
  refreshKey: number;
}

const formatValue = (value?: string) => {
  if (!value) return 'Not recorded';
  const date = new Date(value);
  return Number.isFinite(date.getTime()) ? date.toLocaleString('en-NG') : 'Not recorded';
};
const guestName = (record: CheckoutRecord) => record.guestName?.trim() || 'Guest name unavailable';
const getNightCount = (record: CheckoutRecord) => {
  const actualStart = record.actualCheckInAt ? new Date(record.actualCheckInAt) : null;
  const actualEnd = record.actualCheckOutAt ? new Date(record.actualCheckOutAt) : null;
  if (actualStart && actualEnd && Number.isFinite(actualStart.getTime()) && Number.isFinite(actualEnd.getTime())) {
    const duration = actualEnd.getTime() - actualStart.getTime();
    if (duration > 0) return { label: 'Nights stayed (actual timestamps)', value: Math.ceil(duration / 86_400_000) };
  }
  const scheduledStart = record.checkInDate ? new Date(record.checkInDate) : null;
  const expectedEnd = record.expectedCheckOutAtCheckout ?? record.checkOutDate;
  const scheduledEnd = expectedEnd ? new Date(expectedEnd) : null;
  if (scheduledStart && scheduledEnd && Number.isFinite(scheduledStart.getTime()) && Number.isFinite(scheduledEnd.getTime())) {
    const duration = scheduledEnd.getTime() - scheduledStart.getTime();
    if (duration > 0) return { label: 'Nights (scheduled dates)', value: Math.ceil(duration / 86_400_000) };
  }
  return { label: 'Nights', value: 'Not recorded' };
};

export default function CheckoutHistory({ rooms, refreshKey }: CheckoutHistoryProps) {
  const [records, setRecords] = useState<CheckoutRecord[]>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [search, setSearch] = useState('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [roomNumber, setRoomNumber] = useState('');
  const [roomType, setRoomType] = useState('');
  const [sort, setSort] = useState<'newest' | 'oldest'>('newest');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [attempt, setAttempt] = useState(0);
  const [selected, setSelected] = useState<CheckoutRecord | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      setLoading(true);
      setError('');
      const params = new URLSearchParams({
        view: 'checkout-history',
        page: String(page),
        limit: '20',
      });
      if (search.trim()) params.set('search', search.trim());
      if (from) params.set('from', new Date(`${from}T00:00:00`).toISOString());
      if (to) params.set('to', new Date(`${to}T23:59:59.999`).toISOString());
      if (roomNumber) params.set('roomNumber', roomNumber);
      if (roomType) params.set('roomType', roomType);
      params.set('sort', sort);
      try {
        const token = localStorage.getItem('accessToken');
        const response = await fetch(`/api/receptionist?${params.toString()}`, {
          headers: { Authorization: `Bearer ${token ?? ''}` },
          cache: 'no-store',
          signal: controller.signal,
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error ?? 'Unable to load checkout history');
        const result = data as HistoryResponse;
        setRecords(result.records);
        setTotal(result.pagination.total);
        setTotalPages(result.pagination.totalPages);
      } catch (cause) {
        if (cause instanceof DOMException && cause.name === 'AbortError') return;
        setError(cause instanceof Error ? cause.message : 'Unable to load checkout history');
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }, 250);
    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [page, search, from, to, roomNumber, roomType, sort, refreshKey, attempt]);

  const resetPage = (update: () => void) => {
    update();
    setPage(1);
  };
  const totalPaid = (record: CheckoutRecord) => {
    if (typeof record.payments === 'number') return record.payments;
    if (Array.isArray(record.payments)) {
      return record.payments.reduce((sum, payment) => sum + Number(payment.amount ?? 0), 0);
    }
    return null;
  };
  const selectedNights = selected ? getNightCount(selected) : null;

  return (
    <section className="overflow-hidden rounded-2xl border border-border bg-card">
      <div className="border-b border-border p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-foreground">Checkout History</h2>
            <p className="mt-1 text-sm text-muted-foreground">Completed stays, newest checkout first. Historical fields are shown only when recorded.</p>
          </div>
          <span className="rounded-full border border-border bg-secondary px-3 py-1 text-xs text-muted-foreground">{total} completed stays</span>
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-7">
          <label className="flex items-center gap-2 rounded-xl border border-border bg-secondary/50 px-3 py-2 lg:col-span-2">
            <Search size={14} className="shrink-0 text-muted-foreground" />
            <input value={search} onChange={(event) => resetPage(() => setSearch(event.target.value))} className="min-w-0 flex-1 bg-transparent text-sm text-foreground outline-none" placeholder="Guest, room, guest ID or stay ref" aria-label="Search checkout history" />
          </label>
          <label className="text-xs text-muted-foreground">Checkout from
            <input type="date" value={from} onChange={(event) => resetPage(() => setFrom(event.target.value))} className="mt-1 w-full rounded-xl border border-border bg-secondary px-2.5 py-2 text-sm text-foreground" />
          </label>
          <label className="text-xs text-muted-foreground">Checkout to
            <input type="date" value={to} min={from || undefined} onChange={(event) => resetPage(() => setTo(event.target.value))} className="mt-1 w-full rounded-xl border border-border bg-secondary px-2.5 py-2 text-sm text-foreground" />
          </label>
          <label className="text-xs text-muted-foreground">Room
            <select value={roomNumber} onChange={(event) => resetPage(() => setRoomNumber(event.target.value))} className="mt-1 w-full rounded-xl border border-border bg-secondary px-2.5 py-2 text-sm text-foreground">
              <option value="">All rooms</option>
              {rooms.map((room) => <option key={room.roomNumber} value={room.roomNumber}>{room.roomNumber}</option>)}
            </select>
          </label>
          <label className="text-xs text-muted-foreground">Room type
            <select value={roomType} onChange={(event) => resetPage(() => setRoomType(event.target.value))} className="mt-1 w-full rounded-xl border border-border bg-secondary px-2.5 py-2 text-sm text-foreground">
              <option value="">All types</option>
              {[...new Set(rooms.map((room) => room.type).filter(Boolean))].sort().map((type) => <option key={type} value={type}>{type}</option>)}
            </select>
          </label>
          <label className="text-xs text-muted-foreground">Sort by checkout
            <select value={sort} onChange={(event) => resetPage(() => setSort(event.target.value as 'newest' | 'oldest'))} className="mt-1 w-full rounded-xl border border-border bg-secondary px-2.5 py-2 text-sm text-foreground">
              <option value="newest">Newest first</option>
              <option value="oldest">Oldest first</option>
            </select>
          </label>
        </div>
      </div>

      {error ? (
        <div className="p-10 text-center">
          <p role="alert" className="text-sm text-red-400">{error}</p>
          <button onClick={() => setAttempt((value) => value + 1)} className="mt-3 rounded-lg border border-border px-3 py-2 text-sm text-foreground hover:bg-secondary">Retry</button>
        </div>
      ) : loading ? (
        <div className="p-10 text-center text-sm text-muted-foreground">Loading checkout history…</div>
      ) : records.length === 0 ? (
        <div className="p-10 text-center">
          <Clock3 size={28} className="mx-auto mb-2 text-muted-foreground/60" />
          <p className="text-sm font-medium text-foreground">No completed checkouts found</p>
          <p className="mt-1 text-xs text-muted-foreground">Try changing the search or date filters.</p>
        </div>
      ) : (
        <>
          <div className="divide-y divide-border/70">
            {records.map((record) => (
              <article key={record._id} className="min-w-0 p-4 hover:bg-secondary/20">
                <div className="flex min-w-0 flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="break-words font-semibold text-foreground">{guestName(record)}</p>
                    <p className="mt-1 break-words text-xs text-muted-foreground">Room {record.roomNumber ?? 'Not recorded'} · {record.roomType ?? 'Type unavailable'}</p>
                    <p className="mt-1 break-all font-mono text-[10px] text-muted-foreground">Ref {record.stayReference ?? record._id}</p>
                  </div>
                  <div className="shrink-0 text-left sm:text-right">
                    <p className="text-[11px] text-muted-foreground">Actual checkout</p>
                    <p className="text-sm font-medium text-foreground">{formatValue(record.actualCheckOutAt)}</p>
                  </div>
                </div>
                <details className="group mt-2 border-t border-border/70 pt-2">
                  <summary className="flex min-h-9 cursor-pointer list-none items-center justify-between text-xs font-semibold text-primary [&::-webkit-details-marker]:hidden">
                    Details<ChevronDown size={14} className="transition-transform group-open:rotate-180" />
                  </summary>
                  <div className="grid grid-cols-2 gap-x-3 gap-y-3 rounded-xl border border-border bg-secondary/30 p-3 text-xs sm:grid-cols-3">
                    {[
                      ['Guest contact', record.guestPhone || record.guestEmail || 'Not recorded'],
                      ['Room', record.roomNumber ? `${record.roomNumber} · ${record.roomType ?? 'Type unavailable'}` : record.roomReference ?? record.roomId ?? 'Not recorded'],
                      ['Scheduled check-in', formatValue(record.checkInDate)],
                      ['Actual check-in', formatValue(record.actualCheckInAt)],
                      ['Original expected checkout', formatValue(record.originalExpectedCheckout ?? record.checkOutDate)],
                      ['Expected checkout', formatValue(record.expectedCheckOutAtCheckout ?? record.checkOutDate)],
                      ['Actual checkout', formatValue(record.actualCheckOutAt)],
                      ['Stay status', record.originalStatus ? `${record.originalStatus} → ${record.status ?? 'checked-out'}` : record.status ?? 'Not recorded'],
                      ['Guests', record.numberOfGuests == null ? 'Not recorded' : String(record.numberOfGuests)],
                      ['Stay total', record.totalPrice == null ? 'Not recorded' : `₦${record.totalPrice.toLocaleString()}`],
                      ['Room rate', record.roomRate == null ? 'Not recorded' : `₦${record.roomRate.toLocaleString()}`],
                      ['Payments', totalPaid(record) == null ? 'Not recorded' : `₦${totalPaid(record)?.toLocaleString()}`],
                      ['Balance', record.outstandingBalance == null ? 'Not recorded' : `₦${record.outstandingBalance.toLocaleString()}`],
                      ['Processed by', record.checkoutProcessedBy?.email ?? 'Not recorded'],
                    ].map(([label, value]) => (
                      <div key={label} className="min-w-0"><p className="text-muted-foreground">{label}</p><p className="mt-0.5 break-words text-foreground">{value || 'Not recorded'}</p></div>
                    ))}
                    {record.checkoutNotes && <div className="col-span-2 min-w-0 sm:col-span-3"><p className="text-muted-foreground">Checkout notes</p><p className="mt-0.5 whitespace-pre-wrap break-words text-foreground">{record.checkoutNotes}</p></div>}
                    <div className="col-span-2 min-w-0 sm:col-span-3">
                      <p className="mb-1 font-medium text-foreground">Stay extensions ({record.extensions?.length ?? 0})</p>
                      {!record.extensions?.length ? <p className="text-muted-foreground">No extension history recorded.</p> : record.extensions.map((extension, index) => (
                        <p key={extension.extensionId ?? `${extension.extendedAt}-${index}`} className="mb-1 break-words text-muted-foreground">
                          {formatValue(extension.previousExpectedCheckout)} → {formatValue(extension.newExpectedCheckout)} · {formatValue(extension.extendedAt)} · {extension.staff?.email ?? 'Staff not recorded'}{extension.reason ? ` · ${extension.reason}` : ''}
                        </p>
                      ))}
                    </div>
                    <button type="button" onClick={() => setSelected(record)} className="col-span-2 min-h-9 rounded-lg border border-border font-medium text-foreground hover:bg-secondary sm:col-span-3">Open full record</button>
                  </div>
                </details>
              </article>
            ))}
          </div>
          <div className="flex items-center justify-between border-t border-border px-4 py-3">
            <p className="text-xs text-muted-foreground">Page {page} of {Math.max(1, totalPages)} · {total} records</p>
            <div className="flex gap-2">
              <button onClick={() => setPage((value) => Math.max(1, value - 1))} disabled={page <= 1 || loading} aria-label="Previous history page" className="rounded-lg border border-border p-2 text-foreground hover:bg-secondary disabled:opacity-40"><ChevronLeft size={16} /></button>
              <button onClick={() => setPage((value) => Math.min(totalPages, value + 1))} disabled={page >= totalPages || loading} aria-label="Next history page" className="rounded-lg border border-border p-2 text-foreground hover:bg-secondary disabled:opacity-40"><ChevronRight size={16} /></button>
            </div>
          </div>
        </>
      )}

      {selected && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 p-4" onMouseDown={(event) => { if (event.target === event.currentTarget) setSelected(null); }}>
          <section role="dialog" aria-modal="true" aria-labelledby="checkout-history-title" className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-border bg-card shadow-2xl">
            <div className="sticky top-0 flex items-center justify-between border-b border-border bg-card px-6 py-4">
              <div><h3 id="checkout-history-title" className="text-lg font-bold text-foreground">Checkout Record</h3><p className="mt-1 text-xs text-muted-foreground">Stay {selected.stayReference ?? selected._id}</p></div>
              <button onClick={() => setSelected(null)} aria-label="Close checkout details" className="rounded-lg border border-border px-3 py-2 text-sm text-foreground hover:bg-secondary">Close</button>
            </div>
            <div className="grid gap-4 p-6 sm:grid-cols-2">
              {selectedNights && <div><p className="text-xs text-muted-foreground">{selectedNights.label}</p><p className="mt-1 text-sm text-foreground">{selectedNights.value}</p></div>}
              {[
                ['Guest', guestName(selected)],
                ['Guest reference', selected.guestReference ?? selected.guestId],
                ['Phone', selected.guestPhone],
                ['Email', selected.guestEmail],
                ['Room', selected.roomNumber ? `${selected.roomNumber} · ${selected.roomType ?? 'Type unavailable'}` : selected.roomReference ?? selected.roomId],
                ['Status', selected.originalStatus ? `${selected.originalStatus} → ${selected.status ?? 'checked-out'}` : selected.status ?? 'checked-out'],
                ['Actual check-in', formatValue(selected.actualCheckInAt)],
                ['Scheduled check-in', formatValue(selected.checkInDate)],
                ['Original expected checkout', formatValue(selected.originalExpectedCheckout ?? selected.checkOutDate)],
                ['Expected checkout at departure', formatValue(selected.expectedCheckOutAtCheckout ?? selected.checkOutDate)],
                ['Actual checkout', formatValue(selected.actualCheckOutAt)],
                ['Guests', selected.numberOfGuests == null ? 'Not recorded' : String(selected.numberOfGuests)],
                ['Room rate', selected.roomRate == null ? 'Not recorded' : `₦${selected.roomRate.toLocaleString()}`],
                ['Stay total', selected.totalPrice == null ? 'Not recorded' : `₦${selected.totalPrice.toLocaleString()}`],
                ['Payments recorded', totalPaid(selected) == null ? 'Not recorded' : `₦${totalPaid(selected)?.toLocaleString()}`],
                ['Outstanding balance', selected.outstandingBalance == null ? 'Not recorded' : `₦${selected.outstandingBalance.toLocaleString()}`],
                ['Processed by', selected.checkoutProcessedBy?.email ?? 'Not recorded'],
              ].map(([label, value]) => (
                <div key={label}><p className="text-xs text-muted-foreground">{label}</p><p className="mt-1 break-words text-sm text-foreground">{value || 'Not recorded'}</p></div>
              ))}
              <div className="sm:col-span-2"><p className="text-xs text-muted-foreground">Checkout notes</p><p className="mt-1 whitespace-pre-wrap text-sm text-foreground">{selected.checkoutNotes || 'No checkout notes recorded'}</p></div>
              <div className="sm:col-span-2">
                <h4 className="mb-2 text-sm font-semibold text-foreground">Stay extensions ({selected.extensions?.length ?? 0})</h4>
                {!selected.extensions?.length ? <p className="text-xs text-muted-foreground">No extension history recorded.</p> : (
                  <ol className="space-y-2">
                    {selected.extensions.map((extension, index) => (
                      <li key={extension.extensionId ?? `${extension.extendedAt}-${index}`} className="rounded-xl border border-border bg-secondary/30 p-3 text-xs">
                        <p className="font-mono text-[10px] text-muted-foreground">Extension {extension.extensionId ?? 'reference not recorded'}</p>
                        <p className="font-medium text-foreground">{formatValue(extension.previousExpectedCheckout)} → {formatValue(extension.newExpectedCheckout)}</p>
                        <p className="mt-1 text-muted-foreground">Extended {formatValue(extension.extendedAt)} · {extension.additionalNights ?? '—'} additional night(s) · {extension.staff?.email ?? 'Staff not recorded'}</p>
                        {extension.estimatedAdditionalCharge != null && <p className="mt-1 text-muted-foreground">Estimated charge ₦{extension.estimatedAdditionalCharge.toLocaleString()}</p>}
                        {extension.reason && <p className="mt-1 text-muted-foreground">Reason: {extension.reason}</p>}
                      </li>
                    ))}
                  </ol>
                )}
              </div>
            </div>
          </section>
        </div>
      )}
    </section>
  );
}
