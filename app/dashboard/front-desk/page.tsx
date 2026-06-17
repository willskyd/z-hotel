'use client';

import { useState } from 'react';
import {
  ConciergeBell, BedDouble, CalendarCheck2, CalendarX2,
  Clock, CheckCircle2, Phone, Key, Bell, Users, ArrowRight,
  User, MapPin,
} from 'lucide-react';
import { formatNaira } from '@/lib/utils';
import CheckoutCommentModal from '@/components/front-desk/checkout-comment-modal';

interface CheckedInGuest {
  id: string;
  guestName: string;
  roomNumber: string;
  roomType: string;
  checkInTime: string;
  checkOutDate: string;
  nights: number;
  country: string;
  phone: string;
}

interface CheckOutGuest {
  id: string;
  guestName: string;
  roomNumber: string;
  checkOutTime: string;
  nights: number;
  totalBill: number;
  status: 'pending' | 'overdue';
}

const AVAILABLE_ROOMS = [
  { room: '101', type: 'Standard' },
  { room: '104', type: 'Standard' },
  { room: '201', type: 'Deluxe' },
  { room: '203', type: 'Deluxe' },
  { room: '304', type: 'Suite' },
  { room: '308', type: 'Standard' },
  { room: '402', type: 'Deluxe' },
  { room: '405', type: 'Suite' },
];

const ROOM_TYPE_COLOR: Record<string, string> = {
  Standard: 'bg-blue-500/10 border-blue-500/25 text-blue-400',
  Deluxe: 'bg-purple-500/10 border-purple-500/25 text-purple-400',
  Suite: 'bg-amber-500/10 border-amber-500/25 text-amber-400',
};

