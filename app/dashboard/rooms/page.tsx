'use client';

import { useState } from 'react';
import RoomsList from '@/components/rooms/rooms-list';
import CreateRoomModal from '@/components/rooms/create-room-modal';

export default function RoomsPage() {
  const [showModal, setShowModal] = useState(false);
  const [rooms, setRooms] = useState([
    {
      id: '1',
      roomNumber: '101',
      type: 'Standard',
      floor: 1,
      capacity: 2,
      pricePerNight: 120,
      status: 'available',
    },
    {
      id: '2',
      roomNumber: '102',
      type: 'Deluxe',
      floor: 1,
      capacity: 3,
      pricePerNight: 180,
      status: 'occupied',
    },
    {
      id: '3',
      roomNumber: '301',
      type: 'Suite',
      floor: 3,
      capacity: 4,
      pricePerNight: 280,
      status: 'available',
    },
    {
      id: '4',
      roomNumber: '302',
      type: 'Standard',
      floor: 3,
      capacity: 2,
      pricePerNight: 120,
      status: 'maintenance',
    },
  ]);

  const handleAddRoom = (newRoom: any) => {
    setRooms([...rooms, { ...newRoom, id: String(rooms.length + 1) }]);
    setShowModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold gradient-text mb-2">Rooms</h1>
          <p className="text-muted-foreground">
            Manage your hotel rooms and inventory
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="btn-premium bg-primary text-primary-foreground"
        >
          + Add Room
        </button>
      </div>

      {/* Rooms List */}
      <RoomsList rooms={rooms} />

      {/* Create Room Modal */}
      {showModal && (
        <CreateRoomModal
          onClose={() => setShowModal(false)}
          onSubmit={handleAddRoom}
        />
      )}
    </div>
  );
}
