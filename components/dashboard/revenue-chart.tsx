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
    <div className="bg-card border border-border rounded-xl p-6 hover:border-primary/30 transition-all duration-300">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-foreground">
          Monthly Revenue
        </h3>
        <span className="text-sm bg-green-500/20 border border-green-500/30 text-green-400 px-3 py-1 rounded-full">
          +15% Growth
        </span>
      </div>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#242839" />
          <XAxis 
            dataKey="month" 
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
          <Bar 
            dataKey="revenue" 
            fill="#d4a574" 
            radius={[8, 8, 0, 0]}
          />
          <Bar
            dataKey="target"
            fill="#8e92a3"
            opacity={0.4}
            radius={[8, 8, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
