'use client';

import { FormEvent, useCallback, useEffect, useMemo, useState } from 'react';
import {
  BedDouble, CalendarCheck2, CalendarClock, CalendarX2, CheckCircle2, ChevronDown,
  ConciergeBell, RefreshCw, Search, Users,
} from 'lucide-react';
import CheckoutCommentModal from '@/components/front-desk/checkout-comment-modal';
import CheckoutHistory from '@/components/receptionist/checkout-history';
import RetainRoomModal from '@/components/receptionist/retain-room-modal';

type Room = {
  _id: string;
  roomNumber: string;
  type: string;
  capacity: number;
  pricePerNight: number;
  status: string;
};
type Guest = {
  _id: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  country?: string;
};
type Reservation = {
  _id: string;
  guestId: string;
  roomId: string;
  guestName?: string;
  checkInDate: string;
  checkOutDate: string;
  actualCheckInAt?: string;
  actualCheckOutAt?: string;
  numberOfGuests?: number;
  totalPrice?: number;
  status: string;
  notes?: string;
  extensions?: Array<{
    extensionId?: string;
    previousExpectedCheckout?: string;
    newExpectedCheckout?: string;
    extendedAt?: string;
    reason?: string;
    staff?: { email?: string };
    additionalNights?: number;
    estimatedAdditionalCharge?: number | null;
  }>;
};
type ReceptionData = { rooms: Room[]; guests: Guest[]; reservations: Reservation[] };
type WalkInForm = {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  roomId: string;
  checkInDate: string;
  checkOutDate: string;
  numberOfGuests: string;
  notes: string;
};

const ACTIVE_STAYS = ['checked-in', 'checked_in', 'in-house', 'in_house'];
const isActiveStay = (status: string) => ACTIVE_STAYS.includes(status);
const displayDate = (value: string, includeTime = true) => {
  const date = new Date(value);
  return Number.isFinite(date.getTime())
    ? date.toLocaleString('en-NG', includeTime ? { dateStyle: 'medium', timeStyle: 'short' } : { dateStyle: 'medium' })
    : 'Not set';
};
const localDateTime = (date: Date) => {
  const pad = (part: number) => String(part).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
};

