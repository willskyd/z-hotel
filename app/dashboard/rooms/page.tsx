'use client';

import { useState } from 'react';
import { BedDouble, Plus, Search, Filter } from 'lucide-react';
import RoomsList from '@/components/rooms/rooms-list';
import CreateRoomModal from '@/components/rooms/create-room-modal';
import RoomDetailModal, { Room } from '@/components/rooms/room-detail-modal';
import { useAuth } from '@/lib/auth-context';
import { formatNairaCompact } from '@/lib/utils';

const MOCK_ROOMS: Room[] = [
  { id: '1', roomNumber: '101', type: 'Standard', floor: 1, capacity: 2, pricePerNight: 45000, status: 'available', amenities: ['WiFi', 'TV', 'AC', 'En-suite bathroom'], description: 'Cosy standard room on the ground floor.', totalRevenue: 450000, totalBookings: 10 },
  { id: '2', roomNumber: '102', type: 'Deluxe',   floor: 1, capacity: 3, pricePerNight: 85000, status: 'occupied', amenities: ['WiFi', 'TV', 'AC', 'En-suite bathroom', 'Mini bar'], currentGuest: 'Aisha Bello', checkOutDate: '2024-06-18', totalRevenue: 680000, totalBookings: 8 },
  { id: '3', roomNumber: '203', type: 'Deluxe',   floor: 2, capacity: 3, pricePerNight: 85000, status: 'reserved', amenities: ['WiFi', 'TV', 'AC', 'En-suite bathroom', 'Mini bar', 'Room service'], totalRevenue: 510000, totalBookings: 6 },
  { id: '4', roomNumber: '301', type: 'Suite',    floor: 3, capacity: 4, pricePerNight: 150000, status: 'occupied', amenities: ['WiFi', 'TV', 'AC', 'En-suite bathroom', 'Mini bar', 'Room service', 'Jacuzzi', 'Lounge area'], currentGuest: 'Emeka Okafor', checkOutDate: '2024-06-18', totalRevenue: 1500000, totalBookings: 10 },
  { id: '5', roomNumber: '302', type: 'Standard', floor: 3, capacity: 2, pricePerNight: 45000, status: 'maintenance', amenities: ['WiFi', 'TV', 'AC'], description: 'Under scheduled maintenance.', totalRevenue: 270000, totalBookings: 6 },
  { id: '6', roomNumber: '410', type: 'Suite',    floor: 4, capacity: 4, pricePerNight: 150000, status: 'occupied', amenities: ['WiFi', 'TV', 'AC', 'En-suite bathroom', 'Mini bar', 'Room service', 'Jacuzzi'], currentGuest: 'Chidi Nwosu', checkOutDate: '2024-06-19', totalRevenue: 1200000, totalBookings: 8 },
  { id: '7', roomNumber: '501', type: 'Executive',floor: 5, capacity: 2, pricePerNight: 120000, status: 'available', amenities: ['WiFi', 'TV', 'AC', 'En-suite bathroom', 'Work desk', 'Coffee machine', 'Express laundry'], totalRevenue: 720000, totalBookings: 6 },
  { id: '8', roomNumber: '502', type: 'Executive',floor: 5, capacity: 2, pricePerNight: 120000, status: 'cleaning', amenities: ['WiFi', 'TV', 'AC', 'En-suite bathroom', 'Work desk', 'Coffee machine'], totalRevenue: 480000, totalBookings: 4 },
];

const STATUS_FILTERS = ['all', 'available', 'occupied', 'maintenance', 'cleaning', 'reserved'] as const;

export default function RoomsPage() {
  const { user } = useAuth();
  const [rooms, setRooms] = useState<Room[]>(MOCK_ROOMS);
  const [showModal, setShowModal] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const canCreate = user?.role === 'admin' || user?.role === 'manager';

  const handleAddRoom = async (data: any) => {
    const newRoom: Room = {
      ...data,
      id: String(Date.now()),
      status: data.status ?? 'available',
      totalRevenue: 0,
      totalBookings: 0,
    };
    setRooms((prev) => [newRoom, ...prev]);
    setShowModal(false);
  };

  const handleStatusChange = (roomId: string, newStatus: string) => {
    setRooms((prev) => prev.map((r) => r.id === roomId ? { ...r, status: newStatus as any } : r));
    if (selectedRoom?.id === roomId) setSelectedRoom((r) => r ? { ...r, status: newStatus as any } : r);
  };

  const handlePriceChange = (roomId: string, newPrice: number) => {
    setRooms((prev) => prev.map((r) => r.id === roomId ? { ...r, pricePerNight: newPrice } : r));
    if (selectedRoom?.id === roomId) setSelectedRoom((r) => r ? { ...r, pricePerNight: newPrice } : r);
  };

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
    <div className="space-y-6 max-w-[1400px]">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Rooms</h1>
          <p className="text-sm text-muted-foreground mt-0.5">{rooms.length} rooms configured · {summary.available} available</p>
        </div>
        {canCreate && (
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground text-sm font-semibold rounded-xl hover:shadow-lg hover:shadow-primary/30 transition-all"
          >
            <Plus size={16} />
            Add Room
          </button>
        )}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {[
          { label: 'Total Rooms',  value: summary.total,       color: 'text-foreground',   bg: 'bg-card' },
          { label: 'Available',    value: summary.available,   color: 'text-emerald-400',  bg: 'bg-emerald-500/5 border-emerald-500/15' },
          { label: 'Occupied',     value: summary.occupied,    color: 'text-blue-400',     bg: 'bg-blue-500/5 border-blue-500/15' },
          { label: 'Unavailable',  value: summary.maintenance, color: 'text-amber-400',    bg: 'bg-amber-500/5 border-amber-500/15' },
          { label: 'Total Revenue',value: formatNairaCompact(summary.totalRevenue), color: 'text-primary', bg: 'bg-primary/5 border-primary/15' },
        ].map(({ label, value, color, bg }) => (
          <div key={label} className={"border rounded-2xl px-4 py-3.5 " + bg}>
            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">{label}</p>
            <p className={"text-xl font-bold " + color}>{value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-2 flex-1 min-w-52 bg-card border border-border rounded-xl px-3 py-2.5 focus-within:border-primary/50 transition-colors">
          <Search size={14} className="text-muted-foreground shrink-0" />
          <input
            type="text"
            placeholder="Search room number, type, or guest..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-transparent border-0 outline-none w-full text-sm text-foreground placeholder:text-muted-foreground/60"
          />
        </div>
        <div className="flex items-center gap-2">
          {STATUS_FILTERS.map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={"px-3 py-1.5 text-xs font-medium rounded-xl border transition-all capitalize " + (
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
