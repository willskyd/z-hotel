'use client';

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
} from 'recharts';
import { formatNairaCompact } from '@/lib/utils';

const data = [
  { month: 'Jan', revenue: 2400000 },
  { month: 'Feb', revenue: 2800000 },
  { month: 'Mar', revenue: 3500000 },
  { month: 'Apr', revenue: 3200000 },
  { month: 'May', revenue: 4200000 },
  { month: 'Jun', revenue: 4500000 },
];

const COLORS = ['#a78455', '#b08d5f', '#ba9669', '#c49f73', '#cea87d', '#d4a574'];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-card border border-border rounded-xl px-4 py-3 shadow-xl">
        <p className="text-xs text-muted-foreground mb-1">{label}</p>
        <p className="text-base font-bold text-foreground">{formatNairaCompact(payload[0].value)}</p>
      </div>
    );
  }
  return null;
};

export default function RevenueChart() {
  return (
    <div className="bg-card border border-border rounded-2xl p-6 hover:border-primary/30 transition-all duration-300">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-base font-semibold text-foreground">Monthly Revenue</h3>
          <p className="text-xs text-muted-foreground mt-0.5">Jan – Jun 2024</p>
        </div>
        <span className="text-xs font-semibold bg-emerald-500/15 border border-emerald-500/25 text-emerald-400 px-3 py-1 rounded-full">
          +15% Growth
        </span>
      </div>
      <ResponsiveContainer width="100%" height={260}>
        <BarChart data={data} barSize={32} barCategoryGap="30%">
          <CartesianGrid strokeDasharray="3 3" stroke="#242839" vertical={false} />
          <XAxis
            dataKey="month"
            stroke="#8e92a3"
            style={{ fontSize: '12px' }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            stroke="#8e92a3"
            style={{ fontSize: '11px' }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v) => formatNairaCompact(v)}
            width={60}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
          <Bar dataKey="revenue" radius={[8, 8, 0, 0]}>
            {data.map((entry, index) => (
              <Cell key={index} fill={COLORS[index % COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
