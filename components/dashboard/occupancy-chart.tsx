'use client';

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

const data = [
  { date: 'Mon', occupancy: 65, available: 35 },
  { date: 'Tue', occupancy: 72, available: 28 },
  { date: 'Wed', occupancy: 78, available: 22 },
  { date: 'Thu', occupancy: 85, available: 15 },
  { date: 'Fri', occupancy: 92, available: 8 },
  { date: 'Sat', occupancy: 95, available: 5 },
  { date: 'Sun', occupancy: 88, available: 12 },
];

export default function OccupancyChart() {
  return (
    <div className="card-premium">
      <h3 className="text-lg font-semibold text-foreground mb-6">
        Weekly Occupancy
      </h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
          <XAxis dataKey="date" stroke="rgba(255,255,255,0.6)" />
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
          <Line
            type="monotone"
            dataKey="occupancy"
            stroke="rgb(255,215,0)"
            strokeWidth={2}
            dot={{ fill: 'rgb(255,215,0)', r: 4 }}
          />
          <Line
            type="monotone"
            dataKey="available"
            stroke="rgba(255,255,255,0.3)"
            strokeWidth={2}
            dot={{ fill: 'rgba(255,255,255,0.3)', r: 4 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
