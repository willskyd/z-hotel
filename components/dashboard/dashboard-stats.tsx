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
  <div className="card-premium">
    <div className="flex items-start justify-between mb-4">
      <div className="text-3xl">{icon}</div>
      {trend !== undefined && (
        <span
          className={`text-xs font-semibold px-2 py-1 rounded-full ${
            trend > 0
              ? 'bg-green-500/20 text-green-400'
              : 'bg-red-500/20 text-red-400'
          }`}
        >
          {trend > 0 ? '+' : ''}{trend}%
        </span>
      )}
    </div>
    <p className="text-muted-foreground text-sm mb-1">{title}</p>
    <p className="text-3xl font-bold text-foreground">
      {value}{suffix}
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
