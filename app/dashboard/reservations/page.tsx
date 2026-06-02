'use client';

import { useState } from 'react';
import ReservationsList from '@/components/reservations/reservations-list';
import CreateReservationModal from '@/components/reservations/create-reservation-modal';

export default function ReservationsPage() {
  const [showModal, setShowModal] = useState(false);
  const [reservations, setReservations] = useState([
    {
      id: '1',
      reservationId: 'RES-001',
      guestName: 'John Smith',
      email: 'john@example.com',
      roomNumber: '301',
      checkIn: '2024-06-15',
      checkOut: '2024-06-18',
      nights: 3,
      totalPrice: 360,
      status: 'checked-in',
    },
    {
      id: '2',
      reservationId: 'RES-002',
      guestName: 'Sarah Johnson',
      email: 'sarah@example.com',
      roomNumber: '205',
      checkIn: '2024-06-16',
      checkOut: '2024-06-20',
      nights: 4,
      totalPrice: 520,
      status: 'confirmed',
    },
    {
      id: '3',
      reservationId: 'RES-003',
      guestName: 'Michael Chen',
      email: 'michael@example.com',
      roomNumber: '410',
      checkIn: '2024-06-17',
      checkOut: '2024-06-19',
      nights: 2,
      totalPrice: 280,
      status: 'confirmed',
    },
    {
      id: '4',
      reservationId: 'RES-004',
      guestName: 'Emma Davis',
      email: 'emma@example.com',
      roomNumber: '102',
      checkIn: '2024-06-21',
      checkOut: '2024-06-25',
      nights: 4,
      totalPrice: 480,
      status: 'pending',
    },
  ]);

  const handleAddReservation = (newReservation: any) => {
    setReservations([
      ...reservations,
      { ...newReservation, id: String(reservations.length + 1) },
    ]);
    setShowModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold gradient-text mb-2">
            Reservations
          </h1>
          <p className="text-muted-foreground">
            Manage and track all guest reservations
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="btn-premium bg-primary text-primary-foreground"
        >
          + New Reservation
        </button>
      </div>

      {/* Reservations List */}
      <ReservationsList reservations={reservations} />

      {/* Create Reservation Modal */}
      {showModal && (
        <CreateReservationModal
          onClose={() => setShowModal(false)}
          onSubmit={handleAddReservation}
        />
      )}
    </div>
  );
}
