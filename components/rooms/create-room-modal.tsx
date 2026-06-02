'use client';

import { useState } from 'react';

interface CreateRoomModalProps {
  onClose: () => void;
  onSubmit: (data: any) => void;
}

export default function CreateRoomModal({
  onClose,
  onSubmit,
}: CreateRoomModalProps) {
  const [formData, setFormData] = useState({
    roomNumber: '',
    type: 'Standard',
    floor: 1,
    capacity: 2,
    pricePerNight: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-card rounded-lg max-w-md w-full p-6 border border-border">
        <h2 className="text-xl font-bold text-foreground mb-6">Add New Room</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
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
              placeholder="e.g., 301"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Type
              </label>
              <select
                value={formData.type}
                onChange={(e) =>
                  setFormData({ ...formData, type: e.target.value })
                }
                className="w-full px-4 py-2 bg-secondary border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option>Standard</option>
                <option>Deluxe</option>
                <option>Suite</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Floor
              </label>
              <input
                type="number"
                value={formData.floor}
                onChange={(e) =>
                  setFormData({ ...formData, floor: parseInt(e.target.value) })
                }
                className="w-full px-4 py-2 bg-secondary border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Capacity
              </label>
              <input
                type="number"
                value={formData.capacity}
                onChange={(e) =>
                  setFormData({ ...formData, capacity: parseInt(e.target.value) })
                }
                className="w-full px-4 py-2 bg-secondary border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Price/Night
              </label>
              <input
                type="number"
                value={formData.pricePerNight}
                onChange={(e) =>
                  setFormData({ ...formData, pricePerNight: e.target.value })
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
              Add Room
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
