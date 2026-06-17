'use client';

import { useState } from 'react';
import {
  X, BedDouble, Users, Layers, Wifi, Tv, Wind, Coffee, Bath,
  Wrench, Edit2, Save, Shield, TrendingUp, Calendar, CheckCircle2,
  Star, AlertTriangle, Clock,
} from 'lucide-react';
import { formatNaira, formatNairaCompact } from '@/lib/utils';
import { useAuth } from '@/lib/auth-context';

export interface Room {
  id: string;
  roomNumber: string;
  type: string;
  floor: number;
  capacity: number;
  pricePerNight: number;
  status: 'available' | 'occupied' | 'maintenance' | 'cleaning' | 'reserved';
  amenities?: string[];
  description?: string;
  currentGuest?: string;
  checkOutDate?: string;
  totalRevenue?: number;
  totalBookings?: number;
  lastCleaned?: string;
  rating?: number;
}

const STATUS_MAP: Record<string, { label: string; color: string; bg: string; Icon: React.ElementType }> = {
  available:   { label: 'Available',   color: 'text-emerald-400', bg: 'bg-emerald-500/15 border-emerald-500/25', Icon: CheckCircle2 },
  occupied:    { label: 'Occupied',    color: 'text-blue-400',    bg: 'bg-blue-500/15 border-blue-500/25',    Icon: BedDouble },
  maintenance: { label: 'Maintenance', color: 'text-amber-400',   bg: 'bg-amber-500/15 border-amber-500/25',   Icon: Wrench },
  cleaning:    { label: 'Cleaning',    color: 'text-purple-400',  bg: 'bg-purple-500/15 border-purple-500/25', Icon: Star },
  reserved:    { label: 'Reserved',    color: 'text-primary',     bg: 'bg-primary/15 border-primary/25',       Icon: Calendar },
};

const AMENITY_ICONS: Record<string, React.ElementType> = {
  'WiFi': Wifi, 'TV': Tv, 'AC': Wind, 'Coffee machine': Coffee,
  'En-suite bathroom': Bath, 'Mini bar': Coffee, 'Jacuzzi': Bath,
};

const ALL_STATUSES = ['available', 'occupied', 'maintenance', 'cleaning', 'reserved'] as const;

const MOCK_STAY_HISTORY = [
  { guest: 'Emeka Okafor',    checkIn: '2024-06-12', checkOut: '2024-06-15', nights: 3, revenue: 255_000 },
  { guest: 'Chidi Nwosu',     checkIn: '2024-05-20', checkOut: '2024-05-23', nights: 3, revenue: 255_000 },
  { guest: 'Ngozi Adeyemi',   checkIn: '2024-04-05', checkOut: '2024-04-09', nights: 4, revenue: 340_000 },
];

interface RoomDetailModalProps {
  room: Room;
  onClose: () => void;
  onStatusChange?: (roomId: string, newStatus: string) => void;
  onPriceChange?: (roomId: string, newPrice: number) => void;
}

