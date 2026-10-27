'use client';

import { useEffect, useState } from 'react';
import { Search, SlidersHorizontal, UserPlus, TrendingDown, TrendingUp } from 'lucide-react';
import GuestsList, { Guest } from '@/components/guests/guests-list';
import AddGuestModal from '@/components/guests/add-guest-modal';
import GuestProfileModal from '@/components/guests/guest-profile-modal';
import GuestStatsOverview from '@/components/guests/guest-stats-overview';

const MOCK_GUESTS: Guest[] = [
  {
    id: '1',
    firstName: 'Emeka',
    lastName: 'Okafor',
    email: 'emeka.okafor@example.com',
    phone: '+234-803-555-0101',
    country: 'Nigeria',
    totalStays: 12,
    lastVisit: '2024-06-15',
    totalRevenue: 1_560_000,
    governmentDocs: [{ type: 'NIN', number: 'NIN123456789' }],
    stayComments: [
      {
        comment: 'Excellent guest, always keeps room tidy. Requested extra pillows.',
        addedBy: 'Front Desk (Amara)',
        addedAt: '2024-06-15',
        reservationId: 'R-001',
      },
    ],
    stayHistory: [
      { checkIn: '2024-06-12', checkOut: '2024-06-15', room: '301', nights: 3, amount: 255_000 },
      { checkIn: '2024-04-10', checkOut: '2024-04-14', room: '205', nights: 4, amount: 340_000 },
      { checkIn: '2024-01-20', checkOut: '2024-01-23', room: '410', nights: 3, amount: 255_000 },
    ],
  },
  {
    id: '2',
    firstName: 'Ngozi',
    lastName: 'Adeyemi',
    email: 'ngozi.adeyemi@example.com',
    phone: '+234-805-555-0102',
    country: 'Nigeria',
    totalStays: 7,
    lastVisit: '2024-06-16',
    totalRevenue: 850_000,
    governmentDocs: [
      { type: 'Passport', number: 'A12345678' },
      { type: 'NIN', number: 'NIN987654321' },
    ],
    stayComments: [],
    stayHistory: [
      { checkIn: '2024-06-14', checkOut: '2024-06-16', room: '205', nights: 2, amount: 170_000 },
      { checkIn: '2024-05-01', checkOut: '2024-05-05', room: '310', nights: 4, amount: 340_000 },
    ],
  },
  {
    id: '3',
    firstName: 'Chidi',
    lastName: 'Nwosu',
    email: 'chidi.nwosu@example.com',
    phone: '+234-806-555-0103',
    country: 'Nigeria',
    totalStays: 20,
    lastVisit: '2024-06-17',
    totalRevenue: 2_400_000,
    governmentDocs: [
      { type: 'Driver License', number: 'DL-LAG-2019-00123' },
    ],
    stayComments: [
      {
        comment: 'Guest tried to leave with a robe — spoken to, resolved amicably.',
        addedBy: 'Front Desk (Uche)',
        addedAt: '2024-05-10',
        reservationId: 'R-018',
      },
      {
        comment: 'Regular platinum guest. Always pays on time. Prefers quiet rooms.',
        addedBy: 'Manager (Kingsley)',
        addedAt: '2024-06-17',
        reservationId: 'R-020',
      },
    ],
    stayHistory: [
      { checkIn: '2024-06-15', checkOut: '2024-06-17', room: '410', nights: 2, amount: 170_000 },
      { checkIn: '2024-05-08', checkOut: '2024-05-11', room: '501', nights: 3, amount: 300_000 },
    ],
  },
  {
    id: '4',
    firstName: 'Aisha',
    lastName: 'Bello',
    email: 'aisha.bello@example.com',
    phone: '+234-807-555-0104',
    country: 'Nigeria',
    totalStays: 3,
    lastVisit: '2024-06-10',
    totalRevenue: 240_000,
    governmentDocs: [],
    stayComments: [],
    stayHistory: [
      { checkIn: '2024-06-07', checkOut: '2024-06-10', room: '112', nights: 3, amount: 240_000 },
    ],
  },
  {
    id: '5',
    firstName: 'Biodun',
    lastName: 'Fashola',
    email: 'biodun.fashola@example.com',
    phone: '+234-808-555-0105',
    country: 'Nigeria',
    totalStays: 5,
    lastVisit: '2024-05-28',
    totalRevenue: 450_000,
    governmentDocs: [{ type: 'Voter ID', number: 'VIN-LG-1234567' }],
    stayComments: [],
    stayHistory: [
      { checkIn: '2024-05-24', checkOut: '2024-05-28', room: '203', nights: 4, amount: 320_000 },
    ],
  },
];

type SortKey = 'name' | 'revenue' | 'stays' | 'lastVisit';

