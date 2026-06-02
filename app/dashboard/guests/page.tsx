'use client';

import { useState } from 'react';
import GuestsList from '@/components/guests/guests-list';
import AddGuestModal from '@/components/guests/add-guest-modal';

export default function GuestsPage() {
  const [showModal, setShowModal] = useState(false);
  const [guests, setGuests] = useState([
    {
      id: '1',
      firstName: 'John',
      lastName: 'Smith',
      email: 'john@example.com',
      phone: '+1-555-0101',
      country: 'United States',
      totalStays: 5,
      lastVisit: '2024-06-15',
    },
    {
      id: '2',
      firstName: 'Sarah',
      lastName: 'Johnson',
      email: 'sarah@example.com',
      phone: '+1-555-0102',
      country: 'Canada',
      totalStays: 3,
      lastVisit: '2024-06-16',
    },
    {
      id: '3',
      firstName: 'Michael',
      lastName: 'Chen',
      email: 'michael@example.com',
      phone: '+1-555-0103',
      country: 'United States',
      totalStays: 8,
      lastVisit: '2024-06-17',
    },
    {
      id: '4',
      firstName: 'Emma',
      lastName: 'Davis',
      email: 'emma@example.com',
      phone: '+1-555-0104',
      country: 'United Kingdom',
      totalStays: 2,
      lastVisit: '2024-06-10',
    },
  ]);

  const handleAddGuest = (newGuest: any) => {
    setGuests([
      ...guests,
      {
        ...newGuest,
        id: String(guests.length + 1),
        totalStays: 1,
        lastVisit: new Date().toISOString().split('T')[0],
      },
    ]);
    setShowModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold gradient-text mb-2">Guests</h1>
          <p className="text-muted-foreground">
            Manage guest profiles and CRM data
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="btn-premium bg-primary text-primary-foreground"
        >
          + Add Guest
        </button>
      </div>

      {/* Guests List */}
      <GuestsList guests={guests} />

      {/* Add Guest Modal */}
      {showModal && (
        <AddGuestModal
          onClose={() => setShowModal(false)}
          onSubmit={handleAddGuest}
        />
      )}
    </div>
  );
}
