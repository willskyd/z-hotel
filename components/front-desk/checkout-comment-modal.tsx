'use client';

import { useState } from 'react';
import { X, MessageSquare, Shield } from 'lucide-react';
import { formatNaira } from '@/lib/utils';

interface CheckoutGuest {
  id: string;
  guestName: string;
  roomNumber: string;
  nights: number;
  totalBill: number;
  checkOutTime: string;
}

interface CheckoutCommentModalProps {
  guest: CheckoutGuest;
  onConfirm: (guestId: string, comment: string) => void | Promise<void>;
  onCancel: () => void;
  isSubmitting?: boolean;
  error?: string;
}

export default function CheckoutCommentModal({ guest, onConfirm, onCancel, isSubmitting = false, error = '' }: CheckoutCommentModalProps) {
  const [comment, setComment] = useState('');

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="checkout-dialog-title"
        className="bg-card border border-border rounded-2xl w-full max-w-md shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <div>
            <h2 id="checkout-dialog-title" className="text-base font-bold text-foreground">Process Check-Out</h2>
            <p className="text-xs text-muted-foreground mt-0.5">Room {guest.roomNumber} · {guest.nights} nights</p>
          </div>
          <button onClick={onCancel} disabled={isSubmitting} aria-label="Close checkout confirmation" className="p-2 rounded-xl text-muted-foreground hover:bg-secondary transition-all disabled:opacity-50">
            <X size={16} />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Guest Summary */}
          <div className="flex items-center justify-between p-4 bg-secondary/50 rounded-xl border border-border">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/15 border border-primary/20 flex items-center justify-center text-sm font-bold text-primary">
                {guest.guestName.split(' ').map((n) => n[0]).join('').slice(0, 2)}
              </div>
              <div>
                <p className="font-semibold text-foreground text-sm">{guest.guestName}</p>
                <p className="text-xs text-muted-foreground">Expected out by {guest.checkOutTime}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-lg font-bold text-foreground">{formatNaira(guest.totalBill)}</p>
              <p className="text-xs text-muted-foreground">Total bill</p>
            </div>
            <p className="text-xs text-muted-foreground">
              Confirming checkout records the departure time and moves the room to cleaning.
            </p>
            {error && <p role="alert" className="text-sm text-red-400">{error}</p>}
          </div>

          {/* Comment Section */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <MessageSquare size={14} className="text-primary" />
              <label className="text-sm font-medium text-foreground">Staff Note</label>
              <span className="text-[10px] font-medium bg-secondary border border-border text-muted-foreground px-2 py-0.5 rounded-full">
                Optional
              </span>
            </div>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Add a note about this guest's stay (e.g. behaviour, special requests, issues)..."
              rows={3}
              className="w-full px-3.5 py-3 bg-secondary border border-border rounded-xl text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 resize-none transition-all"
            />
          </div>

          {/* Notice */}
          <div className="flex items-start gap-2.5 px-3.5 py-3 bg-amber-500/5 border border-amber-500/20 rounded-xl">
            <Shield size={14} className="text-amber-400 mt-0.5 shrink-0" />
            <p className="text-xs text-amber-400/90 leading-relaxed">
              Staff notes are permanent and <strong>can only be edited by administrators</strong>.
              Be factual and professional.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3 px-6 py-4 border-t border-border">
          <button
            onClick={onCancel}
            disabled={isSubmitting}
            className="flex-1 px-4 py-2.5 rounded-xl border border-border text-sm text-foreground hover:bg-secondary transition-colors font-medium"
          >
            Cancel
          </button>
          <button
            onClick={() => void onConfirm(guest.id, comment)}
            disabled={isSubmitting}
            className="flex-1 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:shadow-lg hover:shadow-primary/30 transition-all disabled:opacity-50"
          >
            {isSubmitting ? 'Processing…' : 'Confirm Check-Out'}
          </button>
        </div>
      </div>
    </div>
  );
}
