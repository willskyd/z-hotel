'use client';

import { Users, Layers, Star, Eye, BedDouble } from 'lucide-react';
import { formatNaira } from '@/lib/utils';
import { Room } from './room-detail-modal';

const STATUS_MAP: Record<string, { label: string; dotColor: string; badgeCls: string }> = {
  available:   { label: 'Available',   dotColor: 'bg-emerald-400', badgeCls: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/25' },
  occupied:    { label: 'Occupied',    dotColor: 'bg-blue-400',    badgeCls: 'bg-blue-500/15 text-blue-400 border-blue-500/25' },
  maintenance: { label: 'Maintenance', dotColor: 'bg-amber-400',   badgeCls: 'bg-amber-500/15 text-amber-400 border-amber-500/25' },
  cleaning:    { label: 'Cleaning',    dotColor: 'bg-purple-400',  badgeCls: 'bg-purple-500/15 text-purple-400 border-purple-500/25' },
  reserved:    { label: 'Reserved',    dotColor: 'bg-primary',     badgeCls: 'bg-primary/15 text-primary border-primary/25' },
};

const TYPE_ACCENTS: Record<string, { border: string; icon: string }> = {
  Standard:  { border: 'hover:border-blue-500/30',    icon: 'text-blue-400' },
  Deluxe:    { border: 'hover:border-purple-500/30',  icon: 'text-purple-400' },
  Suite:     { border: 'hover:border-amber-500/30',   icon: 'text-amber-400' },
  Executive: { border: 'hover:border-emerald-500/30', icon: 'text-emerald-400' },
};

interface RoomsListProps {
  rooms: Room[];
  onViewDetails: (room: Room) => void;
}

export default function RoomsList({ rooms, onViewDetails }: RoomsListProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {rooms.map((room) => {
        const s = STATUS_MAP[room.status] ?? STATUS_MAP.available;
        const accent = TYPE_ACCENTS[room.type] ?? TYPE_ACCENTS.Standard;

        return (
          <div
            key={room.id}
            className={"bg-card border border-border rounded-2xl p-5 cursor-pointer transition-all duration-300 group hover:shadow-lg " + accent.border + " relative overflow-hidden"}
            onClick={() => onViewDetails(room)}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-primary/0 group-hover:from-primary/3 to-transparent transition-all duration-500 pointer-events-none rounded-2xl" />
            <div className="relative z-10">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-xs text-muted-foreground mb-0.5">Room</p>
                  <p className="text-2xl font-black text-foreground tracking-tight">#{room.roomNumber}</p>
                </div>
                <div className="flex flex-col items-end gap-1.5">
                  <span className={"inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-full border " + s.badgeCls}>
                    <span className={"w-1.5 h-1.5 rounded-full " + s.dotColor} />
                    {s.label}
                  </span>
                  <span className={"text-[10px] font-semibold px-2 py-0.5 rounded-full bg-secondary border border-border " + accent.icon}>
                    {room.type}
                  </span>
                </div>
              </div>

              <div className="space-y-2.5 border-t border-border/60 pt-3.5">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-muted-foreground text-xs"><Layers size={12} /> Floor</span>
                  <span className="text-foreground font-medium text-xs">{room.floor}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-muted-foreground text-xs"><Users size={12} /> Capacity</span>
                  <span className="text-foreground font-medium text-xs">{room.capacity} guests</span>
                </div>
                {(room.amenities?.length ?? 0) > 0 && (
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-muted-foreground text-xs"><Star size={12} /> Amenities</span>
                    <span className="text-foreground font-medium text-xs">{room.amenities?.length} items</span>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Price / Night</span>
                  <span className="text-primary font-bold text-sm">{formatNaira(room.pricePerNight)}</span>
                </div>
              </div>

              {room.status === 'occupied' && room.currentGuest && (
                <div className="mt-3 pt-3 border-t border-border/60">
                  <p className="text-[10px] text-muted-foreground mb-0.5">Current Guest</p>
                  <p className="text-xs font-semibold text-foreground truncate">{room.currentGuest}</p>
                  {room.checkOutDate && <p className="text-[10px] text-muted-foreground">Checkout: {room.checkOutDate}</p>}
                </div>
              )}

              <button
                className="w-full mt-4 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-secondary border border-border text-xs font-medium text-foreground hover:bg-secondary/80 hover:border-primary/30 transition-all"
                onClick={(e) => { e.stopPropagation(); onViewDetails(room); }}
              >
                <Eye size={13} className="text-muted-foreground" />
                View Details
              </button>
            </div>
          </div>
        );
      })}

      {rooms.length === 0 && (
        <div className="col-span-full flex flex-col items-center justify-center py-20 text-muted-foreground">
          <BedDouble size={40} className="mb-3 opacity-20" />
          <p className="text-sm">No rooms configured yet</p>
        </div>
      )}
    </div>
  );
}
