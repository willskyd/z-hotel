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
    <div className="bg-card border border-border rounded-xl p-6 hover:border-primary/30 transition-all duration-300">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-foreground">
          Weekly Occupancy
        </h3>
        <span className="text-sm bg-primary/20 border border-primary/30 text-primary px-3 py-1 rounded-full">
          78% Avg
        </span>
      </div>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#242839" />
          <XAxis 
            dataKey="date" 
            stroke="#8e92a3"
            style={{ fontSize: '12px' }}
          />
          <YAxis 
            stroke="#8e92a3"
            style={{ fontSize: '12px' }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#14172c',
              border: '1px solid #242839',
              borderRadius: '8px',
            }}
            labelStyle={{ color: '#f0f0f0' }}
          />
          <Legend />
          <Line
            type="monotone"
            dataKey="occupancy"
            stroke="#d4a574"
            strokeWidth={3}
            dot={{ fill: '#d4a574', r: 5 }}
            activeDot={{ r: 7 }}
          />
          <Line
            type="monotone"
            dataKey="available"
            stroke="#8e92a3"
            strokeWidth={2}
            strokeDasharray="5 5"
            dot={{ fill: '#8e92a3', r: 4 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
