interface Stat {
  totalGuests: number;
  occupancyRate: number;
  averageDailyRate: number;
  totalRevenue: number;
}

interface DashboardStatsProps {
  stats: Stat;
}

const StatCard = ({
  title,
  value,
  suffix,
  trend,
  icon,
}: {
  title: string;
  value: string | number;
  suffix?: string;
  trend?: number;
  icon: string;
}) => (
  <div className="bg-card border border-border rounded-xl p-6 hover:border-primary/30 transition-all duration-300 group">
    <div className="flex items-start justify-between mb-6">
      <div className="w-12 h-12 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-2xl group-hover:bg-primary/20 transition-colors">
        {icon}
      </div>
      {trend !== undefined && (
        <span
          className={`text-xs font-semibold px-3 py-1 rounded-full ${
            trend > 0
              ? 'bg-green-500/20 text-green-400'
              : 'bg-red-500/20 text-red-400'
          }`}
        >
          {trend > 0 ? '↑' : '↓'} {Math.abs(trend)}%
        </span>
      )}
    </div>
    <p className="text-muted-foreground text-sm font-medium mb-2">{title}</p>
    <p className="text-4xl font-bold text-foreground">
      {value}<span className="text-xl text-muted-foreground ml-1">{suffix}</span>
    </p>
  </div>
);

export default function DashboardStats({ stats }: DashboardStatsProps) {
  return (
    <div className="dashboard-grid">
      <StatCard
        title="Total Guests"
        value={stats.totalGuests}
        icon="👥"
        trend={12}
      />
      <StatCard
        title="Occupancy Rate"
        value={stats.occupancyRate}
        suffix="%"
        icon="📈"
        trend={5}
      />
      <StatCard
        title="Average Daily Rate"
        value={`$${stats.averageDailyRate}`}
        icon="💰"
        trend={8}
      />
      <StatCard
        title="Total Revenue"
        value={`$${(stats.totalRevenue / 1000).toFixed(1)}K`}
        icon="💳"
        trend={15}
      />
    </div>
  );
}