export default function FrontDeskPage() {
  const [data, setData] = useState<ReceptionData>({ rooms: [], guests: [], reservations: [] });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState<'arrivals' | 'upcoming' | 'departures' | 'in-house'>('arrivals');
  const [showWalkIn, setShowWalkIn] = useState(false);
  const [savingWalkIn, setSavingWalkIn] = useState(false);
  const [walkInError, setWalkInError] = useState('');
  const [checkoutTarget, setCheckoutTarget] = useState<Reservation | null>(null);
  const [retainTarget, setRetainTarget] = useState<Reservation | null>(null);
  const [historyRefreshKey, setHistoryRefreshKey] = useState(0);
  const [processingId, setProcessingId] = useState('');
  const [clock, setClock] = useState(Date.now());
  const [walkIn, setWalkIn] = useState<WalkInForm>(() => {
    const now = new Date();
    const checkout = new Date(now);
    checkout.setDate(checkout.getDate() + 1);
    checkout.setHours(11, 0, 0, 0);
    return {
      firstName: '', lastName: '', phone: '', email: '', roomId: '',
      checkInDate: localDateTime(now), checkOutDate: localDateTime(checkout),
      numberOfGuests: '1', notes: '',
    };
  });

  const loadData = useCallback(async (quiet = false) => {
    if (quiet) setRefreshing(true);
    else setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch('/api/receptionist', {
        headers: { Authorization: `Bearer ${token ?? ''}` },
        cache: 'no-store',
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error ?? 'Unable to load receptionist data');
      setData(result);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Unable to load receptionist data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    void loadData();
    const timer = window.setInterval(() => setClock(Date.now()), 60_000);
    return () => window.clearInterval(timer);
  }, [loadData]);

  const guestMap = useMemo(() => new Map(data.guests.map((guest) => [guest._id, guest])), [data.guests]);
  const roomMap = useMemo(() => new Map(data.rooms.map((room) => [room._id, room])), [data.rooms]);
  const detailsFor = (reservation: Reservation) => {
    const guest = guestMap.get(reservation.guestId);
    const room = roomMap.get(reservation.roomId);
    return {
      guestName: reservation.guestName || (guest ? `${guest.firstName} ${guest.lastName}`.trim() : 'Guest'),
      roomNumber: room?.roomNumber ?? '—',
      roomType: room?.type ?? 'Room',
      phone: guest?.phone ?? '',
      email: guest?.email ?? '',
      country: guest?.country ?? '',
      checkout: new Date(reservation.checkOutDate),
    };
  };

  const today = new Date(clock);
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const arrivals = data.reservations.filter((reservation) =>
    ['pending', 'confirmed'].includes(reservation.status) &&
    new Date(reservation.checkInDate) >= today &&
    new Date(reservation.checkInDate) < tomorrow,
  );
  const upcoming = data.reservations.filter((reservation) =>
    ['pending', 'confirmed'].includes(reservation.status) &&
    new Date(reservation.checkInDate) >= tomorrow,
  );
  const inHouse = data.reservations.filter((reservation) => isActiveStay(reservation.status));
  const departures = inHouse.filter((reservation) => new Date(reservation.checkOutDate) < tomorrow);
  const availableRooms = data.rooms.filter((room) => room.status === 'available');
  const shownReservations = (activeTab === 'arrivals' ? arrivals : activeTab === 'upcoming' ? upcoming : activeTab === 'departures' ? departures : inHouse)
    .filter((reservation) => {
      const item = detailsFor(reservation);
      const query = search.trim().toLowerCase();
      return !query || item.guestName.toLowerCase().includes(query) || item.roomNumber.toLowerCase().includes(query);
    })
    .sort((a, b) => new Date(a.checkInDate).getTime() - new Date(b.checkInDate).getTime());

  const performAction = async (action: 'check-in' | 'check-out', reservation: Reservation, notes = '') => {
    setProcessingId(reservation._id);
    setError('');
    setNotice('');
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch('/api/receptionist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token ?? ''}` },
        body: JSON.stringify({ action, reservationId: reservation._id, notes }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error ?? `Unable to ${action} guest`);
      setCheckoutTarget(null);
      setNotice(action === 'check-in' ? 'Guest checked in and room marked occupied.' : 'Checkout completed. Room is now queued for cleaning.');
      if (action === 'check-out') setHistoryRefreshKey((key) => key + 1);
      await loadData(true);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : `Unable to ${action} guest`);
    } finally {
      setProcessingId('');
    }
  };

  const extendStay = async (reservation: Reservation, newCheckOutDate: string, reason: string) => {
    const token = localStorage.getItem('accessToken');
    const response = await fetch('/api/receptionist', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token ?? ''}` },
      body: JSON.stringify({ action: 'extend-stay', reservationId: reservation._id, newCheckOutDate, reason }),
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error ?? 'Unable to extend stay');
    setRetainTarget(null);
    setNotice('Stay extended successfully. The room remains occupied.');
    await loadData(true);
  };

  const handleWalkIn = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (savingWalkIn) return;
    if (!walkIn.roomId) {
      setWalkInError('Select an available room.');
      return;
    }
    if (new Date(walkIn.checkOutDate) <= new Date(walkIn.checkInDate)) {
      setWalkInError('Checkout must be later than check-in.');
      return;
    }
    setSavingWalkIn(true);
    setWalkInError('');
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch('/api/receptionist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token ?? ''}` },
        body: JSON.stringify({
          action: 'walk-in',
          ...walkIn,
          numberOfGuests: Number(walkIn.numberOfGuests),
        }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error ?? 'Unable to register walk-in');
      setShowWalkIn(false);
      setWalkInError('');
      setNotice('Walk-in registered and checked in successfully.');
      setWalkIn((current) => ({ ...current, firstName: '', lastName: '', phone: '', email: '', roomId: '', notes: '' }));
      await loadData(true);
    } catch (cause) {
      setWalkInError(cause instanceof Error ? cause.message : 'Unable to register walk-in');
    } finally {
      setSavingWalkIn(false);
    }
  };

  const tabs = [
    { id: 'arrivals' as const, label: "Today's Arrivals", count: arrivals.length, Icon: CalendarCheck2 },
    { id: 'upcoming' as const, label: 'Upcoming', count: upcoming.length, Icon: CalendarClock },
    { id: 'departures' as const, label: "Today's Departures", count: departures.length, Icon: CalendarX2 },
    { id: 'in-house' as const, label: 'In-House', count: inHouse.length, Icon: BedDouble },
  ];

  return (
    <main className="mx-auto min-w-0 max-w-[1400px] space-y-5 sm:space-y-6">
      <header className="flex min-w-0 flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
        <div>
          <div className="flex items-center gap-1.5 text-primary sm:gap-2">
            <ConciergeBell size={17} className="shrink-0 sm:h-5 sm:w-5" />
            <span className="text-[10px] font-semibold uppercase tracking-[0.16em] sm:text-xs sm:tracking-[0.18em]">Receptionist</span>
          </div>
          <h1 className="mt-1 text-xl font-bold text-foreground sm:text-2xl">Receptionist</h1>
          <p className="mt-1 text-xs text-muted-foreground sm:text-sm">
            {today.toLocaleDateString('en-NG', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
        <div className="flex w-full gap-2 sm:w-auto">
          <button onClick={() => void loadData(true)} disabled={refreshing} className="flex min-w-0 flex-1 items-center justify-center gap-1.5 rounded-xl border border-border px-3 py-2 text-xs text-foreground hover:bg-secondary disabled:opacity-50 sm:flex-none sm:gap-2 sm:px-4 sm:py-2.5 sm:text-sm" aria-label="Refresh receptionist data">
            <RefreshCw size={14} className={`shrink-0 ${refreshing ? 'animate-spin' : ''}`} /> Refresh
          </button>
          <button onClick={() => { setWalkInError(''); setShowWalkIn(true); }} className="flex min-w-0 flex-1 items-center justify-center gap-1.5 rounded-xl bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground hover:shadow-lg hover:shadow-primary/25 sm:flex-none sm:gap-2 sm:px-5 sm:py-2.5 sm:text-sm">
            <ConciergeBell size={14} className="shrink-0 sm:h-4 sm:w-4" /> <span className="min-w-0 truncate">New Walk-In</span>
          </button>
        </div>
      </header>

      {error && <p role="alert" className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">{error}</p>}
      {notice && <p role="status" className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-400">{notice}</p>}

      <section className="grid grid-cols-2 gap-2 sm:gap-3 lg:grid-cols-4" aria-label="Reception summary">
        {[
          { label: "Today's Arrivals", value: arrivals.length, Icon: CalendarCheck2, color: 'text-emerald-400' },
          { label: "Today's Departures", value: departures.length, Icon: CalendarClock, color: 'text-amber-400' },
          { label: 'Guests In-House', value: inHouse.length, Icon: Users, color: 'text-blue-400' },
          { label: 'Available Rooms', value: availableRooms.length, Icon: BedDouble, color: 'text-primary' },
        ].map(({ label, value, Icon, color }) => (
          <div key={label} className="flex min-w-0 items-center gap-2 rounded-2xl border border-border bg-card p-3 sm:gap-3 sm:p-4">
            <div className="shrink-0 rounded-lg bg-secondary p-2 sm:rounded-xl sm:p-2.5"><Icon size={16} className={color} /></div>
            <div className="min-w-0"><p className="text-xl font-bold leading-none text-foreground sm:text-2xl">{loading ? '—' : value}</p><p className="mt-1 break-words text-[10px] leading-tight text-muted-foreground sm:text-xs">{label}</p></div>
          </div>
        ))}
      </section>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1fr)_340px]">
        <section className="overflow-hidden rounded-2xl border border-border bg-card">
          <div className="flex min-w-0 flex-col gap-3 border-b border-border p-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between sm:p-4">
            <div className="grid min-w-0 grid-cols-2 gap-1 sm:flex sm:flex-wrap">
              {tabs.map(({ id, label, count, Icon }) => (
                <button key={id} onClick={() => setActiveTab(id)} className={`flex min-w-0 items-center justify-center gap-1 rounded-lg px-2 py-2 text-[10px] leading-tight sm:gap-2 sm:whitespace-nowrap sm:rounded-xl sm:px-3 sm:text-sm ${activeTab === id ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-secondary'}`}>
                  <Icon size={13} className="shrink-0 sm:h-[15px] sm:w-[15px]" /> <span className="min-w-0 truncate">{label}</span> <span className="shrink-0 rounded-full bg-secondary px-1.5 py-0.5 text-[10px] sm:px-2 sm:text-xs">{count}</span>
                </button>
              ))}
            </div>
            <label className="flex w-full min-w-0 items-center gap-2 rounded-xl border border-border bg-secondary/50 px-3 py-2 sm:w-auto sm:min-w-48">
              <Search size={14} className="text-muted-foreground" />
              <input value={search} onChange={(event) => setSearch(event.target.value)} className="w-full bg-transparent text-sm outline-none" placeholder="Guest or room" aria-label="Search guest or room" />
            </label>
          </div>
          <div className="divide-y divide-border/70">
            {loading ? (
              <p className="p-8 text-center text-sm text-muted-foreground">Loading receptionist data…</p>
            ) : shownReservations.length === 0 ? (
              <div className="p-10 text-center">
                <CheckCircle2 size={28} className="mx-auto mb-2 text-emerald-500/70" />
                <p className="text-sm font-medium text-foreground">Nothing to show here</p>
                <p className="mt-1 text-xs text-muted-foreground">Reservations and active stays appear here as they are recorded.</p>
              </div>
            ) : shownReservations.map((reservation) => {
              const details = detailsFor(reservation);
              const overdue = isActiveStay(reservation.status) && new Date(reservation.checkOutDate).getTime() < clock;
              return (
                <article key={reservation._id} className="flex min-w-0 flex-col gap-3 p-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:p-4">
                  <div className="min-w-0 flex-1">
                    <p className="break-words font-semibold text-foreground">{details.guestName}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Room {details.roomNumber} · {details.roomType} · {reservation.numberOfGuests ?? 1} guest(s)
                    </p>
                    <details className="group mt-2">
                      <summary className="inline-flex min-h-9 cursor-pointer list-none items-center gap-1.5 rounded-lg px-2.5 text-xs font-semibold text-primary hover:bg-primary/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 [&::-webkit-details-marker]:hidden">
                        Details
                        <ChevronDown size={14} className="transition-transform group-open:rotate-180" />
                      </summary>
                      <div className="mt-2 grid gap-2 rounded-xl border border-border bg-secondary/30 p-3 text-xs sm:grid-cols-2">
                        <p><span className="text-muted-foreground">{activeTab === 'arrivals' || activeTab === 'upcoming' ? 'Arrival' : 'Check-in'}: </span><span className="text-foreground">{displayDate(reservation.checkInDate)}</span></p>
                        {reservation.actualCheckInAt && <p><span className="text-muted-foreground">Actual check-in: </span><span className="text-foreground">{displayDate(reservation.actualCheckInAt)}</span></p>}
                        {details.phone && <p className="break-words"><span className="text-muted-foreground">Phone: </span><span className="text-foreground">{details.phone}</span></p>}
                        {details.email && <p className="break-all"><span className="text-muted-foreground">Email: </span><span className="text-foreground">{details.email}</span></p>}
                        {details.country && <p><span className="text-muted-foreground">Country: </span><span className="text-foreground">{details.country}</span></p>}
                        {reservation.totalPrice != null && <p><span className="text-muted-foreground">Stay total: </span><span className="text-foreground">₦{reservation.totalPrice.toLocaleString()}</span></p>}
                        {reservation.notes && <p className="whitespace-pre-wrap break-words sm:col-span-2"><span className="text-muted-foreground">Notes: </span><span className="text-foreground">{reservation.notes}</span></p>}
                        {activeTab === 'in-house' && (reservation.extensions?.length ?? 0) > 0 && (
                          <div className="space-y-1.5 sm:col-span-2">
                            <p className="font-medium text-foreground">Stay extension history</p>
                            {reservation.extensions?.map((extension, index) => (
                              <p key={extension.extensionId ?? `${extension.extendedAt}-${index}`} className="break-words text-muted-foreground">
                                {displayDate(extension.previousExpectedCheckout ?? '')} → {displayDate(extension.newExpectedCheckout ?? '')}
                                {' · '}{extension.additionalNights ?? '—'} night(s)
                                {' · '}{extension.staff?.email ?? 'Staff not recorded'}
                                {extension.reason ? ` · ${extension.reason}` : ''}
                              </p>
                            ))}
                          </div>
                        )}
                      </div>
                    </details>
                  </div>
                  <div className="flex min-w-0 flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:justify-end sm:gap-3">
                    <div className="min-w-0 text-left sm:text-right">
                      <p className="text-xs text-muted-foreground">Expected checkout</p>
                      <p className={`break-words text-xs font-medium sm:text-sm ${overdue ? 'text-red-400' : 'text-foreground'}`}>{displayDate(reservation.checkOutDate)}</p>
                      {overdue && <span className="text-[10px] font-bold uppercase text-red-400">Overdue · checkout required</span>}
                    </div>
                    {activeTab === 'arrivals' ? (
                      <button onClick={() => void performAction('check-in', reservation)} disabled={!!processingId} className="rounded-lg border border-emerald-500/25 bg-emerald-500/10 px-3 py-2 text-xs font-semibold text-emerald-400 hover:bg-emerald-500/20 disabled:opacity-50">
                        {processingId === reservation._id ? 'Checking in…' : 'Check In'}
                      </button>
                    ) : (activeTab === 'departures' || activeTab === 'in-house') ? (
                      <div className="flex flex-wrap gap-2">
                        {activeTab === 'in-house' && (
                          <button onClick={() => setRetainTarget(reservation)} disabled={!!processingId} className="rounded-lg border border-blue-500/25 bg-blue-500/10 px-3 py-2 text-xs font-semibold text-blue-400 hover:bg-blue-500/20 disabled:opacity-50">
                            Retain Room
                          </button>
                        )}
                        <button onClick={() => setCheckoutTarget(reservation)} disabled={!!processingId} className="rounded-lg border border-primary/25 bg-primary/10 px-3 py-2 text-xs font-semibold text-primary hover:bg-primary/20 disabled:opacity-50">
                          Check Out
                        </button>
                      </div>
                    ) : <span className="text-xs font-medium text-muted-foreground">Expected</span>}
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        <section className="overflow-hidden rounded-2xl border border-border bg-card">
          <div className="flex min-w-0 items-center justify-between gap-2 border-b border-border px-3 py-3 sm:px-5 sm:py-4">
            <div className="min-w-0"><h2 className="text-sm font-semibold text-foreground sm:text-base">Room Readiness</h2><p className="mt-0.5 text-[10px] text-muted-foreground sm:text-xs">Live operational status</p></div>
            <span className="shrink-0 text-[10px] text-muted-foreground sm:text-xs">{data.rooms.length} rooms</span>
          </div>
          <div className="max-h-[490px] space-y-2 overflow-y-auto p-4">
            {loading ? <p className="p-4 text-center text-xs text-muted-foreground">Loading rooms…</p> : data.rooms.length === 0 ? (
              <p className="p-4 text-center text-xs text-muted-foreground">No rooms configured yet.</p>
            ) : data.rooms.map((room) => {
              const styles: Record<string, string> = {
                available: 'border-emerald-500/20 bg-emerald-500/5 text-emerald-400',
                occupied: 'border-blue-500/20 bg-blue-500/5 text-blue-400',
                reserved: 'border-primary/20 bg-primary/5 text-primary',
                cleaning: 'border-purple-500/20 bg-purple-500/5 text-purple-400',
                maintenance: 'border-amber-500/20 bg-amber-500/5 text-amber-400',
              };
              return (
                <div key={room._id} className="flex min-w-0 items-center justify-between gap-2 rounded-xl border border-border px-2.5 py-2 sm:px-3 sm:py-2.5">
                  <div className="flex min-w-0 items-center gap-2"><BedDouble size={14} className="shrink-0 text-muted-foreground" /><div className="min-w-0"><p className="text-xs font-semibold text-foreground sm:text-sm">Room {room.roomNumber}</p><p className="break-words text-[10px] text-muted-foreground sm:text-[11px]">{room.type} · max {room.capacity} guests</p></div></div>
                  <span className={`shrink-0 rounded-full border px-1.5 py-1 text-[9px] font-semibold capitalize sm:px-2 sm:text-[10px] ${styles[room.status] ?? 'border-border bg-secondary text-muted-foreground'}`}>{room.status || 'unknown'}</span>
                </div>
              );
            })}
          </div>
        </section>
      </div>

      <CheckoutHistory rooms={data.rooms} refreshKey={historyRefreshKey} />

      {showWalkIn && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget && !savingWalkIn) setShowWalkIn(false); }}>
          <section role="dialog" aria-modal="true" aria-labelledby="walkin-title" className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-border bg-card shadow-2xl">
            <div className="sticky top-0 flex items-center justify-between border-b border-border bg-card px-6 py-4">
              <div><h2 id="walkin-title" className="text-lg font-bold text-foreground">Register a Walk-In</h2><p className="mt-1 text-xs text-muted-foreground">Register the guest and check them into an available room.</p></div>
              <button type="button" onClick={() => setShowWalkIn(false)} disabled={savingWalkIn} aria-label="Close walk-in form" className="rounded-lg px-3 py-2 text-muted-foreground hover:bg-secondary">✕</button>
            </div>
            <form onSubmit={handleWalkIn} className="space-y-4 p-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="text-xs font-medium text-muted-foreground">First name *
                  <input required maxLength={80} autoComplete="given-name" value={walkIn.firstName} onChange={(event) => setWalkIn({ ...walkIn, firstName: event.target.value })} className="mt-1.5 w-full rounded-xl border border-border bg-secondary px-3 py-2.5 text-sm text-foreground" />
                </label>
                <label className="text-xs font-medium text-muted-foreground">Last name *
                  <input required maxLength={80} autoComplete="family-name" value={walkIn.lastName} onChange={(event) => setWalkIn({ ...walkIn, lastName: event.target.value })} className="mt-1.5 w-full rounded-xl border border-border bg-secondary px-3 py-2.5 text-sm text-foreground" />
                </label>
                <label className="text-xs font-medium text-muted-foreground">Phone number *
                  <input required type="tel" maxLength={32} autoComplete="tel" value={walkIn.phone} onChange={(event) => setWalkIn({ ...walkIn, phone: event.target.value })} className="mt-1.5 w-full rounded-xl border border-border bg-secondary px-3 py-2.5 text-sm text-foreground" />
                </label>
                <label className="text-xs font-medium text-muted-foreground">Email (optional)
                  <input type="email" maxLength={254} autoComplete="email" value={walkIn.email} onChange={(event) => setWalkIn({ ...walkIn, email: event.target.value })} className="mt-1.5 w-full rounded-xl border border-border bg-secondary px-3 py-2.5 text-sm text-foreground" />
                </label>
                <label className="text-xs font-medium text-muted-foreground">Room *
                  <select required value={walkIn.roomId} onChange={(event) => setWalkIn({ ...walkIn, roomId: event.target.value })} className="mt-1.5 w-full rounded-xl border border-border bg-secondary px-3 py-2.5 text-sm text-foreground">
                    <option value="">Select available room</option>
                    {availableRooms.map((room) => <option key={room._id} value={room._id}>Room {room.roomNumber} · {room.type} · {room.capacity} guests</option>)}
                  </select>
                  {availableRooms.length === 0 && <span className="mt-1 block text-[11px] text-amber-400">There are no available rooms to assign.</span>}
                </label>
                <label className="text-xs font-medium text-muted-foreground">Number of guests *
                  <input required type="number" min="1" max={walkIn.roomId ? roomMap.get(walkIn.roomId)?.capacity ?? 1 : 30} value={walkIn.numberOfGuests} onChange={(event) => setWalkIn({ ...walkIn, numberOfGuests: event.target.value })} className="mt-1.5 w-full rounded-xl border border-border bg-secondary px-3 py-2.5 text-sm text-foreground" />
                </label>
                <label className="text-xs font-medium text-muted-foreground">Check-in *
                  <input required type="datetime-local" value={walkIn.checkInDate} onChange={(event) => setWalkIn({ ...walkIn, checkInDate: event.target.value })} className="mt-1.5 w-full rounded-xl border border-border bg-secondary px-3 py-2.5 text-sm text-foreground" />
                </label>
                <label className="text-xs font-medium text-muted-foreground">Expected checkout *
                  <input required type="datetime-local" min={walkIn.checkInDate} value={walkIn.checkOutDate} onChange={(event) => setWalkIn({ ...walkIn, checkOutDate: event.target.value })} className="mt-1.5 w-full rounded-xl border border-border bg-secondary px-3 py-2.5 text-sm text-foreground" />
                </label>
              </div>
              <label className="block text-xs font-medium text-muted-foreground">Special requests or staff notes
                <textarea maxLength={1000} rows={3} value={walkIn.notes} onChange={(event) => setWalkIn({ ...walkIn, notes: event.target.value })} className="mt-1.5 w-full resize-y rounded-xl border border-border bg-secondary px-3 py-2.5 text-sm text-foreground" />
              </label>
              {walkInError && <p role="alert" className="rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-400">{walkInError}</p>}
              <div className="flex justify-end gap-3 border-t border-border pt-4">
                <button type="button" onClick={() => setShowWalkIn(false)} disabled={savingWalkIn} className="rounded-xl border border-border px-4 py-2.5 text-sm text-foreground hover:bg-secondary disabled:opacity-50">Cancel</button>
                <button type="submit" disabled={savingWalkIn || availableRooms.length === 0} className="rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground disabled:opacity-50">{savingWalkIn ? 'Registering…' : 'Register & Check In'}</button>
              </div>
            </form>
          </section>
        </div>
      )}

      {checkoutTarget && (
        <CheckoutCommentModal
          guest={{
            id: checkoutTarget._id,
            guestName: detailsFor(checkoutTarget).guestName,
            roomNumber: detailsFor(checkoutTarget).roomNumber,
            nights: Math.max(1, Math.ceil((new Date(checkoutTarget.checkOutDate).getTime() - new Date(checkoutTarget.checkInDate).getTime()) / 86_400_000)),
            totalBill: Number(checkoutTarget.totalPrice ?? 0),
            checkOutTime: displayDate(checkoutTarget.checkOutDate),
          }}
          onConfirm={(id, notes) => {
            const reservation = data.reservations.find((item) => item._id === id);
            if (reservation) void performAction('check-out', reservation, notes);
          }}
          onCancel={() => setCheckoutTarget(null)}
          isSubmitting={processingId === checkoutTarget._id}
          error={processingId === checkoutTarget._id ? '' : error}
        />
      )}
      {retainTarget && (
        <RetainRoomModal
          reservation={retainTarget}
          details={{
            ...detailsFor(retainTarget),
            nightlyRate: Number(roomMap.get(retainTarget.roomId)?.pricePerNight ?? 0),
          }}
          onClose={() => setRetainTarget(null)}
          onSubmit={(newCheckOutDate, reason) => extendStay(retainTarget, newCheckOutDate, reason)}
        />
      )}
    </main>
  );
}
