'use client';

import { useState } from 'react';
import {
  Users, BedDouble, CalendarCheck2, CalendarX2, Clock, TrendingUp, ArrowRight,
} from 'lucide-react';
import DashboardStats from '@/components/dashboard/dashboard-stats';
import OccupancyChart from '@/components/dashboard/occupancy-chart';
import RevenueChart from '@/components/dashboard/revenue-chart';
import RecentReservations from '@/components/dashboard/recent-reservations';
import { useAuth } from '@/lib/auth-context';
import { formatNaira } from '@/lib/utils';

const TODAY_STATS = [
  { label: "Today's Arrivals", value: 8, Icon: CalendarCheck2, color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' },
  { label: "Today's Departures", value: 5, Icon: CalendarX2, color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20' },
  { label: 'Currently In-House', value: 23, Icon: BedDouble, color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/20' },
  { label: 'Pending Check-outs', value: 3, Icon: Clock, color: 'text-red-400', bg: 'bg-red-500/10 border-red-500/20' },
];

export default function DashboardPage() {
  const { user } = useAuth();
  const [stats] = useState({
    totalGuests: 156,
    occupancyRate: 78,
    averageDailyRate: 85000,
    totalRevenue: 58420000,
  });

  const [reservations] = useState([
    { id: '1', guestName: 'Emeka Okafor', roomNumber: '301', checkIn: '2024-06-15', checkOut: '2024-06-18', status: 'checked-in', amount: 255000 },
    { id: '2', guestName: 'Ngozi Adeyemi', roomNumber: '205', checkIn: '2024-06-16', checkOut: '2024-06-20', status: 'confirmed', amount: 340000 },
    { id: '3', guestName: 'Chidi Nwosu', roomNumber: '410', checkIn: '2024-06-17', checkOut: '2024-06-19', status: 'confirmed', amount: 170000 },
    { id: '4', guestName: 'Aisha Bello', roomNumber: '112', checkIn: '2024-06-14', checkOut: '2024-06-17', status: 'checked-out', amount: 225000 },
  ]);

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div className="space-y-8 max-w-[1400px]">
      {/* Welcome Banner */}
      <div className="relative rounded-2xl overflow-hidden border border-primary/20 bg-gradient-to-br from-[#141830] via-[#0f1225] to-[#0a0e27]">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-80 h-80 bg-primary/8 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-1/3 w-60 h-60 bg-indigo-500/5 rounded-full blur-3xl" />
          {/* Grid pattern */}
          <svg className="absolute inset-0 opacity-[0.04]" width="100%" height="100%">
            <defs>
              <pattern id="grid" width="32" height="32" patternUnits="userSpaceOnUse">
                <path d="M 32 0 L 0 0 0 32" fill="none" stroke="white" strokeWidth="0.5" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>

        <div className="relative z-10 flex items-center justify-between p-8">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/15 border border-primary/30 rounded-full text-xs font-semibold text-primary mb-4">
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
              Live Operations
            </div>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              {greeting()},{' '}
              <span className="text-primary">
                {user?.fullName?.split(' ')[0] ?? 'Manager'}
              </span>
            </h1>
            <p className="text-muted-foreground text-sm max-w-md">
              Here's what's happening at Zinuel-ch today. You have{' '}
              <span className="text-foreground font-medium">8 arrivals</span> and{' '}
              <span className="text-foreground font-medium">5 departures</span> scheduled.
            </p>
          </div>
          <div className="hidden lg:flex items-center gap-4">
            <div className="text-right">
              <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Today's Revenue</p>
              <p className="text-2xl font-bold text-primary">{formatNaira(2_450_000)}</p>
              <div className="flex items-center gap-1 justify-end mt-1">
                <TrendingUp size={12} className="text-emerald-400" />
                <p className="text-xs text-emerald-400 font-medium">+18% vs yesterday</p>
              </div>
            </div>
          </div>
        </div>

        {/* Today's quick stats row */}
        <div className="relative z-10 grid grid-cols-2 lg:grid-cols-4 gap-px border-t border-white/5">
          {TODAY_STATS.map(({ label, value, Icon, color, bg }) => (
            <div key={label} className="flex items-center gap-3 px-6 py-4 bg-white/[0.01] hover:bg-white/[0.03] transition-colors">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center border ${bg}`}>
                <Icon size={16} className={color} />
              </div>
              <div>
                <p className="text-xl font-bold text-foreground">{value}</p>
                <p className="text-xs text-muted-foreground">{label}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Key Metrics */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-foreground uppercase tracking-wider">Key Metrics</h2>
          <button className="text-xs text-primary hover:text-accent flex items-center gap-1 transition-colors">
            View Reports <ArrowRight size={12} />
          </button>
        </div>
        <DashboardStats stats={stats} />
      </div>

      {/* Charts */}
      <div>
        <h2 className="text-sm font-semibold text-foreground uppercase tracking-wider mb-4">Performance</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <OccupancyChart />
          <RevenueChart />
        </div>
      </div>

      {/* Recent Reservations */}
      <div>
        <h2 className="text-sm font-semibold text-foreground uppercase tracking-wider mb-4">Recent Reservations</h2>
        <RecentReservations reservations={reservations} />
      </div>
    </div>
  );
}
