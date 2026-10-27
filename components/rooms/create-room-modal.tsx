'use client';

import { useState } from 'react';
import { X, Shield, AlertCircle } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';

const DEFAULT_ROOM_TYPES = ['Standard', 'Deluxe', 'Suite', 'Executive'];

const PRESET_AMENITIES = [
  'WiFi', 'TV', 'AC', 'En-suite bathroom', 'Mini bar',
  'Room service', 'Jacuzzi', 'Kitchenette', 'Work desk', 'Coffee machine',
];

interface CreateRoomModalProps {
  onClose: () => void;
  onSubmit: (data: {
    roomNumber: string; type: string; floor: number; capacity: number;
    pricePerNight: number; amenities: string[]; status: string; description: string;
  }) => void;
  roomTypes?: string[];
}

export default function CreateRoomModal({ onClose, onSubmit, roomTypes }: CreateRoomModalProps) {
  const { user } = useAuth();
  const types = (roomTypes && roomTypes.length > 0) ? roomTypes : DEFAULT_ROOM_TYPES;
  const canCreate = user?.role === 'admin' || user?.role === 'manager';

  const [roomNumber, setRoomNumber] = useState('');
  const [type, setType] = useState(types[0] ?? 'Standard');
  const [floor, setFloor] = useState('1');
  const [capacity, setCapacity] = useState('2');
  const [pricePerNight, setPricePerNight] = useState('');
  const [amenities, setAmenities] = useState<string[]>(['WiFi', 'TV', 'AC', 'En-suite bathroom']);
  const [status, setStatus] = useState('available');
  const [description, setDescription] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!roomNumber.trim()) errs.roomNumber = 'Room number is required';
    const floorN = parseInt(floor, 10);
    if (isNaN(floorN) || floorN < 1) errs.floor = 'Enter a valid floor (≥1)';
    const capN = parseInt(capacity, 10);
    if (isNaN(capN) || capN < 1 || capN > 20) errs.capacity = 'Capacity must be 1–20';
    const priceN = parseFloat(pricePerNight);
    if (isNaN(priceN) || priceN <= 0) errs.pricePerNight = 'Enter a valid price';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const toggleAmenity = (a: string) =>
    setAmenities((prev) => prev.includes(a) ? prev.filter((x) => x !== a) : [...prev, a]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canCreate || !validate()) return;
    setSubmitting(true);
    setSubmitError('');
    try {
      await onSubmit({
        roomNumber: roomNumber.trim(),
        type,
        floor: parseInt(floor, 10),
        capacity: parseInt(capacity, 10),
        pricePerNight: parseFloat(pricePerNight),
        amenities,
        status,
        description: description.trim(),
      });
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'Unable to create room');
    } finally {
      setSubmitting(false);
    }
  };

  const inputCls = (err?: string) =>
    `w-full px-3.5 py-2.5 bg-secondary border rounded-xl text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 transition-all ${
      err ? 'border-red-500/50 focus:ring-red-500/30' : 'border-border focus:ring-primary/50 focus:border-primary/50'
    }`;

  if (!canCreate) {
    return (
      <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
        <div className="bg-card border border-border rounded-2xl max-w-sm w-full p-8 text-center shadow-2xl" onClick={(e) => e.stopPropagation()}>
          <Shield size={40} className="text-red-400 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-foreground mb-2">Access Restricted</h3>
          <p className="text-sm text-muted-foreground mb-5">Only administrators and managers can add new rooms.</p>
          <button onClick={onClose} className="w-full py-2.5 bg-secondary border border-border rounded-xl text-sm font-medium text-foreground hover:bg-secondary/80 transition-colors">
            Close
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-card border border-border rounded-2xl w-full max-w-lg shadow-2xl flex flex-col max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border shrink-0">
          <div>
            <h2 className="text-lg font-bold text-foreground">Add New Room</h2>
            <p className="text-xs text-muted-foreground mt-0.5">Configure and register a new room</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-secondary transition-all">
            <X size={18} />
          </button>
        </div>

        <form id="create-room-form" onSubmit={handleSubmit} className="overflow-y-auto flex-1 p-6 space-y-4" noValidate>
          {submitError && <p role="alert" className="text-sm text-red-400">{submitError}</p>}
          {/* Room Number + Type */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1.5">Room Number *</label>
              <input
                type="text"
                value={roomNumber}
                onChange={(e) => { setRoomNumber(e.target.value); setErrors((p) => ({ ...p, roomNumber: '' })); }}
                className={inputCls(errors.roomNumber)}
                placeholder="e.g. 301"
              />
              {errors.roomNumber && <p className="flex items-center gap-1 text-xs text-red-400 mt-1"><AlertCircle size={11} />{errors.roomNumber}</p>}
            </div>
            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1.5">Room Type *</label>
              <select value={type} onChange={(e) => setType(e.target.value)} className={inputCls()}>
                {types.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          </div>

          {/* Floor + Capacity */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1.5">Floor *</label>
              <input
                type="number"
                value={floor}
                onChange={(e) => { setFloor(e.target.value); setErrors((p) => ({ ...p, floor: '' })); }}
                className={inputCls(errors.floor)}
                min="1" max="50"
              />
              {errors.floor && <p className="flex items-center gap-1 text-xs text-red-400 mt-1"><AlertCircle size={11} />{errors.floor}</p>}
            </div>
            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1.5">Max Capacity *</label>
              <input
                type="number"
                value={capacity}
                onChange={(e) => { setCapacity(e.target.value); setErrors((p) => ({ ...p, capacity: '' })); }}
                className={inputCls(errors.capacity)}
                min="1" max="20"
              />
              {errors.capacity && <p className="flex items-center gap-1 text-xs text-red-400 mt-1"><AlertCircle size={11} />{errors.capacity}</p>}
            </div>
          </div>

          {/* Price + Status */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1.5">Price per Night (₦) *</label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-primary font-bold pointer-events-none">₦</span>
                <input
                  type="number"
                  value={pricePerNight}
                  onChange={(e) => { setPricePerNight(e.target.value); setErrors((p) => ({ ...p, pricePerNight: '' })); }}
                  className={`${inputCls(errors.pricePerNight)} pl-8`}
                  placeholder="85000"
                  min="0" step="500"
                />
              </div>
              {errors.pricePerNight && <p className="flex items-center gap-1 text-xs text-red-400 mt-1"><AlertCircle size={11} />{errors.pricePerNight}</p>}
            </div>
            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1.5">Initial Status</label>
              <select value={status} onChange={(e) => setStatus(e.target.value)} className={inputCls()}>
                <option value="available">Available</option>
                <option value="maintenance">Maintenance</option>
                <option value="cleaning">Cleaning</option>
              </select>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-muted-foreground mb-1.5">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className={inputCls()}
              rows={2}
              placeholder="Brief description of the room..."
            />
          </div>

          {/* Amenities */}
          <div>
            <label className="block text-xs font-semibold text-muted-foreground mb-2">
              Amenities <span className="font-normal opacity-60">({amenities.length} selected)</span>
            </label>
            <div className="flex flex-wrap gap-2">
              {PRESET_AMENITIES.map((a) => (
                <button
                  type="button"
                  key={a}
                  onClick={() => toggleAmenity(a)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-xl border transition-all duration-200 ${
                    amenities.includes(a)
                      ? 'bg-primary/20 border-primary/40 text-primary'
                      : 'bg-secondary border-border text-muted-foreground hover:border-primary/25 hover:text-foreground'
                  }`}
                >
                  {amenities.includes(a) ? '✓ ' : ''}{a}
                </button>
              ))}
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="flex gap-3 px-6 py-4 border-t border-border shrink-0">
          <button type="button" onClick={onClose} className="flex-1 px-4 py-2.5 rounded-xl border border-border text-sm text-foreground hover:bg-secondary transition-colors font-medium">
            Cancel
          </button>
          <button
            type="submit"
            form="create-room-form"
            disabled={submitting}
            className="flex-1 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:shadow-lg hover:shadow-primary/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? 'Adding…' : 'Add Room'}
          </button>
        </div>
      </div>
    </div>
  );
}