export default function GuestsPage() {
  const [guests, setGuests] = useState<Guest[]>([]);
  const [isLoadingGuests, setIsLoadingGuests] = useState(true);
  const [guestError, setGuestError] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedGuest, setSelectedGuest] = useState<Guest | null>(null);
  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('revenue');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

 const handleAddGuest = async (
  data: Omit<
    Guest,
    'id' | 'totalStays' | 'lastVisit' | 'totalRevenue' | 'stayHistory' | 'stayComments'
  >
) => {
  try {
    const token = localStorage.getItem('accessToken');

    if (!token) {
      setGuestError('Please log in before adding a guest.');
      return;
    }

    // Do not send uploaded ID photos as base64 data.
    const governmentDocs = (data.governmentDocs ?? []).map(
      ({ type, number }) => ({ type, number })
    );

    const response = await fetch('/api/guests', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        ...data,
        governmentDocs,
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || 'Failed to save guest.');
    }

    const newGuest: Guest = {
      ...result,
      id: String(result._id),
      totalStays: result.totalStays ?? 0,
      lastVisit: result.lastVisit ?? '—',
      totalRevenue: result.totalRevenue ?? 0,
      governmentDocs: result.governmentDocs ?? governmentDocs,
      stayComments: result.stayComments ?? [],
      stayHistory: result.stayHistory ?? [],
    };

    setGuests((previous) => [newGuest, ...previous]);
    setShowAddModal(false);
    setGuestError('');
  } catch (error) {
  const message =
    error instanceof Error ? error.message : 'Unable to save guest.';

  setGuestError(message);
  throw new Error(message);
   }
  };

  const handleUpdateComment = (guestId: string, commentIdx: number, newText: string) => {
    setGuests((prev) =>
      prev.map((g) => {
        if (g.id !== guestId) return g;
        const comments = [...g.stayComments];
        comments[commentIdx] = {
          ...comments[commentIdx],
          comment: newText,
          editedBy: 'Administrator',
          editedAt: new Date().toISOString().split('T')[0],
        } as any;
        return { ...g, stayComments: comments };
      })
    );
    if (selectedGuest?.id === guestId) {
      setSelectedGuest((prev) => {
        if (!prev) return prev;
        const comments = [...prev.stayComments];
        comments[commentIdx] = {
          ...comments[commentIdx],
          comment: newText,
        };
        return { ...prev, stayComments: comments };
      });
    }
  };

  // Filter & Sort
  const filtered = guests
    .filter((g) => {
      const q = search.toLowerCase();
      return (
        `${g.firstName} ${g.lastName}`.toLowerCase().includes(q) ||
        g.email.toLowerCase().includes(q) ||
        g.phone.includes(q) ||
        g.country.toLowerCase().includes(q)
      );
    })
    .sort((a, b) => {
      let val = 0;
      if (sortKey === 'name') val = `${a.firstName} ${a.lastName}`.localeCompare(`${b.firstName} ${b.lastName}`);
      else if (sortKey === 'revenue') val = a.totalRevenue - b.totalRevenue;
      else if (sortKey === 'stays') val = a.totalStays - b.totalStays;
      else if (sortKey === 'lastVisit') val = a.lastVisit.localeCompare(b.lastVisit);
      return sortDir === 'desc' ? -val : val;
    });

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    else { setSortKey(key); setSortDir('desc'); }
  };

  const stats = {
    totalGuests: guests.length,
    topSpender: (() => {
      const top = [...guests].sort((a, b) => b.totalRevenue - a.totalRevenue)[0];
      return top ? `${top.firstName} ${top.lastName}` : '—';
    })(),
    topSpenderRevenue: Math.max(...guests.map((g) => g.totalRevenue), 0),
    avgRevenuePerGuest: guests.length ? Math.round(guests.reduce((s, g) => s + g.totalRevenue, 0) / guests.length) : 0,
    returnRate: Math.round((guests.filter((g) => g.totalStays > 1).length / Math.max(guests.length, 1)) * 100),
  };
  useEffect(() => {
  const loadGuests = async () => {
    try {
      const token = localStorage.getItem('accessToken');

      if (!token) {
        setGuestError('Please log in to view guests.');
        return;
      }

      const response = await fetch('/api/guests', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to load guests from the database.');
      }

      const records = await response.json();

      const mappedGuests: Guest[] = records.map((record: any) => ({
        id: String(record._id),
        firstName: record.firstName ?? '',
        lastName: record.lastName ?? '',
        email: record.email ?? '',
        phone: record.phone ?? '',
        country: record.country ?? '',
        totalStays: record.totalStays ?? 0,
        lastVisit: record.lastVisit ?? '—',
        totalRevenue: record.totalRevenue ?? 0,
        governmentDocs: record.governmentDocs ?? [],
        stayComments: record.stayComments ?? [],
        stayHistory: record.stayHistory ?? [],
      }));

      setGuests(mappedGuests);
    } catch (error) {
      setGuestError(
        error instanceof Error ? error.message : 'Unable to load guests.'
      );
    } finally {
      setIsLoadingGuests(false);
    }
  };

  loadGuests();
}, []);

  return (
    <div className="w-full min-w-0 space-y-5 sm:space-y-6 max-w-[1400px]">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Guest Management</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {guests.length} registered guests · Sorted by {sortKey}
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex min-h-10 shrink-0 items-center gap-1.5 rounded-xl bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground transition-all duration-200 hover:shadow-lg hover:shadow-primary/30 sm:gap-2 sm:px-4 sm:text-sm"
        >
          <UserPlus size={14} className="sm:h-4 sm:w-4" />
          Register Guest
        </button>
      </div>

      {/* Stats Overview */}
      <GuestStatsOverview stats={stats} />

      {/* Filters row */}
      <div className="flex min-w-0 flex-col gap-2.5 sm:flex-row sm:flex-wrap sm:items-center sm:gap-3">
        <div className="flex min-w-0 w-full flex-1 items-center gap-2 rounded-xl border border-border bg-card px-3 py-2.5 transition-colors focus-within:border-primary/50 sm:w-auto sm:min-w-60">
          <Search size={14} className="text-muted-foreground shrink-0" />
          <input
            type="text"
            placeholder="Search by name, email, phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="min-w-0 w-full bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground/60"
          />
        </div>

        <div className="flex min-w-0 w-full items-center gap-2 sm:hidden">
          <label className="flex min-w-0 flex-1 items-center gap-2 rounded-xl border border-border bg-card px-3 py-2.5">
            <SlidersHorizontal size={14} className="shrink-0 text-muted-foreground" />
            <span className="shrink-0 text-xs font-medium text-muted-foreground">Sort</span>
            <select
              value={sortKey}
              onChange={(event) => {
                const nextKey = event.target.value as SortKey;
                if (nextKey !== sortKey) {
                  setSortKey(nextKey);
                  setSortDir('desc');
                }
              }}
              aria-label="Sort guests by"
              className="min-w-0 flex-1 appearance-none bg-transparent text-right text-sm text-foreground outline-none"
            >
              <option value="revenue" className="bg-secondary text-foreground">Revenue</option>
              <option value="stays" className="bg-secondary text-foreground">Stays</option>
              <option value="name" className="bg-secondary text-foreground">Name</option>
              <option value="lastVisit" className="bg-secondary text-foreground">Last Visit</option>
            </select>
          </label>
          <button
            type="button"
            onClick={() => setSortDir((direction) => direction === 'desc' ? 'asc' : 'desc')}
            aria-label={sortDir === 'desc' ? 'Sort descending; tap to sort ascending' : 'Sort ascending; tap to sort descending'}
            title={sortDir === 'desc' ? 'Descending; tap to reverse order' : 'Ascending; tap to reverse order'}
            className="flex min-h-11 min-w-11 shrink-0 items-center justify-center rounded-xl border border-border bg-card text-primary hover:bg-secondary"
          >
            {sortDir === 'desc' ? <TrendingDown size={16} /> : <TrendingUp size={16} />}
          </button>
        </div>

        <div className="hidden items-center gap-2 sm:flex">
          <span className="text-xs text-muted-foreground">Sort:</span>
          {(['revenue', 'stays', 'name', 'lastVisit'] as SortKey[]).map((key) => (
            <button
              key={key}
              onClick={() => toggleSort(key)}
              className={`flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-lg border transition-all duration-200 ${
                sortKey === key
                  ? 'bg-primary text-primary-foreground border-primary/50'
                  : 'border-border text-muted-foreground hover:border-primary/30 hover:text-foreground'
              }`}
            >
              {key === 'revenue' ? 'Revenue' : key === 'stays' ? 'Stays' : key === 'name' ? 'Name' : 'Last Visit'}
              {sortKey === key && (
                sortDir === 'desc'
                  ? <TrendingDown size={11} />
                  : <TrendingUp size={11} />
              )}
            </button>
          ))}
        </div>
      </div>


     {isLoadingGuests && (
     <p className="py-4 text-sm text-muted-foreground">Loading guests...</p>
      )}

      {guestError && (
      <p className="py-3 text-sm text-red-500">{guestError}</p>
       )}
      {/* Guest Table */}
      <GuestsList guests={filtered} onViewProfile={setSelectedGuest} />

      {/* Modals */}
      {showAddModal && (
        <AddGuestModal onClose={() => setShowAddModal(false)} onSubmit={handleAddGuest} />
      )}
      {selectedGuest && (
        <GuestProfileModal
          guest={selectedGuest}
          onClose={() => setSelectedGuest(null)}
          onUpdateComment={handleUpdateComment}
        />
      )}
    </div>
  );
}
