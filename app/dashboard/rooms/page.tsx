'use client';

import { useCallback, useEffect, useState } from 'react';
import { BedDouble, Plus, Search, Filter, ChevronDown } from 'lucide-react';
import RoomsList from '@/components/rooms/rooms-list';
import CreateRoomModal from '@/components/rooms/create-room-modal';
import RoomDetailModal, { Room } from '@/components/rooms/room-detail-modal';
import { useAuth } from '@/lib/auth-context';
import { formatNairaCompact } from '@/lib/utils';

const STATUS_FILTERS = ['all', 'available', 'occupied', 'maintenance', 'cleaning', 'reserved'] as const;

export default function RoomsPage() {
  const { user } = useAuth();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const canCreate = user?.role === 'admin' || user?.role === 'manager';

  const loadRooms = useCallback(async () => {
    const token = localStorage.getItem('accessToken');
    const response = await fetch('/api/rooms', { headers: { Authorization: `Bearer ${token}` } });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error ?? 'Unable to load rooms');
    setRooms(data.map((room: any) => ({ ...room, id: room._id })));
  }, []);

  useEffect(() => {
    loadRooms().catch((cause) => setError(cause.message)).finally(() => setLoading(false));
  }, [loadRooms]);

  const handleAddRoom = async (data: any) => {
    const response = await fetch('/api/rooms', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('accessToken')}` }, body: JSON.stringify(data) });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error ?? 'Unable to create room');
    setRooms((prev) => [...prev, { ...result, id: result._id }]);
    setShowModal(false);
  };

  const updateRoom = async (roomId: string, updates: Record<string, unknown>) => {
    const response = await fetch('/api/rooms', { method: 'PUT', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('accessToken')}` }, body: JSON.stringify({ id: roomId, ...updates }) });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error ?? 'Unable to update room');
    const saved = { ...result, id: result._id };
    setRooms((prev) => prev.map((room) => room.id === roomId ? saved : room));
    setSelectedRoom(saved);
  };

  const handleStatusChange = (roomId: string, newStatus: string) => updateRoom(roomId, { status: newStatus }).catch((cause) => setError(cause.message));
  const handlePriceChange = (roomId: string, newPrice: number) => updateRoom(roomId, { pricePerNight: newPrice }).catch((cause) => setError(cause.message));

  const filtered = rooms.filter((r) => {
    const q = search.toLowerCase();
    const matchSearch = !q || r.roomNumber.includes(q) || r.type.toLowerCase().includes(q) || (r.currentGuest ?? '').toLowerCase().includes(q);
    const matchStatus = statusFilter === 'all' || r.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const summary = {
    total: rooms.length,
    available: rooms.filter((r) => r.status === 'available').length,
    occupied: rooms.filter((r) => r.status === 'occupied').length,
    maintenance: rooms.filter((r) => r.status === 'maintenance' || r.status === 'cleaning').length,
    totalRevenue: rooms.reduce((s, r) => s + (r.totalRevenue ?? 0), 0),
  };

  return (
    <div className="w-full min-w-0 space-y-5 sm:space-y-6 max-w-[1400px]">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-xl font-bold text-foreground sm:text-2xl">Rooms</h1>
          <p className="mt-0.5 text-xs text-muted-foreground sm:text-sm">{rooms.length} rooms configured · {summary.available} available</p>
        </div>
        {canCreate && (
          <button
            onClick={() => setShowModal(true)}
            className="flex shrink-0 items-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground transition-all hover:shadow-lg hover:shadow-primary/30 sm:gap-2 sm:rounded-xl sm:px-5 sm:py-2.5 sm:text-sm"
          >
            <Plus size={14} className="sm:h-4 sm:w-4" />
            Add Room
          </button>
        )}
      </div>

      {error && <p role="alert" className="text-sm text-red-400">{error}</p>}
      {loading && <p className="text-sm text-muted-foreground">Loading rooms…</p>}

      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-2.5 sm:gap-4 lg:grid-cols-5">
        {[
          { label: 'Total Rooms',  value: summary.total,       color: 'text-foreground',   bg: 'bg-card' },
          { label: 'Available',    value: summary.available,   color: 'text-emerald-400',  bg: 'bg-emerald-500/5 border-emerald-500/15' },
          { label: 'Occupied',     value: summary.occupied,    color: 'text-blue-400',     bg: 'bg-blue-500/5 border-blue-500/15' },
          { label: 'Unavailable',  value: summary.maintenance, color: 'text-amber-400',    bg: 'bg-amber-500/5 border-amber-500/15' },
          { label: 'Total Revenue',value: formatNairaCompact(summary.totalRevenue), color: 'text-primary', bg: 'bg-primary/5 border-primary/15' },
        ].map(({ label, value, color, bg }) => (
          <div key={label} className={"min-w-0 rounded-2xl border px-3 py-3 sm:px-4 sm:py-3.5 " + bg}>
            <p className="mb-1 truncate text-[10px] uppercase tracking-wide text-muted-foreground sm:text-xs sm:tracking-wider">{label}</p>
            <p className={"truncate text-lg font-bold sm:text-xl " + color}>{value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex min-w-0 flex-col gap-2.5 sm:flex-row sm:flex-wrap sm:items-center sm:gap-3">
        <div className="flex min-w-0 w-full flex-1 items-center gap-2 rounded-xl border border-border bg-card px-3 py-2.5 transition-colors focus-within:border-primary/50 sm:w-auto">
          <Search size={14} className="text-muted-foreground shrink-0" />
          <input
            type="text"
            placeholder="Search rooms by number, type, or guest"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="min-w-0 w-full bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground/60"
          />
        </div>
        <label className="relative flex min-w-0 w-full items-center gap-2 rounded-xl border border-border bg-card px-3 py-2.5 transition-colors focus-within:border-primary/50 sm:hidden">
          <Filter size={14} className="shrink-0 text-muted-foreground" />
          <span className="shrink-0 text-xs font-medium text-muted-foreground">Status</span>
          <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} aria-label="Filter rooms by status" className="min-w-0 flex-1 appearance-none bg-transparent py-0.5 pr-6 text-right text-sm capitalize text-foreground outline-none">
            {STATUS_FILTERS.map((status) => <option key={status} value={status} className="bg-secondary text-foreground capitalize">{status === 'all' ? 'All statuses' : status}</option>)}
          </select>
          <ChevronDown size={14} className="pointer-events-none absolute right-3 shrink-0 text-muted-foreground" />
        </label>
        <div className="hidden flex-wrap items-center gap-2 sm:flex">
          {STATUS_FILTERS.map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={"rounded-xl border px-2.5 py-1.5 text-[11px] font-medium capitalize transition-all md:px-3 md:text-xs " + (
                statusFilter === s
                  ? 'bg-primary text-primary-foreground border-primary/50'
                  : 'border-border text-muted-foreground hover:border-primary/30 hover:text-foreground'
              )}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Rooms Grid */}
      <RoomsList rooms={filtered} onViewDetails={setSelectedRoom} />

      {/* Modals */}
      {showModal && (
        <CreateRoomModal onClose={() => setShowModal(false)} onSubmit={handleAddRoom} />
      )}
      {selectedRoom && (
        <RoomDetailModal
          room={selectedRoom}
          onClose={() => setSelectedRoom(null)}
          onStatusChange={handleStatusChange}
          onPriceChange={handlePriceChange}
        />
      )}
    </div>
  );
}
