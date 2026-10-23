'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';
import {
  UserCog,
  LayoutDashboard,
  BedDouble,
  Users,
  Calendar,
  Wallet,
  LogOut,
  Settings,
  ConciergeBell,
  Pin,
  PinOff,
  ClipboardList,
} from 'lucide-react';
import { useSidebar } from '@/lib/sidebar-context';
import { useAuth } from '@/lib/auth-context';

 const USER_ADMIN_NAV_ITEMS = [
  {
    icon: UserCog,
    label: 'User Management',
    href: '/dashboard/users',
    id: 'users-admin',
    exact: false,
  },
];
const NAV_ITEMS = [
  { icon: LayoutDashboard, label: 'Dashboard',    href: '/dashboard',              id: 'dashboard',    exact: true  },
  { icon: BedDouble,       label: 'Rooms',        href: '/dashboard/rooms',        id: 'rooms',        exact: false },
  { icon: Calendar,        label: 'Reservations', href: '/dashboard/reservations', id: 'reservations', exact: false },
  { icon: Users,           label: 'Guests',       href: '/dashboard/guests',       id: 'guests',       exact: false },
  { icon: ConciergeBell,   label: 'Front Desk',   href: '/dashboard/front-desk',   id: 'frontdesk',    exact: false },
  { icon: Wallet,          label: 'Billing',      href: '/dashboard/billing',      id: 'billing',      exact: false },
];

// Shown only to admins and managers
const ADMIN_NAV_ITEMS = [
  { icon: ClipboardList, label: 'Audit Log', href: '/dashboard/audit-log', id: 'audit-log', exact: false },
];

