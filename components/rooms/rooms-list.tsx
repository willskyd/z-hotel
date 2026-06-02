interface Room {
  id: string;
  roomNumber: string;
  type: string;
  floor: number;
  capacity: number;
  pricePerNight: number;
  status: string;
}

interface RoomsListProps {
  rooms: Room[];
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'available':
      return 'bg-green-500/20 text-green-400';
    case 'occupied':
      return 'bg-blue-500/20 text-blue-400';
    case 'maintenance':
      return 'bg-yellow-500/20 text-yellow-400';
    case 'reserved':
      return 'bg-purple-500/20 text-purple-400';
    default:
      return 'bg-gray-500/20 text-gray-400';
  }
};

export default function RoomsList({ rooms }: RoomsListProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {rooms.map((room) => (
        <div key={room.id} className="card-premium">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-sm text-muted-foreground">Room</p>
              <p className="text-2xl font-bold text-foreground">
                #{room.roomNumber}
              </p>
            </div>
            <span
              className={`text-xs font-semibold px-2 py-1 rounded-full ${getStatusColor(
                room.status
              )}`}
            >
              {room.status.charAt(0).toUpperCase() + room.status.slice(1)}
            </span>
          </div>

          <div className="space-y-3 border-t border-border pt-4">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Type</span>
              <span className="text-foreground font-medium">{room.type}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Floor</span>
              <span className="text-foreground font-medium">{room.floor}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Capacity</span>
              <span className="text-foreground font-medium">
                {room.capacity} guests
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Price/Night</span>
              <span className="text-primary font-bold">
                ${room.pricePerNight}
              </span>
            </div>
          </div>

          <button className="w-full mt-4 px-4 py-2 rounded-lg bg-secondary text-foreground hover:bg-secondary/80 transition-colors text-sm font-medium">
            View Details
          </button>
        </div>
      ))}
    </div>
  );
}
