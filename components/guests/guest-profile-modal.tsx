'use client';

import { useState } from 'react';
import {
  X, Crown, TrendingUp, BedDouble, Calendar, Phone, Mail, MapPin, Shield,
  MessageSquare, FileText, Image as ImageIcon, BarChart3, Star, Clock,
} from 'lucide-react';
import { formatNaira, formatNairaCompact } from '@/lib/utils';
import { Guest, getGuestTier } from './guests-list';
import { useAuth } from '@/lib/auth-context';

type Tab = 'overview' | 'stays' | 'documents' | 'comments';

interface GuestProfileModalProps {
  guest: Guest;
  onClose: () => void;
  onUpdateComment: (guestId: string, commentIdx: number, newText: string) => void;
}

export default function GuestProfileModal({ guest, onClose, onUpdateComment }: GuestProfileModalProps) {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [editingCommentIdx, setEditingCommentIdx] = useState<number | null>(null);
  const [editText, setEditText] = useState('');

  const isAdmin = user?.role === 'admin';
  const tier = getGuestTier(guest.totalRevenue);
  const initials = `${guest.firstName[0]}${guest.lastName[0]}`;
  const avgSpend = guest.totalStays > 0 ? Math.round(guest.totalRevenue / guest.totalStays) : 0;

  const tabs: { id: Tab; label: string; Icon: React.ElementType }[] = [
    { id: 'overview', label: 'Overview', Icon: BarChart3 },
    { id: 'stays', label: `Stay History (${guest.stayHistory.length})`, Icon: BedDouble },
    { id: 'documents', label: `Documents (${guest.governmentDocs.length})`, Icon: FileText },
    { id: 'comments', label: `Comments (${guest.stayComments.length})`, Icon: MessageSquare },
  ];

  const startEdit = (idx: number) => {
    setEditingCommentIdx(idx);
    setEditText(guest.stayComments[idx].comment);
  };

  const saveEdit = () => {
    if (editingCommentIdx !== null && editText.trim()) {
      onUpdateComment(guest.id, editingCommentIdx, editText.trim());
      setEditingCommentIdx(null);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div
        className="bg-card border border-border rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="relative bg-gradient-to-r from-[#141830] to-[#0f1225] border-b border-border rounded-t-2xl overflow-hidden">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-0 right-0 w-48 h-48 bg-primary/8 rounded-full blur-2xl" />
          </div>
          <div className="relative z-10 flex items-start justify-between p-6">
            <div className="flex items-center gap-4">
              {/* Avatar */}
              <div className="relative">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/40 to-accent/30 border-2 border-primary/40 flex items-center justify-center text-xl font-bold text-primary shadow-lg shadow-primary/20">
                  {initials}
                </div>
                <div className={`absolute -bottom-1.5 -right-1.5 text-[10px] font-bold px-1.5 py-0.5 rounded-full border flex items-center gap-0.5 ${tier.bg} ${tier.color}`}>
                  <Crown size={8} /> {tier.label}
                </div>
              </div>
              <div>
                <h2 className="text-xl font-bold text-foreground">
                  {guest.firstName} {guest.lastName}
                </h2>
                <div className="flex items-center gap-3 mt-1">
                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Mail size={11} /> {guest.email}
                  </span>
                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    <MapPin size={11} /> {guest.country}
                  </span>
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-xs text-muted-foreground">
                    <Phone size={10} className="inline mr-1" />{guest.phone}
                  </span>
                </div>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-secondary transition-all"
            >
              <X size={18} />
            </button>
          </div>

          {/* Quick stats */}
          <div className="relative z-10 grid grid-cols-4 gap-px border-t border-white/5">
            {[
              { label: 'Total Stays', value: guest.totalStays, Icon: BedDouble, color: 'text-primary' },
              { label: 'Total Revenue', value: formatNairaCompact(guest.totalRevenue), Icon: TrendingUp, color: 'text-emerald-400' },
              { label: 'Avg Per Stay', value: formatNairaCompact(avgSpend), Icon: BarChart3, color: 'text-blue-400' },
              { label: 'Last Visit', value: guest.lastVisit, Icon: Calendar, color: 'text-amber-400' },
            ].map(({ label, value, Icon, color }) => (
              <div key={label} className="px-5 py-3 bg-white/[0.015]">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1 flex items-center gap-1">
                  <Icon size={10} className={color} /> {label}
                </p>
                <p className={`text-sm font-bold ${color}`}>{value}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-border px-6 shrink-0">
          {tabs.map(({ id, label, Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`flex items-center gap-2 px-1 py-3 mr-6 text-sm font-medium border-b-2 transition-all duration-200 ${
                activeTab === id
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              <Icon size={14} />
              {label}
            </button>
          ))}
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Revenue Breakdown */}
              <div>
                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Revenue Analytics</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-secondary/60 rounded-xl p-4 border border-border">
                    <p className="text-xs text-muted-foreground mb-2">Total Lifetime Revenue</p>
                    <p className="text-2xl font-bold text-foreground">{formatNaira(guest.totalRevenue)}</p>
                    <div className="mt-2 h-1.5 bg-border rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-primary to-accent rounded-full"
                        style={{ width: `${Math.min((guest.totalRevenue / 2_000_000) * 100, 100)}%` }}
                      />
                    </div>
                    <p className="text-[10px] text-muted-foreground mt-1">of ₦2M benchmark</p>
                  </div>
                  <div className="bg-secondary/60 rounded-xl p-4 border border-border">
                    <p className="text-xs text-muted-foreground mb-2">Average Spend per Stay</p>
                    <p className="text-2xl font-bold text-foreground">{formatNaira(avgSpend)}</p>
                    <div className="flex items-center gap-1.5 mt-3">
                      <Star size={12} className="text-amber-400" />
                      <p className="text-xs text-amber-400 font-medium">{tier.label} Tier Guest</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Recent Stay Summary */}
              {guest.stayHistory.length > 0 && (
                <div>
                  <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Most Recent Stay</h4>
                  <div className="bg-secondary/60 rounded-xl p-4 border border-border flex items-center justify-between">
                    <div>
                      <p className="font-medium text-foreground">Room {guest.stayHistory[0].room}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {guest.stayHistory[0].checkIn} → {guest.stayHistory[0].checkOut} · {guest.stayHistory[0].nights} nights
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-foreground">{formatNaira(guest.stayHistory[0].amount)}</p>
                      <p className="text-xs text-muted-foreground">Total charged</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Comments Preview */}
              {guest.stayComments.length > 0 && (
                <div>
                  <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Latest Staff Note</h4>
                  <div className="bg-amber-500/5 border border-amber-500/20 rounded-xl p-4">
                    <p className="text-sm text-foreground italic">"{guest.stayComments[guest.stayComments.length - 1].comment}"</p>
                    <div className="flex items-center gap-2 mt-2">
                      <Clock size={11} className="text-muted-foreground" />
                      <p className="text-xs text-muted-foreground">
                        By {guest.stayComments[guest.stayComments.length - 1].addedBy} · {guest.stayComments[guest.stayComments.length - 1].addedAt}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Stay History Tab */}
          {activeTab === 'stays' && (
            <div>
              {guest.stayHistory.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <BedDouble size={36} className="mx-auto mb-3 opacity-20" />
                  <p className="text-sm">No stay history yet</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {guest.stayHistory.map((stay, i) => (
                    <div key={i} className="flex items-center justify-between p-4 bg-secondary/50 rounded-xl border border-border hover:border-primary/20 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="w-9 h-9 rounded-lg bg-primary/15 border border-primary/20 flex items-center justify-center text-xs font-bold text-primary">
                          {stay.room}
                        </div>
                        <div>
                          <p className="font-medium text-foreground text-sm">{stay.checkIn} → {stay.checkOut}</p>
                          <p className="text-xs text-muted-foreground">{stay.nights} night{stay.nights > 1 ? 's' : ''}</p>
                        </div>
                      </div>
                      <p className="font-semibold text-foreground text-sm">{formatNaira(stay.amount)}</p>
                    </div>
                  ))}
                  <div className="mt-4 flex items-center justify-between px-4 py-3 bg-primary/5 border border-primary/15 rounded-xl">
                    <p className="text-sm font-semibold text-foreground">Total Lifetime Value</p>
                    <p className="text-sm font-bold text-primary">{formatNaira(guest.totalRevenue)}</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Documents Tab */}
          {activeTab === 'documents' && (
            <div>
              {guest.governmentDocs.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Shield size={36} className="mx-auto mb-3 opacity-20" />
                  <p className="text-sm">No government documents on file</p>
                  <p className="text-xs mt-1">Documents can be added when checking in a new guest</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {guest.governmentDocs.map((doc, i) => (
                    <div key={i} className="p-4 bg-secondary/50 rounded-xl border border-border">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-lg bg-emerald-500/15 border border-emerald-500/25 flex items-center justify-center">
                            <Shield size={16} className="text-emerald-400" />
                          </div>
                          <div>
                            <p className="font-medium text-foreground text-sm">{doc.type}</p>
                            <p className="text-xs text-muted-foreground font-mono mt-0.5">{doc.number}</p>
                          </div>
                        </div>
                        <span className="text-xs font-medium text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-1 rounded-full">
                          Verified
                        </span>
                      </div>
                      {doc.photoDataUrl && (
                        <div className="mt-3 pt-3 border-t border-border">
                          <p className="text-xs text-muted-foreground flex items-center gap-1 mb-2">
                            <ImageIcon size={11} /> Document Photo
                          </p>
                          <img
                            src={doc.photoDataUrl}
                            alt={`${doc.type} document`}
                            className="max-h-48 rounded-lg border border-border object-contain bg-black/20"
                          />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Comments Tab */}
          {activeTab === 'comments' && (
            <div>
              {!isAdmin && (
                <div className="mb-4 flex items-center gap-2 px-4 py-3 bg-amber-500/5 border border-amber-500/20 rounded-xl">
                  <Shield size={14} className="text-amber-400 shrink-0" />
                  <p className="text-xs text-amber-400">Comments are read-only. Only administrators can edit staff notes.</p>
                </div>
              )}
              {guest.stayComments.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <MessageSquare size={36} className="mx-auto mb-3 opacity-20" />
                  <p className="text-sm">No staff comments yet</p>
                  <p className="text-xs mt-1">Front desk can add notes during check-out</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {guest.stayComments.map((c, i) => (
                    <div key={i} className="p-4 bg-secondary/50 rounded-xl border border-border">
                      {editingCommentIdx === i ? (
                        <div className="space-y-3">
                          <textarea
                            value={editText}
                            onChange={(e) => setEditText(e.target.value)}
                            className="w-full px-3 py-2.5 bg-secondary border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                            rows={3}
                          />
                          <div className="flex gap-2">
                            <button
                              onClick={saveEdit}
                              className="px-4 py-1.5 bg-primary text-primary-foreground text-xs font-semibold rounded-lg hover:shadow-md hover:shadow-primary/30 transition-all"
                            >
                              Save
                            </button>
                            <button
                              onClick={() => setEditingCommentIdx(null)}
                              className="px-4 py-1.5 border border-border text-xs text-foreground rounded-lg hover:bg-secondary transition-colors"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <p className="text-sm text-foreground leading-relaxed">"{c.comment}"</p>
                          <div className="flex items-center justify-between mt-3">
                            <div className="flex items-center gap-2">
                              <Clock size={11} className="text-muted-foreground" />
                              <p className="text-xs text-muted-foreground">
                                {c.addedBy} · {c.addedAt}
                                {c.reservationId && (
                                  <span className="ml-2 font-mono text-[10px] text-muted-foreground/60">
                                    Reservation #{c.reservationId}
                                  </span>
                                )}
                              </p>
                            </div>
                            {isAdmin && (
                              <button
                                onClick={() => startEdit(i)}
                                className="text-xs text-primary hover:text-accent transition-colors font-medium"
                              >
                                Edit
                              </button>
                            )}
                          </div>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
