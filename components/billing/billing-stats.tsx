interface BillingStatProps {
  stats: {
    totalCollected: number;
    pendingPayments: number;
    totalInvoices: number;
    averageInvoice: number;
  };
}

const StatCard = ({
  title,
  value,
  icon,
  trend,
}: {
  title: string;
  value: string;
  icon: string;
  trend?: number;
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
    <p className="text-3xl font-bold text-foreground">{value}</p>
  </div>
);

export default function BillingStats({ stats }: BillingStatProps) {
  return (
    <div className="dashboard-grid">
      <StatCard
        title="Total Collected"
        value={`$${stats.totalCollected.toLocaleString()}`}
        icon="✅"
        trend={12}
      />
      <StatCard
        title="Pending Payments"
        value={`$${stats.pendingPayments.toLocaleString()}`}
        icon="⏳"
        trend={-3}
      />
      <StatCard
        title="Total Invoices"
        value={stats.totalInvoices.toString()}
        icon="📋"
      />
      <StatCard
        title="Average Invoice"
        value={`$${stats.averageInvoice}`}
        icon="📊"
        trend={5}
      />
    </div>
  );
}
