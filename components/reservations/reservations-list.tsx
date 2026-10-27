import { formatNaira } from '@/lib/utils';
import { ChevronDown } from 'lucide-react';

interface Reservation {
  id: string;
  reservationId: string;
  guestName: string;
  email: string;
  roomNumber: string;
  checkIn: string;
  checkOut: string;
  nights: number;
  totalPrice: number;
  status: string;
}

interface ReservationsListProps {
  reservations: Reservation[];
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'checked-in':
      return 'bg-green-500/20 text-green-400 border-green-500/30';
    case 'confirmed':
      return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
    case 'pending':
      return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
    case 'cancelled':
      return 'bg-red-500/20 text-red-400 border-red-500/30';
    default:
      return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
  }
};

export default function ReservationsList({
  reservations,
}: ReservationsListProps) {
  return (
    <div className="space-y-3">
      {reservations.map((reservation) => (
        <div
          key={reservation.id}
          className="card-premium border-l-4 border-primary"
        >
          <div className="md:hidden">
            <div className="flex min-w-0 items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="break-words text-sm font-semibold text-foreground">{reservation.guestName}</p>
                <p className="mt-1 text-xs text-muted-foreground">Room #{reservation.roomNumber}</p>
              </div>
              <span className={`shrink-0 rounded-full border px-2.5 py-1 text-[10px] font-semibold ${getStatusColor(reservation.status)}`}>
                {reservation.status.charAt(0).toUpperCase() + reservation.status.slice(1)}
              </span>
            </div>
            <details className="group mt-3 border-t border-border/70 pt-2">
              <summary className="flex min-h-9 cursor-pointer list-none items-center justify-between text-xs font-semibold text-primary [&::-webkit-details-marker]:hidden">
                Details<ChevronDown size={14} className="transition-transform group-open:rotate-180" />
              </summary>
              <div className="grid grid-cols-2 gap-x-3 gap-y-3 pb-1 text-xs">
                <div className="col-span-2 min-w-0"><p className="text-muted-foreground">Guest email</p><p className="break-all text-foreground">{reservation.email}</p></div>
                <div><p className="text-muted-foreground">Stay length</p><p className="text-foreground">{reservation.nights} nights</p></div>
                <div><p className="text-muted-foreground">Total price</p><p className="break-words font-semibold text-primary">{formatNaira(reservation.totalPrice)}</p></div>
                <div><p className="text-muted-foreground">Check-in</p><p className="break-words text-foreground">{reservation.checkIn}</p></div>
                <div><p className="text-muted-foreground">Check-out</p><p className="break-words text-foreground">{reservation.checkOut}</p></div>
              </div>
            </details>
          </div>
          <div className="hidden grid-cols-1 items-center gap-4 md:grid md:grid-cols-5">
            {/* Guest Info */}
            <div>
              <p className="text-xs text-muted-foreground mb-1">Guest</p>
              <p className="text-sm font-medium text-foreground">
                {reservation.guestName}
              </p>
              <p className="text-xs text-muted-foreground">
                {reservation.email}
              </p>
            </div>

            {/* Reservation Details */}
            <div>
              <p className="text-xs text-muted-foreground mb-1">Room</p>
              <p className="text-sm font-medium text-foreground">
                #{reservation.roomNumber}
              </p>
              <p className="text-xs text-muted-foreground">
                {reservation.nights} nights
              </p>
            </div>

            {/* Dates */}
            <div>
              <p className="text-xs text-muted-foreground mb-1">Check-in</p>
              <p className="text-sm font-medium text-foreground">
                {reservation.checkIn}
              </p>
              <p className="text-xs text-muted-foreground">
                to {reservation.checkOut}
              </p>
            </div>

            {/* Price */}
            <div>
              <p className="text-xs text-muted-foreground mb-1">Total Price</p>
              <p className="text-lg font-bold text-primary">
                {formatNaira(reservation.totalPrice)}
              </p>
            </div>

            {/* Status & Action */}
            <div className="flex items-center justify-between md:flex-col md:items-start md:justify-start gap-4">
              <span
                className={`text-xs font-semibold px-3 py-1 rounded-full border ${getStatusColor(
                  reservation.status
                )}`}
              >
                {reservation.status.charAt(0).toUpperCase() +
                  reservation.status.slice(1)}
              </span>
              <button className="text-xs px-3 py-1 rounded-lg text-foreground hover:bg-secondary transition-colors">
                Edit
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
