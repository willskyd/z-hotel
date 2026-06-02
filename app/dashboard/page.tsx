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
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold gradient-text mb-2">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back! Here{"'"}s what{"'"}s happening with your hotel today.
        </p>
      </div>

      {/* Key Statistics */}
      <DashboardStats stats={stats} />

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <OccupancyChart />
        <RevenueChart />
      </div>

      {/* Recent Reservations */}
      <RecentReservations reservations={reservations} />
    </div>
  );
}
