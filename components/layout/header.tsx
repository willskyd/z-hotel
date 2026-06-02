'use client';

import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function Header() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  return (
    <header className="bg-card border-b border-border px-6 md:px-8 py-4 flex items-center justify-between sticky top-0 z-40">
      <div className="flex-1">
        <h2 className="text-xl font-semibold text-foreground">
          Zinuel-ch Hotel Management
        </h2>
      </div>

      {/* User Menu */}
      <div className="relative">
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-secondary transition-colors"
        >
          <div className="text-right">
            <p className="text-sm font-medium text-foreground">{user?.fullName}</p>
            <p className="text-xs text-muted-foreground capitalize">{user?.role}</p>
          </div>
          <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-semibold">
            {user?.fullName?.[0]?.toUpperCase()}
          </div>
        </button>

        {/* Dropdown Menu */}
        {isMenuOpen && (
          <div className="absolute right-0 mt-2 w-48 bg-card border border-border rounded-lg shadow-lg">
            <button
              onClick={handleLogout}
              className="w-full text-left px-4 py-3 text-sm text-foreground hover:bg-secondary rounded-lg transition-colors first:rounded-t-lg last:rounded-b-lg"
            >
              Sign Out
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