export default function FrontDeskPage() {
  const [activeTab, setActiveTab] = useState<'checkins' | 'checkouts' | 'inhouse'>('checkins');
  const [checkoutTarget, setCheckoutTarget] = useState<CheckOutGuest | null>(null);
  const [processedIds, setProcessedIds] = useState<string[]>([]);

  const [checkedInGuests, setCheckedInGuests] = useState<CheckedInGuest[]>([
    {
      id: '1',
      guestName: 'Emeka Okafor',
      roomNumber: '301',
      roomType: 'Deluxe',
      checkInTime: '14:30',
      checkOutDate: '2024-06-18',
      nights: 3,
      country: 'Nigeria',
      phone: '+234-803-555-0101',
    },
    {
      id: '2',
      guestName: 'Chidi Nwosu',
      roomNumber: '410',
      roomType: 'Suite',
      checkInTime: '15:45',
      checkOutDate: '2024-06-19',
      nights: 2,
      country: 'Nigeria',
      phone: '+234-806-555-0103',
    },
    {
      id: '3',
      guestName: 'Fatima Aliyu',
      roomNumber: '205',
      roomType: 'Standard',
      checkInTime: '11:00',
      checkOutDate: '2024-06-20',
      nights: 4,
      country: 'Nigeria',
      phone: '+234-809-555-0199',
    },
  ]);

  const [checkOutGuests, setCheckOutGuests] = useState<CheckOutGuest[]>([
    { id: '1', guestName: 'Ngozi Adeyemi', roomNumber: '205', checkOutTime: '11:00', nights: 4, totalBill: 520_000, status: 'pending' },
    { id: '2', guestName: 'Aisha Bello', roomNumber: '102', checkOutTime: '11:30', nights: 3, totalBill: 360_000, status: 'overdue' },
    { id: '3', guestName: 'Biodun Fashola', roomNumber: '203', checkOutTime: '12:00', nights: 2, totalBill: 240_000, status: 'pending' },
  ]);

  const pendingCheckouts = checkOutGuests.filter((g) => !processedIds.includes(g.id));
  const todayArrivals = 8;

  const handleConfirmCheckout = (guestId: string, comment: string) => {
    setProcessedIds((prev) => [...prev, guestId]);
    setCheckoutTarget(null);
    // In real app: POST to API with guestId + comment
  };

  const tabs = [
    { id: 'checkins' as const, label: "Today's Arrivals", Icon: CalendarCheck2, count: todayArrivals, color: 'text-emerald-400' },
    { id: 'checkouts' as const, label: 'Pending Check-Outs', Icon: CalendarX2, count: pendingCheckouts.length, color: 'text-amber-400' },
    { id: 'inhouse' as const, label: 'In-House', Icon: BedDouble, count: checkedInGuests.length, color: 'text-blue-400' },
  ];

  return (
    <div className="space-y-6 max-w-[1400px]">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Front Desk</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {new Date().toLocaleDateString('en-NG', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
        <button className="flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground text-sm font-semibold rounded-xl hover:shadow-lg hover:shadow-primary/30 transition-all">
          <ConciergeBell size={16} />
          New Walk-In
        </button>
      </div>

      {/* Operations Summary Bar */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Today's Arrivals", value: todayArrivals, Icon: CalendarCheck2, c: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' },
          { label: 'Pending Check-Outs', value: pendingCheckouts.length, Icon: CalendarX2, c: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20' },
          { label: 'Guests In-House', value: checkedInGuests.length, Icon: Users, c: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/20' },
          { label: 'Available Rooms', value: AVAILABLE_ROOMS.length, Icon: BedDouble, c: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' },
        ].map(({ label, value, Icon, c, bg }) => (
          <div key={label} className={`flex items-center gap-3 p-4 rounded-2xl border ${bg} bg-card hover:shadow-md transition-all`}>
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${bg}`}>
              <Icon size={18} className={c} />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{value}</p>
              <p className="text-xs text-muted-foreground">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Main Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left — Tabs Panel */}
        <div className="lg:col-span-2 bg-card border border-border rounded-2xl overflow-hidden">
          {/* Tab Header */}
          <div className="flex border-b border-border">
            {tabs.map(({ id, label, Icon, count, color }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`flex-1 flex flex-col items-center gap-1 px-4 py-3.5 text-xs font-medium border-b-2 transition-all duration-200 ${
                  activeTab === id
                    ? 'border-primary text-primary bg-primary/5'
                    : 'border-transparent text-muted-foreground hover:text-foreground hover:bg-secondary/40'
                }`}
              >
                <div className="flex items-center gap-1.5">
                  <Icon size={14} className={activeTab === id ? 'text-primary' : color} />
                  <span className={`font-bold ${activeTab === id ? 'text-primary' : ''}`}>{count}</span>
                </div>
                <span>{label}</span>
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="p-4 space-y-3 min-h-[320px]">
            {/* ARRIVALS TAB */}
            {activeTab === 'checkins' && (
              <>
                {[
                  { id: 'a1', guestName: 'Tunde Bakare', room: '103', roomType: 'Standard', arrival: '14:00', nights: 2 },
                  { id: 'a2', guestName: 'Chinwe Eze', room: '302', roomType: 'Deluxe', arrival: '15:00', nights: 3 },
                  { id: 'a3', guestName: 'Musa Ibrahim', room: '401', roomType: 'Suite', arrival: '16:00', nights: 1 },
                ].map((arr) => (
                  <div
                    key={arr.id}
                    className="flex items-center justify-between p-4 bg-secondary/50 rounded-xl border border-border hover:border-primary/25 transition-all group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-emerald-500/15 border border-emerald-500/25 flex items-center justify-center text-xs font-bold text-emerald-400">
                        {arr.guestName.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                      </div>
                      <div>
                        <p className="font-semibold text-foreground text-sm">{arr.guestName}</p>
                        <p className="text-xs text-muted-foreground">
                          Room {arr.room} · {arr.nights} night{arr.nights > 1 ? 's' : ''}
                          <span className={`ml-2 text-[10px] font-semibold px-1.5 py-0.5 rounded-full border ${ROOM_TYPE_COLOR[arr.roomType]}`}>
                            {arr.roomType}
                          </span>
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="text-right mr-2">
                        <p className="text-xs text-muted-foreground">Arrival</p>
                        <p className="text-sm font-semibold text-foreground">{arr.arrival}</p>
                      </div>
                      <button className="px-3 py-1.5 text-xs bg-emerald-500/15 border border-emerald-500/25 text-emerald-400 hover:bg-emerald-500/25 rounded-lg font-medium transition-colors">
                        Check In
                      </button>
                    </div>
                  </div>
                ))}
              </>
            )}

            {/* CHECKOUTS TAB */}
            {activeTab === 'checkouts' && (
              <>
                {pendingCheckouts.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
                    <CheckCircle2 size={36} className="mb-3 text-emerald-500/40" />
                    <p className="text-sm font-medium">All check-outs processed</p>
                    <p className="text-xs mt-1">Great work!</p>
                  </div>
                ) : (
                  pendingCheckouts.map((g) => (
                    <div
                      key={g.id}
                      className={`flex items-center justify-between p-4 rounded-xl border transition-all ${
                        g.status === 'overdue'
                          ? 'bg-red-500/5 border-red-500/25 hover:border-red-500/40'
                          : 'bg-secondary/50 border-amber-500/20 hover:border-amber-500/40'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold border ${
                          g.status === 'overdue'
                            ? 'bg-red-500/15 border-red-500/25 text-red-400'
                            : 'bg-amber-500/15 border-amber-500/25 text-amber-400'
                        }`}>
                          {g.guestName.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-semibold text-foreground text-sm">{g.guestName}</p>
                            {g.status === 'overdue' && (
                              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-red-500/15 border border-red-500/25 text-red-400">
                                OVERDUE
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground">
                            Room {g.roomNumber} · {g.nights} nights · By {g.checkOutTime}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <p className="font-bold text-foreground text-sm">{formatNaira(g.totalBill)}</p>
                          <p className="text-xs text-muted-foreground">Total bill</p>
                        </div>
                        <button
                          onClick={() => setCheckoutTarget(g)}
                          className="px-3 py-1.5 text-xs bg-primary/15 border border-primary/25 text-primary hover:bg-primary/25 rounded-lg font-medium transition-colors"
                        >
                          Process
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </>
            )}

            {/* IN-HOUSE TAB */}
            {activeTab === 'inhouse' && (
              <>
                {checkedInGuests.map((g) => (
                  <div
                    key={g.id}
                    className="flex items-center justify-between p-4 bg-secondary/50 rounded-xl border border-border hover:border-blue-500/25 transition-all group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-blue-500/15 border border-blue-500/25 flex items-center justify-center text-xs font-bold text-blue-400">
                        {g.guestName.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                      </div>
                      <div>
                        <p className="font-semibold text-foreground text-sm">{g.guestName}</p>
                        <div className="flex items-center gap-3 mt-0.5">
                          <p className="text-xs text-muted-foreground flex items-center gap-1">
                            <BedDouble size={10} />
                            Room {g.roomNumber}
                            <span className={`ml-1 text-[10px] font-semibold px-1.5 py-0.5 rounded-full border ${ROOM_TYPE_COLOR[g.roomType]}`}>
                              {g.roomType}
                            </span>
                          </p>
                          <p className="text-xs text-muted-foreground flex items-center gap-1">
                            <MapPin size={10} /> {g.country}
                          </p>
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          Checked in {g.checkInTime} · Due out {g.checkOutDate}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="p-2 rounded-lg bg-primary/15 border border-primary/25 text-primary hover:bg-primary/25 transition-colors" title="Room Key">
                        <Key size={13} />
                      </button>
                      <button className="p-2 rounded-lg bg-blue-500/15 border border-blue-500/25 text-blue-400 hover:bg-blue-500/25 transition-colors" title="Requests">
                        <Bell size={13} />
                      </button>
                      <button className="p-2 rounded-lg bg-secondary border border-border text-muted-foreground hover:text-foreground hover:bg-secondary/80 transition-colors" title="Contact">
                        <Phone size={13} />
                      </button>
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>
        </div>

        {/* Right Panel — Available Rooms */}
        <div className="bg-card border border-border rounded-2xl overflow-hidden">
          <div className="px-5 py-4 border-b border-border flex items-center justify-between">
            <h3 className="text-sm font-semibold text-foreground">Available Rooms</h3>
            <span className="text-xs font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full">
              {AVAILABLE_ROOMS.length} ready
            </span>
          </div>
          <div className="p-4 grid grid-cols-2 gap-2.5">
            {AVAILABLE_ROOMS.map(({ room, type }) => (
              <button
                key={room}
                className={`flex flex-col items-center justify-center p-3 rounded-xl border hover:shadow-md transition-all duration-200 group ${ROOM_TYPE_COLOR[type]}`}
              >
                <BedDouble size={16} className="mb-1.5 group-hover:scale-110 transition-transform" />
                <p className="text-sm font-bold">{room}</p>
                <p className="text-[10px] opacity-70">{type}</p>
              </button>
            ))}
          </div>

          {/* Legend */}
          <div className="px-5 pb-4 space-y-1.5">
            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">Room Types</p>
            {Object.entries(ROOM_TYPE_COLOR).map(([type, cls]) => (
              <div key={type} className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full border ${cls}`} />
                <p className={`text-xs font-medium ${cls.split(' ').find((c) => c.startsWith('text-'))}`}>{type}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Checkout Comment Modal */}
      {checkoutTarget && (
        <CheckoutCommentModal
          guest={checkoutTarget}
          onConfirm={handleConfirmCheckout}
          onCancel={() => setCheckoutTarget(null)}
        />
      )}
    </div>
  );
}
