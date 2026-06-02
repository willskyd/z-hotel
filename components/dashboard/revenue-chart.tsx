'use client';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

const data = [
  { month: 'Jan', revenue: 24000, target: 30000 },
  { month: 'Feb', revenue: 28000, target: 30000 },
  { month: 'Mar', revenue: 35000, target: 30000 },
  { month: 'Apr', revenue: 32000, target: 30000 },
  { month: 'May', revenue: 42000, target: 35000 },
  { month: 'Jun', revenue: 45000, target: 35000 },
];

export default function RevenueChart() {
  return (
    <div className="card-premium">
      <h3 className="text-lg font-semibold text-foreground mb-6">
        Monthly Revenue
      </h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
          <XAxis dataKey="month" stroke="rgba(255,255,255,0.6)" />
          <YAxis stroke="rgba(255,255,255,0.6)" />
          <Tooltip
            contentStyle={{
              backgroundColor: 'rgba(0,0,0,0.8)',
              border: '1px solid rgba(255,215,0,0.2)',
              borderRadius: '8px',
            }}
            labelStyle={{ color: 'rgba(255,255,255,0.8)' }}
          />
          <Legend />
          <Bar dataKey="revenue" fill="rgb(255,215,0)" radius={[8, 8, 0, 0]} />
          <Bar
            dataKey="target"
            fill="rgba(255,255,255,0.2)"
            radius={[8, 8, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
