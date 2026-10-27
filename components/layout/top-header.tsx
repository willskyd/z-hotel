'use client';

import { Search, User, ChevronRight } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { useSidebar } from '@/lib/sidebar-context';
import { usePathname } from 'next/navigation';
import NotificationPanel from '@/components/notifications/notification-panel';

const PAGE_NAMES: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/dashboard/rooms': 'Rooms',
  '/dashboard/reservations': 'Reservations',
  '/dashboard/guests': 'Guests',
  '/dashboard/front-desk': 'Receptionist',
  '/dashboard/billing': 'Billing',
  '/dashboard/audit-log': 'Audit Log',
};

const ROLE_COLORS: Record<string, string> = {
  admin: 'text-red-400',
  manager: 'text-primary',
  staff: 'text-blue-400',
};

export function TopHeader() {
  const { user } = useAuth();
  const { expanded } = useSidebar();
  const pathname = usePathname();
  const pageName = PAGE_NAMES[pathname] ?? 'Dashboard';

  return (
    <header
      style={{ left: expanded ? '240px' : '64px' }}
      className="fixed top-0 right-0 h-16 bg-card/90 backdrop-blur-xl border-b border-border flex items-center justify-between px-6 z-30 transition-[left] duration-300 ease-in-out"
    >
      {/* Left — Breadcrumb */}
      <div className="flex items-center gap-2 text-sm">
        <span className="text-muted-foreground font-medium">Zinuel-ch</span>
        <ChevronRight size={14} className="text-muted-foreground/50" />
        <span className="text-foreground font-semibold">{pageName}</span>
      </div>

      {/* Right — Actions */}
      <div className="flex items-center gap-3">
        {/* Search */}
        <div className="hidden lg:flex items-center bg-secondary/80 border border-border rounded-xl px-3 py-2 w-56 gap-2 focus-within:border-primary/50 focus-within:bg-secondary transition-all duration-200">
          <Search size={14} className="text-muted-foreground shrink-0" />
          <input
            type="text"
            placeholder="Search guests, rooms..."
            className="bg-transparent border-0 outline-none w-full text-sm text-foreground placeholder:text-muted-foreground/60"
          />
        </div>

        {/* Notifications */}
        <NotificationPanel />

        {/* Separator */}
        <div className="w-px h-6 bg-border" />

        {/* User Profile */}
        <div className="flex items-center gap-2.5 cursor-pointer group">
          <div className="w-8 h-8 rounded-xl bg-primary/20 border border-primary/30 flex items-center justify-center group-hover:bg-primary/30 transition-colors duration-200">
            <User size={15} className="text-primary" />
          </div>
          <div className="hidden md:block leading-none">
            <p className="text-sm font-semibold text-foreground">
              {user?.fullName?.split(' ')?.[0] ?? user?.email?.split('@')?.[0] ?? 'User'}
            </p>
            <p className={`text-[11px] capitalize font-medium mt-0.5 ${ROLE_COLORS[user?.role ?? 'staff'] ?? 'text-muted-foreground'}`}>
              {user?.role ?? 'staff'}
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}
