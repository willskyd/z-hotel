interface CheckedInGuest {
  id: string;
  guestName: string;
  roomNumber: string;
  checkInTime: string;
  checkOutDate: string;
  status: string;
}

interface CheckInListProps {
  guests: CheckedInGuest[];
}

export default function CheckInList({ guests }: CheckInListProps) {
  return (
    <div className="card-premium">
      <h3 className="text-lg font-semibold text-foreground mb-6">
        Checked-In Guests
      </h3>
      <div className="space-y-3">
        {guests.map((guest) => (
          <div
            key={guest.id}
            className="flex items-center justify-between p-4 bg-secondary rounded-lg border border-border hover:border-primary/30 transition-colors"
          >
            <div className="flex-1">
              <p className="font-medium text-foreground">{guest.guestName}</p>
              <p className="text-sm text-muted-foreground">
                Room {guest.roomNumber} • Check-in {guest.checkInTime}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Check-out: {guest.checkOutDate}
              </p>
            </div>
            <div className="flex gap-2">
              <button className="px-3 py-1 text-xs rounded-lg bg-primary/20 text-primary hover:bg-primary/30 transition-colors font-medium">
                Room Key
              </button>
              <button className="px-3 py-1 text-xs rounded-lg bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 transition-colors font-medium">
                Requests
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
