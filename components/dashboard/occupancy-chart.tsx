'use client';

import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';

const data = [
  { date: 'Mon', occupancy: 65 },
  { date: 'Tue', occupancy: 72 },
  { date: 'Wed', occupancy: 78 },
  { date: 'Thu', occupancy: 85 },
  { date: 'Fri', occupancy: 92 },
  { date: 'Sat', occupancy: 95 },
  { date: 'Sun', occupancy: 88 },
];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-card border border-border rounded-xl px-4 py-3 shadow-xl">
        <p className="text-xs text-muted-foreground mb-1">{label}</p>
        <p className="text-base font-bold text-primary">{payload[0].value}%</p>
        <p className="text-xs text-muted-foreground">occupancy</p>
      </div>
    );
  }
  return null;
};

export default function OccupancyChart() {
  return (
    <div className="bg-card border border-border rounded-2xl p-6 hover:border-primary/30 transition-all duration-300">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-base font-semibold text-foreground">Weekly Occupancy</h3>
          <p className="text-xs text-muted-foreground mt-0.5">This week</p>
        </div>
        <span className="text-xs font-semibold bg-primary/15 border border-primary/25 text-primary px-3 py-1 rounded-full">
          82% Avg
        </span>
      </div>
      <ResponsiveContainer width="100%" height={260}>
        <AreaChart data={data}>
          <defs>
            <linearGradient id="occupancyGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#d4a574" stopOpacity={0.25} />
              <stop offset="95%" stopColor="#d4a574" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#242839" vertical={false} />
          <XAxis
            dataKey="date"
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
            tickFormatter={(v) => `${v}%`}
            domain={[0, 100]}
            width={40}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#d4a574', strokeWidth: 1, strokeDasharray: '4 4' }} />
          <Area
            type="monotone"
            dataKey="occupancy"
            stroke="#d4a574"
            strokeWidth={2.5}
            fill="url(#occupancyGrad)"
            dot={{ fill: '#d4a574', r: 4, strokeWidth: 0 }}
            activeDot={{ r: 6, fill: '#d4a574', strokeWidth: 2, stroke: '#0a0e27' }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
