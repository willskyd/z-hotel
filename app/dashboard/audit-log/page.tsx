'use client';

import { useState } from 'react';
import {
  Shield, Search, Filter, Download, Clock, User, FileText,
  BedDouble, Users, Calendar, Wallet, ChevronDown,
} from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';

type ActionType =
  | 'CREATE_ROOM' | 'UPDATE_ROOM' | 'DELETE_ROOM'
  | 'CREATE_GUEST' | 'UPDATE_GUEST'
  | 'CREATE_RESERVATION' | 'UPDATE_RESERVATION' | 'CANCEL_RESERVATION'
  | 'PROCESS_CHECKOUT' | 'PROCESS_CHECKIN'
  | 'UPDATE_ROOM_TYPE' | 'CREATE_ROOM_TYPE'
  | 'UPDATE_BILLING' | 'LOGIN' | 'LOGOUT';

interface AuditEntry {
  id: string;
  userEmail: string;
  userRole: 'admin' | 'manager' | 'staff';
  action: ActionType;
  entity: string;
  entityId?: string;
  details: string;
  timestamp: string;
  metadata?: Record<string, any>;
}

const ACTION_META: Record<string, { label: string; color: string; bg: string; Icon: React.ElementType }> = {
  CREATE_ROOM:       { label: 'Create Room',       color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20', Icon: BedDouble },
  UPDATE_ROOM:       { label: 'Update Room',       color: 'text-blue-400',    bg: 'bg-blue-500/10 border-blue-500/20',    Icon: BedDouble },
  DELETE_ROOM:       { label: 'Delete Room',       color: 'text-red-400',     bg: 'bg-red-500/10 border-red-500/20',     Icon: BedDouble },
  CREATE_GUEST:      { label: 'Register Guest',    color: 'text-purple-400',  bg: 'bg-purple-500/10 border-purple-500/20', Icon: Users },
  UPDATE_GUEST:      { label: 'Update Guest',      color: 'text-blue-400',    bg: 'bg-blue-500/10 border-blue-500/20',    Icon: Users },
  CREATE_RESERVATION:{ label: 'New Reservation',   color: 'text-primary',     bg: 'bg-primary/10 border-primary/20',      Icon: Calendar },
  UPDATE_RESERVATION:{ label: 'Update Reservation',color: 'text-amber-400',   bg: 'bg-amber-500/10 border-amber-500/20',  Icon: Calendar },
  CANCEL_RESERVATION:{ label: 'Cancel Reservation',color: 'text-red-400',     bg: 'bg-red-500/10 border-red-500/20',     Icon: Calendar },
  PROCESS_CHECKOUT:  { label: 'Check-Out',         color: 'text-amber-400',   bg: 'bg-amber-500/10 border-amber-500/20',  Icon: BedDouble },
  PROCESS_CHECKIN:   { label: 'Check-In',          color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20', Icon: BedDouble },
  UPDATE_ROOM_TYPE:  { label: 'Update Room Type',  color: 'text-blue-400',    bg: 'bg-blue-500/10 border-blue-500/20',    Icon: BedDouble },
  CREATE_ROOM_TYPE:  { label: 'Create Room Type',  color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20', Icon: BedDouble },
  UPDATE_BILLING:    { label: 'Update Billing',    color: 'text-primary',     bg: 'bg-primary/10 border-primary/20',      Icon: Wallet },
  LOGIN:             { label: 'Login',             color: 'text-muted-foreground', bg: 'bg-secondary border-border',      Icon: User },
  LOGOUT:            { label: 'Logout',            color: 'text-muted-foreground', bg: 'bg-secondary border-border',      Icon: User },
};

const ROLE_COLORS: Record<string, string> = {
  admin:   'bg-red-500/10 border-red-500/20 text-red-400',
  manager: 'bg-primary/10 border-primary/20 text-primary',
  staff:   'bg-blue-500/10 border-blue-500/20 text-blue-400',
};

// Mock audit log entries
const MOCK_LOGS: AuditEntry[] = [
  { id: '1', userEmail: 'admin@zinuel-ch.com', userRole: 'admin', action: 'UPDATE_ROOM', entity: 'room', entityId: 'R-301', details: 'Updated room 301 pricing from ₦85,000 to ₦95,000/night', timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(), metadata: { pricePerNight: 95000 } },
  { id: '2', userEmail: 'manager@zinuel-ch.com', userRole: 'manager', action: 'PROCESS_CHECKIN', entity: 'reservation', entityId: 'RES-007', details: 'Checked in Emeka Okafor to Room 301. Staff: Amara.', timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString() },
  { id: '3', userEmail: 'admin@zinuel-ch.com', userRole: 'admin', action: 'CREATE_ROOM', entity: 'room', entityId: 'R-501', details: 'Created room 501 (Suite) at ₦150,000/night', timestamp: new Date(Date.now() - 45 * 60 * 1000).toISOString(), metadata: { roomNumber: '501', type: 'Suite', pricePerNight: 150000 } },
  { id: '4', userEmail: 'manager@zinuel-ch.com', userRole: 'manager', action: 'CREATE_GUEST', entity: 'guest', entityId: 'G-056', details: 'Registered new guest: Fatima Aliyu (fatima@example.com)', timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString() },
  { id: '5', userEmail: 'admin@zinuel-ch.com', userRole: 'admin', action: 'UPDATE_ROOM_TYPE', entity: 'room_type', entityId: 'RT-deluxe', details: 'Updated Deluxe room type base price from ₦75,000 to ₦85,000', timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(), metadata: { basePrice: 85000 } },
  { id: '6', userEmail: 'manager@zinuel-ch.com', userRole: 'manager', action: 'CANCEL_RESERVATION', entity: 'reservation', entityId: 'RES-006', details: 'Cancelled reservation RES-006 for Biodun Fashola — guest request', timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString() },
  { id: '7', userEmail: 'admin@zinuel-ch.com', userRole: 'admin', action: 'PROCESS_CHECKOUT', entity: 'reservation', entityId: 'RES-005', details: 'Processed check-out for Aisha Bello (Room 102). Note: "Minor issue with towels — resolved."', timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString() },
  { id: '8', userEmail: 'staff@zinuel-ch.com', userRole: 'staff', action: 'CREATE_RESERVATION', entity: 'reservation', entityId: 'RES-007', details: 'Created reservation for Chidi Nwosu: Room 410, 3 nights, ₦255,000', timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString() },
  { id: '9', userEmail: 'admin@zinuel-ch.com', userRole: 'admin', action: 'UPDATE_ROOM', entity: 'room', entityId: 'R-302', details: 'Changed room 302 status to Maintenance', timestamp: new Date(Date.now() - 10 * 60 * 60 * 1000).toISOString(), metadata: { status: 'maintenance' } },
  { id: '10', userEmail: 'manager@zinuel-ch.com', userRole: 'manager', action: 'LOGIN', entity: 'auth', details: 'Manager logged in from 192.168.1.45', timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString() },
  { id: '11', userEmail: 'admin@zinuel-ch.com', userRole: 'admin', action: 'CREATE_ROOM_TYPE', entity: 'room_type', entityId: 'RT-exec', details: 'Created new room type: Executive at ₦120,000 base price', timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString() },
  { id: '12', userEmail: 'staff@zinuel-ch.com', userRole: 'staff', action: 'UPDATE_GUEST', entity: 'guest', entityId: 'G-012', details: 'Updated phone number for Ngozi Adeyemi', timestamp: new Date(Date.now() - 26 * 60 * 60 * 1000).toISOString() },
];

function timeAgo(iso: string) {
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

export default function AuditLogPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [logs] = useState<AuditEntry[]>(MOCK_LOGS);
  const [search, setSearch] = useState('');
  const [filterAction, setFilterAction] = useState('');
  const [filterRole, setFilterRole] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  if (user?.role !== 'admin' && user?.role !== 'manager') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <Shield size={48} className="text-red-400 mb-4" />
        <h2 className="text-xl font-bold text-foreground mb-2">Access Restricted</h2>
        <p className="text-muted-foreground">Audit logs are only accessible to administrators and managers.</p>
        <button onClick={() => router.push('/dashboard')} className="mt-6 px-5 py-2.5 bg-primary text-primary-foreground rounded-xl text-sm font-semibold">
          Return to Dashboard
        </button>
      </div>
    );
  }

  const filtered = logs.filter((l) => {
    const q = search.toLowerCase();
    const matchSearch = !q || l.userEmail.toLowerCase().includes(q) || l.details.toLowerCase().includes(q) || l.action.toLowerCase().includes(q) || (l.entityId ?? '').toLowerCase().includes(q);
    const matchAction = !filterAction || l.action === filterAction;
    const matchRole = !filterRole || l.userRole === filterRole;
    return matchSearch && matchAction && matchRole;
  });

  const uniqueActions = [...new Set(logs.map((l) => l.action))].sort();

  return (
    <div className="min-w-0 max-w-[1400px] space-y-6 overflow-x-clip md:overflow-x-visible">
      {/* Header */}
      <div className="flex min-w-0 flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="w-full min-w-0 sm:w-auto">
          <h1 className="text-xl font-bold text-foreground sm:text-2xl">Audit Log</h1>
          <p className="mt-1 break-words text-xs leading-relaxed text-muted-foreground sm:text-sm">
            Complete record of all administrative operations — {logs.length} entries
          </p>
        </div>
        <div className="flex w-full min-w-0 flex-col items-stretch gap-2 sm:w-auto sm:flex-row sm:items-center sm:justify-end sm:gap-3">
          <div className="flex min-w-0 items-center gap-1.5 rounded-xl border border-amber-500/20 bg-amber-500/10 px-2.5 py-2 sm:px-3">
            <Shield size={14} className="text-amber-400" />
            <span className="truncate text-[10px] font-semibold capitalize text-amber-400 sm:text-xs">{user?.role} view</span>
          </div>
          <button className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-border bg-secondary px-3 py-2 text-xs font-medium text-foreground transition-colors hover:bg-secondary/80 sm:w-auto sm:shrink-0 sm:gap-2 sm:px-4 sm:text-sm">
            <Download size={14} /> Export CSV
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 sm:gap-4 lg:grid-cols-4">
        {[
          { label: 'Total Entries', value: logs.length, color: 'text-foreground' },
          { label: 'Today', value: logs.filter((l) => new Date(l.timestamp).toDateString() === new Date().toDateString()).length, color: 'text-primary' },
          { label: 'Admins', value: logs.filter((l) => l.userRole === 'admin').length, color: 'text-red-400' },
          { label: 'Sensitive Actions', value: logs.filter((l) => ['UPDATE_ROOM', 'DELETE_ROOM', 'UPDATE_ROOM_TYPE', 'CANCEL_RESERVATION'].includes(l.action)).length, color: 'text-amber-400' },
        ].map(({ label, value, color }) => (
          <div key={label} className="flex min-w-0 flex-col items-start gap-1 rounded-xl border border-border bg-card px-3 py-2.5 sm:flex-row sm:items-center sm:justify-between sm:gap-3 sm:rounded-2xl sm:px-5 sm:py-4">
            <p className="text-[10px] uppercase leading-tight tracking-wide text-muted-foreground sm:text-xs sm:tracking-wider">{label}</p>
            <p className={`shrink-0 text-xl font-bold sm:text-2xl ${color}`}>{value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="grid min-w-0 grid-cols-1 gap-2 sm:flex sm:flex-wrap sm:items-center sm:gap-3">
        <div className="flex min-w-0 items-center gap-2 rounded-xl border border-border bg-card px-3 py-2.5 transition-colors focus-within:border-primary/50 sm:min-w-60 sm:flex-1">
          <Search size={14} className="text-muted-foreground shrink-0" />
          <input
            type="text"
            placeholder="Search by user, action, or details..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-transparent border-0 outline-none w-full text-sm text-foreground placeholder:text-muted-foreground/60"
          />
        </div>

        <div className="grid min-w-0 grid-cols-1 gap-2 sm:flex sm:items-center">
          <Filter size={14} className="hidden text-muted-foreground sm:block" />
          <select
            value={filterAction}
            onChange={(e) => setFilterAction(e.target.value)}
            className="w-full min-w-0 rounded-xl border border-border bg-card px-3 py-2.5 text-xs text-foreground transition-all focus:outline-none focus:ring-2 focus:ring-primary/50 sm:w-auto sm:text-sm"
          >
            <option value="">All Actions</option>
            {uniqueActions.map((a) => (
              <option key={a} value={a}>{ACTION_META[a]?.label ?? a}</option>
            ))}
          </select>
          <select
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
            className="w-full min-w-0 rounded-xl border border-border bg-card px-3 py-2.5 text-xs text-foreground transition-all focus:outline-none focus:ring-2 focus:ring-primary/50 sm:w-auto sm:text-sm"
          >
            <option value="">All Roles</option>
            <option value="admin">Admin</option>
            <option value="manager">Manager</option>
            <option value="staff">Staff</option>
          </select>
        </div>

        <p className="text-right text-xs text-muted-foreground sm:ml-auto">{filtered.length} results</p>
      </div>

      {/* Log Table */}
      <div className="hidden overflow-hidden rounded-2xl border border-border bg-card md:block">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-secondary/30">
                <th className="px-5 py-3.5 text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Timestamp</th>
                <th className="px-4 py-3.5 text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">User</th>
                <th className="px-4 py-3.5 text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Action</th>
                <th className="px-4 py-3.5 text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Entity</th>
                <th className="px-4 py-3.5 text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Details</th>
                <th className="px-4 py-3.5 w-8" />
              </tr>
            </thead>
            <tbody>
              {filtered.map((log, i) => {
                const meta = ACTION_META[log.action] ?? ACTION_META.LOGIN;
                const isExpanded = expandedId === log.id;
                return (
                  <>
                    <tr
                      key={log.id}
                      className={`hover:bg-secondary/30 transition-colors cursor-pointer ${
                        i < filtered.length - 1 ? 'border-b border-border/40' : ''
                      }`}
                      onClick={() => setExpandedId(isExpanded ? null : log.id)}
                    >
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2">
                          <Clock size={12} className="text-muted-foreground shrink-0" />
                          <div>
                            <p className="text-xs font-medium text-foreground">{timeAgo(log.timestamp)}</p>
                            <p className="text-[10px] text-muted-foreground/60 font-mono">
                              {new Date(log.timestamp).toLocaleString('en-NG', { dateStyle: 'short', timeStyle: 'short' })}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3.5">
                        <div>
                          <p className="text-xs font-semibold text-foreground truncate max-w-[160px]">{log.userEmail}</p>
                          <span className={`inline-flex text-[10px] font-semibold px-1.5 py-0.5 rounded-full border mt-0.5 ${ROLE_COLORS[log.userRole] ?? ''}`}>
                            {log.userRole}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className={`inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-full border ${meta.bg} ${meta.color}`}>
                          <meta.Icon size={10} />
                          {meta.label}
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        <p className="text-xs text-muted-foreground capitalize">{log.entity.replace('_', ' ')}</p>
                        {log.entityId && <p className="text-[10px] font-mono text-muted-foreground/60">{log.entityId}</p>}
                      </td>
                      <td className="px-4 py-3.5">
                        <p className="text-xs text-foreground line-clamp-2 max-w-xs">{log.details}</p>
                      </td>
                      <td className="px-4 py-3.5">
                        <ChevronDown
                          size={14}
                          className={`text-muted-foreground transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                        />
                      </td>
                    </tr>
                    {isExpanded && log.metadata && Object.keys(log.metadata).length > 0 && (
                      <tr key={`${log.id}-expanded`} className="border-b border-border/40 bg-secondary/20">
                        <td colSpan={6} className="px-5 py-3">
                          <div className="flex items-start gap-3">
                            <FileText size={13} className="text-muted-foreground mt-0.5 shrink-0" />
                            <div>
                              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Metadata</p>
                              <div className="flex flex-wrap gap-3">
                                {Object.entries(log.metadata).map(([k, v]) => (
                                  <div key={k} className="bg-card border border-border rounded-lg px-3 py-1.5">
                                    <p className="text-[10px] text-muted-foreground">{k}</p>
                                    <p className="text-xs font-semibold text-foreground font-mono">{String(v)}</p>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                );
              })}
            </tbody>
          </table>

          {filtered.length === 0 && (
            <div className="text-center py-16 text-muted-foreground">
              <FileText size={36} className="mx-auto mb-3 opacity-20" />
              <p className="text-sm">No audit log entries match your filters</p>
            </div>
          )}
        </div>
      </div>

      {/* Mobile audit entries */}
      <div className="min-w-0 max-w-full space-y-2 overflow-x-clip md:hidden">
        {filtered.map((log) => {
          const meta = ACTION_META[log.action] ?? ACTION_META.LOGIN;
          return (
            <details key={log.id} className="group min-w-0 overflow-hidden rounded-xl border border-border bg-card">
              <summary className="flex min-w-0 cursor-pointer list-none flex-col gap-2 p-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary/50 [&::-webkit-details-marker]:hidden">
                <div className="flex min-w-0 items-center justify-between gap-2">
                  <span className="flex min-w-0 items-center gap-1.5 text-xs font-semibold text-foreground">
                    <Clock size={13} className="shrink-0 text-muted-foreground" />
                    <span className="truncate">{timeAgo(log.timestamp)}</span>
                  </span>
                  <ChevronDown size={15} className="shrink-0 text-muted-foreground transition-transform group-open:rotate-180" />
                </div>
                <div className="flex min-w-0 flex-col items-start gap-2">
                  <span className={`inline-flex max-w-full items-center gap-1 rounded-full border px-2 py-1 text-[10px] font-semibold ${meta.bg} ${meta.color}`}>
                    <meta.Icon size={11} className="shrink-0" />
                    <span className="truncate">{meta.label}</span>
                  </span>
                  <span className="min-w-0 max-w-full break-all text-[11px] text-muted-foreground">{log.userEmail}</span>
                </div>
              </summary>
              <div className="grid min-w-0 max-w-full gap-2 border-t border-border/70 bg-secondary/20 p-3 text-xs [overflow-wrap:anywhere]">
                <p><span className="text-muted-foreground">Timestamp: </span><span className="font-mono text-foreground">{new Date(log.timestamp).toLocaleString('en-NG', { dateStyle: 'medium', timeStyle: 'short' })}</span></p>
                <p><span className="text-muted-foreground">User role: </span><span className="capitalize text-foreground">{log.userRole}</span></p>
                <p><span className="text-muted-foreground">Action: </span><span className="text-foreground">{meta.label}</span></p>
                <p className="break-all"><span className="text-muted-foreground">Entity: </span><span className="capitalize text-foreground">{log.entity.replace('_', ' ')}</span>{log.entityId && <span className="font-mono text-muted-foreground"> · {log.entityId}</span>}</p>
                <p className="break-words"><span className="text-muted-foreground">Details: </span><span className="text-foreground">{log.details}</span></p>
                {log.metadata && Object.keys(log.metadata).length > 0 && (
                  <div className="border-t border-border/70 pt-2">
                    <p className="mb-1.5 font-semibold uppercase tracking-wide text-muted-foreground">Additional information</p>
                    <div className="grid min-w-0 grid-cols-1 gap-2">
                      {Object.entries(log.metadata).map(([key, value]) => (
                        <div key={key} className="min-w-0 rounded-lg border border-border bg-card px-2.5 py-2">
                          <p className="break-words text-[10px] text-muted-foreground">{key}</p>
                          <p className="break-words font-mono font-medium text-foreground">{String(value)}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </details>
          );
        })}
        {filtered.length === 0 && (
          <div className="rounded-xl border border-border bg-card py-10 text-center text-muted-foreground">
            <FileText size={30} className="mx-auto mb-2 opacity-30" />
            <p className="text-sm">No audit log entries match your filters</p>
          </div>
        )}
      </div>
    </div>
  );
}