export function IconSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { expanded, pinned, togglePin, setHovered } = useSidebar();
  const { logout, user } = useAuth();
  const [showLogout, setShowLogout] = useState(false);

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  const isActive = (href: string, exact: boolean) =>
    exact ? pathname === href : pathname === href || pathname.startsWith(href + '/');

  const canSeeAdminNav = user?.role === 'admin' || user?.role === 'manager';

  const allItems = [
  ...NAV_ITEMS,
  ...(user?.role === 'admin' ? USER_ADMIN_NAV_ITEMS : []),
  ...(canSeeAdminNav ? ADMIN_NAV_ITEMS : []),
];

  return (
    <aside
      style={{ width: expanded ? '240px' : '64px' }}
      className="fixed left-0 top-0 h-screen bg-sidebar border-r border-sidebar-border z-40 flex flex-col overflow-hidden transition-[width] duration-300 ease-in-out shadow-2xl shadow-black/30"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => {
        setHovered(false);
        setShowLogout(false);
      }}
    >
      {/* Logo / Brand */}
      <div className="flex items-center h-16 px-3 border-b border-sidebar-border shrink-0 gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/40 to-accent/30 border border-primary/40 flex items-center justify-center shrink-0 shadow-lg shadow-primary/10">
          <span className="text-base font-black text-primary tracking-tight">Z</span>
        </div>
        <div
          className="overflow-hidden flex-1 transition-all duration-300"
          style={{ opacity: expanded ? 1 : 0, maxWidth: expanded ? '160px' : '0px' }}
        >
          <p className="text-sm font-bold text-foreground whitespace-nowrap leading-none">Zinuel-ch</p>
          <p className="text-[11px] text-muted-foreground whitespace-nowrap mt-0.5">Hotel Management</p>
        </div>
        <button
          onClick={togglePin}
          style={{ opacity: expanded ? 1 : 0, pointerEvents: expanded ? 'auto' : 'none' }}
          className="ml-auto p-1.5 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all duration-200 shrink-0"
          title={pinned ? 'Unpin sidebar' : 'Pin sidebar open'}
        >
          {pinned ? <Pin size={13} /> : <PinOff size={13} />}
        </button>
      </div>

      {/* Section label */}
      <div
        className="px-3 pt-4 pb-1 overflow-hidden transition-all duration-300"
        style={{ opacity: expanded ? 1 : 0, height: expanded ? 'auto' : '0px' }}
      >
        <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">Navigation</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-2 px-2 space-y-0.5 overflow-y-auto overflow-x-hidden">
        {allItems.map(({ icon: Icon, label, href, id, exact }) => {
          const active = isActive(href, exact);
          const isAuditLog = id === 'audit-log';
          return (
            <button
              key={id}
              onClick={() => router.push(href)}
              title={!expanded ? label : undefined}
              className={`w-full flex items-center gap-3 px-2 py-2.5 rounded-xl transition-all duration-200 group ${
                active
                  ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/25'
                  : isAuditLog
                  ? 'text-amber-500/70 hover:bg-amber-500/10 hover:text-amber-400'
                  : 'text-sidebar-icon hover:bg-sidebar-icon-bg hover:text-foreground'
              }`}
            >
              <Icon
                size={18}
                className={`shrink-0 transition-transform duration-200 ${active ? '' : 'group-hover:scale-110'}`}
              />
              <span
                className="text-sm font-medium whitespace-nowrap overflow-hidden transition-all duration-300"
                style={{ opacity: expanded ? 1 : 0, maxWidth: expanded ? '160px' : '0px' }}
              >
                {label}
              </span>
              {active && expanded && (
                <span className="ml-auto w-1.5 h-1.5 rounded-full bg-primary-foreground/60 shrink-0" />
              )}
            </button>
          );
        })}
      </nav>

      {/* Divider */}
      <div className="border-t border-sidebar-border mx-2" />

      {/* Bottom Actions */}
      <div className="p-2 pb-3 space-y-0.5 shrink-0">
        <button
          onClick={() => router.push('/dashboard/settings')}
          title={!expanded ? 'Settings' : undefined}
          className={`w-full flex items-center gap-3 px-2 py-2.5 rounded-xl transition-all duration-200 group ${
            isActive('/dashboard/settings', false)
              ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/25'
              : 'text-sidebar-icon hover:bg-sidebar-icon-bg hover:text-foreground'
          }`}
        >
          <Settings size={18} className="shrink-0 group-hover:rotate-45 transition-transform duration-300" />
          <span
            className="text-sm font-medium whitespace-nowrap overflow-hidden transition-all duration-300"
            style={{ opacity: expanded ? 1 : 0, maxWidth: expanded ? '160px' : '0px' }}
          >
            Settings
          </span>
        </button>

        <div className="relative">
          <button
            onClick={() => setShowLogout(!showLogout)}
            title={!expanded ? 'Logout' : undefined}
            className="w-full flex items-center gap-3 px-2 py-2.5 rounded-xl text-sidebar-icon hover:bg-destructive/15 hover:text-red-400 transition-all group"
          >
            <LogOut size={18} className="shrink-0 group-hover:translate-x-0.5 transition-transform duration-200" />
            <span
              className="text-sm font-medium whitespace-nowrap overflow-hidden transition-all duration-300"
              style={{ opacity: expanded ? 1 : 0, maxWidth: expanded ? '160px' : '0px' }}
            >
              Logout
            </span>
          </button>
          {showLogout && (
            <div className="absolute left-full ml-2 bottom-0 bg-card border border-border rounded-xl p-2 w-40 shadow-2xl z-50">
              <p className="text-xs text-muted-foreground px-3 py-1.5 border-b border-border mb-1">Sign out?</p>
              <button
                onClick={handleLogout}
                className="w-full text-left px-3 py-2 text-sm text-red-400 hover:bg-red-500/10 rounded-lg transition-colors font-medium"
              >
                Yes, Sign Out
              </button>
              <button
                onClick={() => setShowLogout(false)}
                className="w-full text-left px-3 py-2 text-sm text-muted-foreground hover:bg-secondary rounded-lg transition-colors"
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
