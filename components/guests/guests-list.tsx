'use client';

import { Eye, Crown, Shield, Users } from 'lucide-react';
import { formatNairaCompact } from '@/lib/utils';

export interface GovernmentDoc {
  type: 'NIN' | 'Passport' | 'Driver License' | 'Voter ID';
  number: string;
  photoDataUrl?: string;
}

export interface StayComment {
  comment: string;
  addedBy: string;
  addedAt: string;
  reservationId: string;
}

export interface StayRecord {
  checkIn: string;
  checkOut: string;
  room: string;
  nights: number;
  amount: number;
}

export interface Guest {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  country: string;
  totalStays: number;
  lastVisit: string;
  totalRevenue: number;
  governmentDocs: GovernmentDoc[];
  stayComments: StayComment[];
  stayHistory: StayRecord[];
}

const TIERS = [
  { label: 'Platinum', min: 1_000_000, color: 'text-sky-300', bg: 'bg-sky-500/10 border-sky-500/25' },
  { label: 'Gold', min: 500_000, color: 'text-amber-300', bg: 'bg-amber-500/10 border-amber-500/25' },
  { label: 'Silver', min: 100_000, color: 'text-slate-300', bg: 'bg-slate-500/10 border-slate-500/25' },
  { label: 'Bronze', min: 0, color: 'text-orange-400', bg: 'bg-orange-500/10 border-orange-500/25' },
];

export function getGuestTier(revenue: number) {
  return TIERS.find((t) => revenue >= t.min) ?? TIERS[TIERS.length - 1];
}

interface GuestsListProps {
  guests: Guest[];
  onViewProfile: (guest: Guest) => void;
}

export default function GuestsList({ guests, onViewProfile }: GuestsListProps) {
  return (
    <div className="bg-card border border-border rounded-2xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-secondary/30">
              <th className="px-6 py-3.5 text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Guest</th>
              <th className="px-4 py-3.5 text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Contact</th>
              <th className="px-4 py-3.5 text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Country</th>
              <th className="px-4 py-3.5 text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Stays</th>
              <th className="px-4 py-3.5 text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Total Revenue</th>
              <th className="px-4 py-3.5 text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Tier</th>
              <th className="px-4 py-3.5 text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Docs</th>
              <th className="px-4 py-3.5 text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Last Visit</th>
              <th className="px-4 py-3.5" />
            </tr>
          </thead>
          <tbody>
            {guests.map((guest, i) => {
              const tier = getGuestTier(guest.totalRevenue);
              const initials = `${guest.firstName[0]}${guest.lastName[0]}`;
              return (
                <tr
                  key={guest.id}
                  className={`hover:bg-secondary/40 transition-colors cursor-pointer group ${
                    i < guests.length - 1 ? 'border-b border-border/50' : ''
                  }`}
                  onClick={() => onViewProfile(guest)}
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-primary/15 border border-primary/20 flex items-center justify-center text-xs font-bold text-primary shrink-0">
                        {initials}
                      </div>
                      <div>
                        <p className="font-semibold text-foreground text-sm">{guest.firstName} {guest.lastName}</p>
                        <p className="text-xs text-muted-foreground">{guest.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-sm text-muted-foreground">{guest.phone}</td>
                  <td className="px-4 py-4 text-sm text-muted-foreground">{guest.country}</td>
                  <td className="px-4 py-4">
                    <span className="text-sm font-semibold text-foreground">{guest.totalStays}</span>
                    <span className="text-xs text-muted-foreground ml-1">stays</span>
                  </td>
                  <td className="px-4 py-4">
                    <span className="text-sm font-bold text-foreground">{formatNairaCompact(guest.totalRevenue)}</span>
                  </td>
                  <td className="px-4 py-4">
                    <span className={`inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-full border ${tier.bg} ${tier.color}`}>
                      <Crown size={10} />
                      {tier.label}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    {guest.governmentDocs.length > 0 ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                        <Shield size={10} />
                        {guest.governmentDocs.length} doc{guest.governmentDocs.length > 1 ? 's' : ''}
                      </span>
                    ) : (
                      <span className="text-xs text-muted-foreground/50">None</span>
                    )}
                  </td>
                  <td className="px-4 py-4 text-sm text-muted-foreground">{guest.lastVisit}</td>
                  <td className="px-4 py-4">
                    <button
                      onClick={(e) => { e.stopPropagation(); onViewProfile(guest); }}
                      className="opacity-0 group-hover:opacity-100 flex items-center gap-1.5 text-xs text-primary hover:text-accent font-medium transition-all duration-200 px-3 py-1.5 rounded-lg hover:bg-primary/10"
                    >
                      <Eye size={13} /> View
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {guests.length === 0 && (
          <div className="text-center py-16 text-muted-foreground">
            <Users size={40} className="mx-auto mb-3 opacity-20" />
            <p className="text-sm">No guests found</p>
          </div>
        )}
      </div>
    </div>
  );
}
