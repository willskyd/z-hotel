'use client';

import { useEffect, useState } from 'react';
import DashboardStats from '@/components/dashboard/dashboard-stats';
import OccupancyChart from '@/components/dashboard/occupancy-chart';
import RevenueChart from '@/components/dashboard/revenue-chart';
import RecentReservations from '@/components/dashboard/recent-reservations';

export default function DashboardPage() {
  const [stats, setStats] = useState({
    totalGuests: 156,
    occupancyRate: 78,
    averageDailyRate: 245,
    totalRevenue: 58420,
  });

  const [reservations, setReservations] = useState([
    {
      id: '1',
      guestName: 'John Smith',
      roomNumber: '301',
      checkIn: '2024-06-15',
      checkOut: '2024-06-18',
      status: 'checked-in',
    },
    {
      id: '2',
      guestName: 'Sarah Johnson',
      roomNumber: '205',
      checkIn: '2024-06-16',
      checkOut: '2024-06-20',
      status: 'confirmed',
    },
    {
      id: '3',
      guestName: 'Michael Chen',
      roomNumber: '410',
      checkIn: '2024-06-17',
      checkOut: '2024-06-19',
      status: 'confirmed',
    },
  ]);

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="relative bg-gradient-to-r from-primary/20 to-accent/20 border border-primary/30 rounded-2xl p-8 overflow-hidden">
        {/* Decorative Elements */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl -z-10"></div>
        
        <div className="flex items-center justify-between">
          <div className="z-10">
            <div className="inline-block px-3 py-1 bg-primary/20 border border-primary/40 rounded-full text-xs font-semibold text-primary mb-4">
              Welcome Back
            </div>
            <h1 className="text-4xl font-bold text-foreground mb-3">
              Your Hotel Dashboard
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl">
              Get a complete overview of your property operations, manage reservations, and track key performance metrics in real-time.
            </p>
          </div>
          <div className="hidden lg:flex h-32 w-32 rounded-2xl bg-primary/10 border border-primary/20 items-center justify-center">
            <div className="text-5xl">📊</div>
          </div>
        </div>
      </div>

      {/* Key Statistics */}
      <div>
        <h2 className="text-lg font-semibold text-foreground mb-4">Key Metrics</h2>
        <DashboardStats stats={stats} />
      </div>

      {/* Charts Section */}
      <div>
        <h2 className="text-lg font-semibold text-foreground mb-4">Performance Insights</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <OccupancyChart />
          <RevenueChart />
        </div>
      </div>

      {/* Recent Reservations */}
      <div>
        <h2 className="text-lg font-semibold text-foreground mb-4">Recent Activity</h2>
        <RecentReservations reservations={reservations} />
      </div>
    </div>
  );
}
