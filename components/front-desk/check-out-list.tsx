interface CheckOutGuest {
  id: string;
  guestName: string;
  roomNumber: string;
  checkOutTime: string;
  nights: number;
  totalBill: number;
}

interface CheckOutListProps {
  guests: CheckOutGuest[];
}

export default function CheckOutList({ guests }: CheckOutListProps) {
  return (
    <div className="card-premium">
      <h3 className="text-lg font-semibold text-foreground mb-6">
        Pending Check-Outs
      </h3>
      <div className="space-y-3">
        {guests.map((guest) => (
          <div
            key={guest.id}
            className="flex items-center justify-between p-4 bg-secondary rounded-lg border border-yellow-500/30 hover:border-yellow-500/50 transition-colors"
          >
            <div className="flex-1">
              <p className="font-medium text-foreground">{guest.guestName}</p>
              <p className="text-sm text-muted-foreground">
                Room {guest.roomNumber} • {guest.nights} nights
              </p>
              <p className="text-sm text-primary font-semibold mt-1">
                Total: ${guest.totalBill}
              </p>
            </div>
            <div className="flex flex-col items-end gap-2">
              <p className="text-xs text-yellow-400">By {guest.checkOutTime}</p>
              <button className="px-3 py-1 text-xs rounded-lg bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30 transition-colors font-medium">
                Process
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
