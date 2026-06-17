'use client';

import { Users, Star, TrendingUp, Repeat2 } from 'lucide-react';
import { formatNairaCompact } from '@/lib/utils';

interface GuestStat {
  totalGuests: number;
  topSpender: string;
  topSpenderRevenue: number;
  avgRevenuePerGuest: number;
  returnRate: number;
}

export default function GuestStatsOverview({ stats }: { stats: GuestStat }) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <div className="bg-card border border-border rounded-2xl p-5 hover:border-primary/30 transition-all duration-300">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-9 h-9 rounded-xl bg-primary/15 border border-primary/25 flex items-center justify-center">
            <Users size={16} className="text-primary" />
          </div>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Total Guests</p>
        </div>
        <p className="text-2xl font-bold text-foreground">{stats.totalGuests.toLocaleString()}</p>
        <p className="text-xs text-muted-foreground mt-1">All-time registered</p>
      </div>

      <div className="bg-card border border-border rounded-2xl p-5 hover:border-amber-500/30 transition-all duration-300">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-9 h-9 rounded-xl bg-amber-500/15 border border-amber-500/25 flex items-center justify-center">
            <Star size={16} className="text-amber-400" />
          </div>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Top Spender</p>
        </div>
        <p className="text-base font-bold text-foreground truncate">{stats.topSpender}</p>
        <p className="text-xs text-amber-400 font-semibold mt-1">{formatNairaCompact(stats.topSpenderRevenue)} total</p>
      </div>

      <div className="bg-card border border-border rounded-2xl p-5 hover:border-emerald-500/30 transition-all duration-300">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-500/15 border border-emerald-500/25 flex items-center justify-center">
            <TrendingUp size={16} className="text-emerald-400" />
          </div>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Avg Revenue / Guest</p>
        </div>
        <p className="text-2xl font-bold text-foreground">{formatNairaCompact(stats.avgRevenuePerGuest)}</p>
        <p className="text-xs text-muted-foreground mt-1">Lifetime average</p>
      </div>

      <div className="bg-card border border-border rounded-2xl p-5 hover:border-blue-500/30 transition-all duration-300">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-9 h-9 rounded-xl bg-blue-500/15 border border-blue-500/25 flex items-center justify-center">
            <Repeat2 size={16} className="text-blue-400" />
          </div>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Return Rate</p>
        </div>
        <p className="text-2xl font-bold text-foreground">{stats.returnRate}%</p>
        <p className="text-xs text-muted-foreground mt-1">Guests who return</p>
      </div>
    </div>
  );
}
