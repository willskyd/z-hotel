'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';
import {
  LayoutDashboard,
  DoorOpen,
  Users,
  Calendar,
  Wallet,
  LogOut,
  Settings,
  Menu,
  X,
} from 'lucide-react';

const ICON_ROUTES = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/dashboard', id: 'dashboard' },
  { icon: DoorOpen, label: 'Rooms', href: '/dashboard/rooms', id: 'rooms' },
  { icon: Calendar, label: 'Reservations', href: '/dashboard/reservations', id: 'reservations' },
  { icon: Users, label: 'Guests', href: '/dashboard/guests', id: 'guests' },
  { icon: DoorOpen, label: 'Front Desk', href: '/dashboard/front-desk', id: 'frontdesk' },
  { icon: Wallet, label: 'Billing', href: '/dashboard/billing', id: 'billing' },
];

export function IconSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [showLogout, setShowLogout] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('token');
    router.push('/');
  };

  return (
    <aside className="fixed left-0 top-0 h-screen w-16 bg-sidebar flex flex-col items-center py-4 border-r border-sidebar-border z-40">
      {/* Logo/Brand Icon */}
      <div className="w-12 h-12 rounded-lg bg-sidebar-icon-bg flex items-center justify-center mb-8 cursor-pointer hover:bg-sidebar-icon-hover/20 transition-colors">
        <span className="text-lg font-bold text-primary">Z</span>
      </div>

      {/* Navigation Icons */}
      <nav className="flex-1 flex flex-col gap-3">
        {ICON_ROUTES.map(({ icon: Icon, label, href, id }) => {
          const isActive = pathname === href || pathname.startsWith(href + '/');
          return (
            <button
              key={id}
              onClick={() => router.push(href)}
              title={label}
              className={`w-12 h-12 rounded-lg flex items-center justify-center transition-all duration-200 ${
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'text-sidebar-icon bg-transparent hover:bg-sidebar-icon-bg'
              }`}
            >
              <Icon size={20} />
            </button>
          );
        })}
      </nav>

      {/* Bottom Actions */}
      <div className="flex flex-col gap-2 border-t border-sidebar-border pt-4">
        <button
          title="Settings"
          className="w-12 h-12 rounded-lg flex items-center justify-center text-sidebar-icon bg-transparent hover:bg-sidebar-icon-bg transition-all"
        >
          <Settings size={20} />
        </button>
        <div className="relative">
          <button
            onClick={() => setShowLogout(!showLogout)}
            title="Logout"
            className="w-12 h-12 rounded-lg flex items-center justify-center text-sidebar-icon bg-transparent hover:bg-destructive/20 transition-all"
          >
            <LogOut size={20} />
          </button>
          {showLogout && (
            <div className="absolute left-full ml-2 bottom-0 bg-card border border-border rounded-lg p-2 w-32 shadow-xl">
              <button
                onClick={handleLogout}
                className="w-full text-left px-3 py-2 text-sm text-foreground hover:bg-muted rounded transition-colors"
              >
                Confirm Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
