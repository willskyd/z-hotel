interface Guest {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  country: string;
  totalStays: number;
  lastVisit: string;
}

interface GuestsListProps {
  guests: Guest[];
}

export default function GuestsList({ guests }: GuestsListProps) {
  return (
    <div className="card-premium">
      <div className="overflow-x-auto">
        <table className="table-premium">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Country</th>
              <th>Total Stays</th>
              <th>Last Visit</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {guests.map((guest) => (
              <tr key={guest.id}>
                <td className="font-medium text-foreground">
                  {guest.firstName} {guest.lastName}
                </td>
                <td className="text-muted-foreground">{guest.email}</td>
                <td className="text-muted-foreground">{guest.phone}</td>
                <td className="text-muted-foreground">{guest.country}</td>
                <td className="text-foreground font-medium">
                  {guest.totalStays}
                </td>
                <td className="text-muted-foreground">{guest.lastVisit}</td>
                <td>
                  <button className="text-primary hover:text-primary/80 text-sm font-medium transition-colors">
                    View Profile
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
