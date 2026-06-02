'use client';

import { useState } from 'react';

interface CreateReservationModalProps {
  onClose: () => void;
  onSubmit: (data: any) => void;
}

export default function CreateReservationModal({
  onClose,
  onSubmit,
}: CreateReservationModalProps) {
  const [formData, setFormData] = useState({
    guestName: '',
    email: '',
    roomNumber: '',
    checkIn: '',
    checkOut: '',
    nights: 1,
    totalPrice: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      reservationId: `RES-${Date.now()}`,
      status: 'pending',
    });
  };

  const calculateNights = () => {
    if (formData.checkIn && formData.checkOut) {
      const checkIn = new Date(formData.checkIn);
      const checkOut = new Date(formData.checkOut);
      const nights = Math.ceil(
        (checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24)
      );
      return nights > 0 ? nights : 1;
    }
    return 1;
  };

  const handleDateChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });
    if (field === 'checkIn' || field === 'checkOut') {
      const nights = calculateNights();
      setFormData((prev) => ({ ...prev, nights }));
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-card rounded-lg max-w-lg w-full p-6 border border-border max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-bold text-foreground mb-6">
          New Reservation
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Guest Name
              </label>
              <input
                type="text"
                value={formData.guestName}
                onChange={(e) =>
                  setFormData({ ...formData, guestName: e.target.value })
                }
                className="w-full px-4 py-2 bg-secondary border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="John Smith"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Email
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                className="w-full px-4 py-2 bg-secondary border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="john@example.com"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Room Number
            </label>
            <input
              type="text"
              value={formData.roomNumber}
              onChange={(e) =>
                setFormData({ ...formData, roomNumber: e.target.value })
              }
              className="w-full px-4 py-2 bg-secondary border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="301"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Check-In
              </label>
              <input
                type="date"
                value={formData.checkIn}
                onChange={(e) =>
                  handleDateChange('checkIn', e.target.value)
                }
                className="w-full px-4 py-2 bg-secondary border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Check-Out
              </label>
              <input
                type="date"
                value={formData.checkOut}
                onChange={(e) =>
                  handleDateChange('checkOut', e.target.value)
                }
                className="w-full px-4 py-2 bg-secondary border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Nights
              </label>
              <input
                type="number"
                value={formData.nights}
                readOnly
                className="w-full px-4 py-2 bg-secondary/50 border border-border rounded-lg text-foreground opacity-75"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Total Price
              </label>
              <input
                type="number"
                value={formData.totalPrice}
                onChange={(e) =>
                  setFormData({ ...formData, totalPrice: e.target.value })
                }
                className="w-full px-4 py-2 bg-secondary border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="$"
                required
              />
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 rounded-lg border border-border text-foreground hover:bg-secondary transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:shadow-lg hover:shadow-primary/30 font-medium transition-all"
            >
              Create Reservation
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