export default function RoomDetailModal({ room, onClose, onStatusChange, onPriceChange }: RoomDetailModalProps) {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const [editingPrice, setEditingPrice] = useState(false);
  const [priceInput, setPriceInput] = useState(String(room.pricePerNight));
  const [localStatus, setLocalStatus] = useState(room.status);

  const status = STATUS_MAP[localStatus] ?? STATUS_MAP.available;
  const amenities = room.amenities ?? ['WiFi', 'TV', 'AC', 'En-suite bathroom'];
  const totalRevenue = room.totalRevenue ?? MOCK_STAY_HISTORY.reduce((s, h) => s + h.revenue, 0);
  const totalBookings = room.totalBookings ?? MOCK_STAY_HISTORY.length;
  const occupancyRate = Math.round((MOCK_STAY_HISTORY.length * 3.3 / 30) * 100);

  const handleStatusChange = (s: string) => {
    setLocalStatus(s as any);
    onStatusChange?.(room.id, s);
  };

  const handlePriceSave = () => {
    const newPrice = parseFloat(priceInput);
    if (!isNaN(newPrice) && newPrice > 0) {
      onPriceChange?.(room.id, newPrice);
    }
    setEditingPrice(false);
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div
        className="bg-card border border-border rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="relative bg-gradient-to-r from-[#141830] to-[#0f1225] border-b border-border rounded-t-2xl overflow-hidden">
          <div className="absolute top-0 right-0 w-48 h-48 bg-primary/8 rounded-full blur-2xl pointer-events-none" />
          <div className="relative z-10 flex items-start justify-between p-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/30 to-accent/20 border border-primary/30 flex items-center justify-center shadow-lg">
                <span className="text-2xl font-black text-primary">{room.roomNumber}</span>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h2 className="text-xl font-bold text-foreground">Room {room.roomNumber}</h2>
                  <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full border ${status.bg} ${status.color}`}>
                    <status.Icon size={11} />
                    {status.label}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">{room.type} · Floor {room.floor} · {room.capacity} guests</p>
                {room.description && <p className="text-xs text-muted-foreground/70 mt-1">{room.description}</p>}
              </div>
            </div>
            <button onClick={onClose} className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-secondary transition-all">
              <X size={18} />
            </button>
          </div>

          {/* Quick Metrics */}
          <div className="relative z-10 grid grid-cols-4 gap-px border-t border-white/5">
            {[
              { label: 'Price / Night', value: formatNairaCompact(room.pricePerNight), color: 'text-primary' },
              { label: 'Total Revenue', value: formatNairaCompact(totalRevenue), color: 'text-emerald-400' },
              { label: 'Bookings', value: String(totalBookings), color: 'text-blue-400' },
              { label: 'Occupancy', value: `${occupancyRate}%`, color: 'text-amber-400' },
            ].map(({ label, value, color }) => (
              <div key={label} className="px-5 py-3 bg-white/[0.015]">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">{label}</p>
                <p className={`text-sm font-bold ${color}`}>{value}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Current Occupancy */}
          {localStatus === 'occupied' && room.currentGuest && (
            <div className="flex items-center justify-between p-4 bg-blue-500/5 border border-blue-500/20 rounded-xl">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-blue-500/15 border border-blue-500/25 flex items-center justify-center">
                  <Users size={16} className="text-blue-400" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">{room.currentGuest}</p>
                  <p className="text-xs text-muted-foreground">Currently staying</p>
                </div>
              </div>
              {room.checkOutDate && (
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">Expected checkout</p>
                  <p className="text-sm font-semibold text-foreground">{room.checkOutDate}</p>
                </div>
              )}
            </div>
          )}

          {/* Admin Controls */}
          {isAdmin && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-1">
                <Shield size={13} className="text-amber-400" />
                <p className="text-xs font-semibold text-amber-400 uppercase tracking-wider">Admin Controls</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Price edit */}
                <div className="bg-secondary/50 border border-border rounded-xl p-4">
                  <p className="text-xs text-muted-foreground mb-2">Price per Night (₦)</p>
                  {editingPrice ? (
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        value={priceInput}
                        onChange={(e) => setPriceInput(e.target.value)}
                        className="flex-1 px-3 py-1.5 bg-secondary border border-primary/50 rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                        autoFocus
                      />
                      <button onClick={handlePriceSave} className="p-1.5 rounded-lg bg-primary/20 text-primary hover:bg-primary/30 transition-colors">
                        <Save size={14} />
                      </button>
                      <button onClick={() => { setEditingPrice(false); setPriceInput(String(room.pricePerNight)); }} className="p-1.5 rounded-lg bg-secondary border border-border text-muted-foreground hover:text-foreground transition-colors">
                        <X size={14} />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between">
                      <p className="text-lg font-bold text-primary">{formatNaira(room.pricePerNight)}</p>
                      <button onClick={() => setEditingPrice(true)} className="flex items-center gap-1 text-xs text-primary hover:text-accent transition-colors">
                        <Edit2 size={12} /> Edit
                      </button>
                    </div>
                  )}
                </div>

                {/* Status change */}
                <div className="bg-secondary/50 border border-border rounded-xl p-4">
                  <p className="text-xs text-muted-foreground mb-2">Room Status</p>
                  <select
                    value={localStatus}
                    onChange={(e) => handleStatusChange(e.target.value)}
                    className="w-full bg-secondary border border-border rounded-lg px-3 py-1.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                  >
                    {ALL_STATUSES.map((s) => (
                      <option key={s} value={s} className="capitalize">{STATUS_MAP[s]?.label ?? s}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Amenities */}
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Amenities</p>
            <div className="flex flex-wrap gap-2">
              {amenities.map((a) => {
                const Icon = AMENITY_ICONS[a] ?? CheckCircle2;
                return (
                  <span key={a} className="flex items-center gap-1.5 px-3 py-1.5 bg-secondary/60 border border-border rounded-xl text-xs font-medium text-foreground">
                    <Icon size={12} className="text-primary" />
                    {a}
                  </span>
                );
              })}
            </div>
          </div>

          {/* Stay History */}
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Recent Stay History</p>
            <div className="space-y-2">
              {MOCK_STAY_HISTORY.map((h, i) => (
                <div key={i} className="flex items-center justify-between px-4 py-3 bg-secondary/40 rounded-xl border border-border hover:border-primary/20 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-primary/15 border border-primary/20 flex items-center justify-center text-xs font-bold text-primary">
                      {h.guest.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">{h.guest}</p>
                      <p className="text-xs text-muted-foreground">{h.checkIn} → {h.checkOut} · {h.nights} nights</p>
                    </div>
                  </div>
                  <p className="text-sm font-semibold text-foreground">{formatNaira(h.revenue)}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Room Info */}
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Room Type', value: room.type, Icon: BedDouble },
              { label: 'Floor', value: `Floor ${room.floor}`, Icon: Layers },
              { label: 'Capacity', value: `${room.capacity} guests max`, Icon: Users },
              { label: 'Last Cleaned', value: room.lastCleaned ?? 'Today, 09:00', Icon: Clock },
            ].map(({ label, value, Icon }) => (
              <div key={label} className="flex items-center gap-3 px-4 py-3 bg-secondary/40 rounded-xl border border-border">
                <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                  <Icon size={14} className="text-primary" />
                </div>
                <div>
                  <p className="text-[11px] text-muted-foreground">{label}</p>
                  <p className="text-sm font-medium text-foreground">{value}</p>
                </div>
              </div>
            ))}
          </div>

          {!isAdmin && (
            <div className="flex items-center gap-2 px-4 py-3 bg-secondary/40 border border-border rounded-xl">
              <AlertTriangle size={13} className="text-amber-400 shrink-0" />
              <p className="text-xs text-muted-foreground">Price and configuration changes require <span className="text-amber-400 font-medium">administrator</span> access.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
