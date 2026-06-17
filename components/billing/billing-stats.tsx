'use client';

import { CheckCircle2, Clock, FileText, BarChart3, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { formatNairaCompact } from '@/lib/utils';

interface BillingStatProps {
  stats: {
    totalCollected: number;
    pendingPayments: number;
    totalInvoices: number;
    averageInvoice: number;
  };
}

interface CardProps {
  title: string;
  value: string;
  subtext?: string;
  trend?: number;
  Icon: React.ElementType;
  accentColor: string;
}

function StatCard({ title, value, subtext, trend, Icon, accentColor }: CardProps) {
  const positive = trend === undefined || trend >= 0;
  return (
    <div className="bg-card border border-border rounded-2xl p-6 hover:border-primary/20 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 group relative overflow-hidden">
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
        style={{ background: `radial-gradient(circle at top right, ${accentColor}08, transparent 70%)` }}
      />
      <div className="relative z-10">
        <div className="flex items-start justify-between mb-5">
          <div className="w-11 h-11 rounded-xl flex items-center justify-center border" style={{ background: `${accentColor}18`, borderColor: `${accentColor}30` }}>
            <Icon size={20} style={{ color: accentColor }} />
          </div>
          {trend !== undefined && (
            <div className={`flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full ${
              positive ? 'bg-emerald-500/15 text-emerald-400' : 'bg-red-500/15 text-red-400'
            }`}>
              {positive ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
              {Math.abs(trend)}%
            </div>
          )}
        </div>
        <p className="text-muted-foreground text-xs font-semibold uppercase tracking-wider mb-2">{title}</p>
        <p className="text-3xl font-bold text-foreground">{value}</p>
        {subtext && <p className="text-xs text-muted-foreground mt-1.5">{subtext}</p>}
      </div>
    </div>
  );
}

export default function BillingStats({ stats }: BillingStatProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
      <StatCard
        title="Total Collected"
        value={formatNairaCompact(stats.totalCollected)}
        subtext="All payments received"
        trend={12}
        Icon={CheckCircle2}
        accentColor="#10b981"
      />
      <StatCard
        title="Pending Payments"
        value={formatNairaCompact(stats.pendingPayments)}
        subtext="Awaiting collection"
        trend={-3}
        Icon={Clock}
        accentColor="#f59e0b"
      />
      <StatCard
        title="Total Invoices"
        value={stats.totalInvoices.toString()}
        subtext="Invoices issued"
        Icon={FileText}
        accentColor="#6366f1"
      />
      <StatCard
        title="Average Invoice"
        value={formatNairaCompact(stats.averageInvoice)}
        subtext="Per transaction"
        trend={5}
        Icon={BarChart3}
        accentColor="#d4a574"
      />
    </div>
  );
}
