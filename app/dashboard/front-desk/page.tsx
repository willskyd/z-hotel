'use client';

import { useState } from 'react';
import CheckInList from '@/components/front-desk/check-in-list';
import CheckOutList from '@/components/front-desk/check-out-list';

export default function FrontDeskPage() {
  const [checkedInGuests] = useState([
    {
      id: '1',
      guestName: 'John Smith',
      roomNumber: '301',
      checkInTime: '14:30',
      checkOutDate: '2024-06-18',
      status: 'checked-in',
    },
    {
      id: '2',
      guestName: 'Michael Chen',
      roomNumber: '410',
      checkInTime: '15:45',
      checkOutDate: '2024-06-19',
      status: 'checked-in',
    },
  ]);

  const [checkOutGuests] = useState([
    {
      id: '1',
      guestName: 'Sarah Johnson',
      roomNumber: '205',
      checkOutTime: '11:00',
      nights: 4,
      totalBill: 520,
    },
    {
      id: '2',
      guestName: 'Emma Davis',
      roomNumber: '102',
      checkOutTime: '11:30',
      nights: 3,
      totalBill: 360,
    },
  ]);

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold gradient-text mb-2">Front Desk</h1>
        <p className="text-muted-foreground">
          Manage check-ins, check-outs, and guest operations
        </p>
      </div>

      {/* Check-In & Check-Out Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CheckInList guests={checkedInGuests} />
        <CheckOutList guests={checkOutGuests} />
      </div>

      {/* Available Rooms */}
      <div className="card-premium">
        <h3 className="text-lg font-semibold text-foreground mb-6">
          Available Rooms
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {['101', '102', '104', '201', '203', '301', '302', '304'].map(
            (room) => (
              <button
                key={room}
                className="px-4 py-3 bg-green-500/10 border border-green-500/30 text-green-400 rounded-lg hover:bg-green-500/20 transition-colors font-medium"
              >
                Room {room}
              </button>
            )
          )}
        </div>
      </div>
    </div>
  );
}
