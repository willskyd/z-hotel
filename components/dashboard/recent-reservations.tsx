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
    <div className="card-premium">
      <h3 className="text-lg font-semibold text-foreground mb-6">
        Recent Reservations
      </h3>
      <div className="overflow-x-auto">
        <table className="table-premium">
          <thead>
            <tr>
              <th>Guest Name</th>
              <th>Room</th>
              <th>Check-In</th>
              <th>Check-Out</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {reservations.map((reservation) => (
              <tr key={reservation.id}>
                <td className="font-medium text-foreground">
                  {reservation.guestName}
                </td>
                <td className="text-foreground">#{reservation.roomNumber}</td>
                <td className="text-muted-foreground">{reservation.checkIn}</td>
                <td className="text-muted-foreground">{reservation.checkOut}</td>
                <td>
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
