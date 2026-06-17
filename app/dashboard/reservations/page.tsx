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
      guestName: 'Emeka Okafor',
      email: 'emeka.okafor@email.com',
      roomNumber: '301',
      checkIn: '2024-06-15',
      checkOut: '2024-06-18',
      nights: 3,
      totalPrice: 450000,
      status: 'checked-in',
    },
    {
      id: '2',
      reservationId: 'RES-002',
      guestName: 'Ngozi Adeyemi',
      email: 'ngozi.adeyemi@email.com',
      roomNumber: '410',
      checkIn: '2024-06-16',
      checkOut: '2024-06-20',
      nights: 4,
      totalPrice: 600000,
      status: 'confirmed',
    },
    {
      id: '3',
      reservationId: 'RES-003',
      guestName: 'Chidi Nwosu',
      email: 'chidi.nwosu@email.com',
      roomNumber: '501',
      checkIn: '2024-06-17',
      checkOut: '2024-06-19',
      nights: 2,
      totalPrice: 240000,
      status: 'confirmed',
    },
    {
      id: '4',
      reservationId: 'RES-004',
      guestName: 'Aisha Bello',
      email: 'aisha.bello@email.com',
      roomNumber: '102',
      checkIn: '2024-06-21',
      checkOut: '2024-06-25',
      nights: 4,
      totalPrice: 340000,
      status: 'pending',
    },
    {
      id: '5',
      reservationId: 'RES-005',
      guestName: 'Tunde Fashola',
      email: 'tunde.fashola@corp.ng',
      roomNumber: '502',
      checkIn: '2024-06-22',
      checkOut: '2024-06-24',
      nights: 2,
      totalPrice: 300000,
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
