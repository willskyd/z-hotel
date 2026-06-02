'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';

const menuItems = [
  { href: '/dashboard', label: 'Dashboard', icon: '📊' },
  { href: '/dashboard/reservations', label: 'Reservations', icon: '📅' },
  { href: '/dashboard/rooms', label: 'Rooms', icon: '🛏️' },
  { href: '/dashboard/guests', label: 'Guests', icon: '👥' },
  { href: '/dashboard/front-desk', label: 'Front Desk', icon: '🏨' },
  { href: '/dashboard/billing', label: 'Billing', icon: '💳' },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex w-64 bg-sidebar border-r border-sidebar-border flex-col">
      {/* Logo Section */}
      <div className="p-6 border-b border-sidebar-border">
        <Link href="/dashboard" className="flex items-center gap-3">
          <div className="relative w-12 h-12">
            <Image
              src="/logo.png"
              alt="Zinuel-ch"
              fill
              className="object-contain"
            />
          </div>
          <div className="flex-1">
            <div className="font-bold text-sidebar-foreground text-sm">
              Zinuel-ch
            </div>
            <div className="text-xs text-sidebar-accent">Hotel PMS</div>
          </div>
        </Link>
      </div>

      {/* Menu Items */}
      <nav className="flex-1 overflow-y-auto p-4">
        <ul className="space-y-2">
          {menuItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                    isActive
                      ? 'bg-sidebar-primary text-sidebar-primary-foreground shadow-lg shadow-primary/20'
                      : 'text-sidebar-foreground hover:bg-sidebar-accent'
                  }`}
                >
                  <span className="text-lg">{item.icon}</span>
                  <span className="font-medium">{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-sidebar-border">
        <p className="text-xs text-sidebar-accent text-center">
          © 2024 Zinuel-ch
        </p>
      </div>
    </aside>
  );
}
