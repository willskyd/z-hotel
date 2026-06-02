interface Reservation {
  id: string;
  guestName: string;
  roomNumber: string;
  checkIn: string;
  checkOut: string;
  status: string;
}

interface RecentReservationsProps {
  reservations: Reservation[];
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'checked-in':
      return 'bg-green-500/20 text-green-400';
    case 'confirmed':
      return 'bg-blue-500/20 text-blue-400';
    case 'pending':
      return 'bg-yellow-500/20 text-yellow-400';
    case 'cancelled':
      return 'bg-red-500/20 text-red-400';
    default:
      return 'bg-gray-500/20 text-gray-400';
  }
};

export default function RecentReservations({
  reservations,
}: RecentReservationsProps) {
  return (
    <div className="bg-card border border-border rounded-xl p-6 hover:border-primary/30 transition-all duration-300">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-foreground">
          Recent Reservations
        </h3>
        <button className="text-sm text-primary hover:text-accent transition-colors">
          View All
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              <th className="px-4 py-3 text-left text-sm font-semibold text-muted-foreground">Guest Name</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-muted-foreground">Room</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-muted-foreground">Check-In</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-muted-foreground">Check-Out</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-muted-foreground">Status</th>
            </tr>
          </thead>
          <tbody>
            {reservations.map((reservation) => (
              <tr key={reservation.id} className="border-b border-border/50 hover:bg-secondary/40 transition-colors">
                <td className="px-4 py-4 font-medium text-foreground">
                  {reservation.guestName}
                </td>
                <td className="px-4 py-4 text-foreground">#{reservation.roomNumber}</td>
                <td className="px-4 py-4 text-muted-foreground text-sm">{reservation.checkIn}</td>
                <td className="px-4 py-4 text-muted-foreground text-sm">{reservation.checkOut}</td>
                <td className="px-4 py-4">
                  <span
                    className={`text-xs font-semibold px-3 py-1 rounded-full ${getStatusColor(
                      reservation.status
                    )}`}
                  >
                    {reservation.status.charAt(0).toUpperCase() +
                      reservation.status.slice(1)}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
