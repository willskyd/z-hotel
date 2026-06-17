'use client';

import { Users, BedDouble, TrendingUp, Wallet, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { formatNairaCompact } from '@/lib/utils';

interface Stat {
  totalGuests: number;
  occupancyRate: number;
  averageDailyRate: number;
  totalRevenue: number;
}

interface DashboardStatsProps {
  stats: Stat;
}

interface StatCardProps {
  title: string;
  value: string;
  subtext?: string;
  trend: number;
  Icon: React.ElementType;
  accentColor: string;
}

function StatCard({ title, value, subtext, trend, Icon, accentColor }: StatCardProps) {
  const positive = trend >= 0;
  return (
    <div className="bg-card border border-border rounded-2xl p-6 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 group relative overflow-hidden">
      {/* Background glow */}
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
        style={{ background: `radial-gradient(circle at top right, ${accentColor}08, transparent 70%)` }}
      />
      <div className="relative z-10">
        <div className="flex items-start justify-between mb-5">
          <div
            className="w-11 h-11 rounded-xl flex items-center justify-center border transition-colors duration-300"
            style={{ background: `${accentColor}18`, borderColor: `${accentColor}30` }}
          >
            <Icon size={20} style={{ color: accentColor }} />
          </div>
          <div
            className={`flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full ${
              positive ? 'bg-emerald-500/15 text-emerald-400' : 'bg-red-500/15 text-red-400'
            }`}
          >
            {positive ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
            {Math.abs(trend)}%
          </div>
        </div>
        <p className="text-muted-foreground text-xs font-semibold uppercase tracking-wider mb-2">{title}</p>
        <p className="text-3xl font-bold text-foreground tracking-tight">{value}</p>
        {subtext && <p className="text-xs text-muted-foreground mt-1.5">{subtext}</p>}
      </div>
    </div>
  );
}

export default function DashboardStats({ stats }: DashboardStatsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
      <StatCard
        title="Total Guests"
        value={stats.totalGuests.toLocaleString()}
        subtext="All-time registered guests"
        trend={12}
        Icon={Users}
        accentColor="#d4a574"
      />
      <StatCard
        title="Occupancy Rate"
        value={`${stats.occupancyRate}%`}
        subtext="Rooms occupied tonight"
        trend={5}
        Icon={BedDouble}
        accentColor="#6366f1"
      />
      <StatCard
        title="Avg Daily Rate"
        value={formatNairaCompact(stats.averageDailyRate)}
        subtext="Per room per night"
        trend={8}
        Icon={TrendingUp}
        accentColor="#10b981"
      />
      <StatCard
        title="Total Revenue"
        value={formatNairaCompact(stats.totalRevenue)}
        subtext="Month to date"
        trend={15}
        Icon={Wallet}
        accentColor="#f59e0b"
      />
    </div>
  );
}
