'use client';

import { Bell, Search, User } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';

export function TopHeader() {
  const { user } = useAuth();

  return (
    <header className="fixed top-0 left-16 right-0 h-16 bg-card border-b border-border flex items-center justify-between px-6 z-30">
      {/* Left side - Search and Breadcrumb */}
      <div className="flex items-center gap-4 flex-1">
        <div className="hidden md:flex items-center gap-2 text-sm text-muted-foreground">
          <span>Dashboard</span>
        </div>
      </div>

      {/* Right side - Actions */}
      <div className="flex items-center gap-4">
        {/* Search */}
        <div className="hidden lg:flex items-center bg-secondary rounded-lg px-3 py-2 w-64">
          <Search size={16} className="text-muted-foreground" />
          <input
            type="text"
            placeholder="Search..."
            className="bg-transparent border-0 outline-none ml-2 w-full text-sm text-foreground placeholder:text-muted-foreground"
          />
        </div>

        {/* Notifications */}
        <button className="w-10 h-10 rounded-lg flex items-center justify-center text-muted-foreground hover:bg-secondary transition-colors relative">
          <Bell size={18} />
          <span className="absolute top-2 right-2 w-2 h-2 bg-primary rounded-full"></span>
        </button>

        {/* User Profile */}
        <div className="flex items-center gap-3 pl-4 border-l border-border">
          <div className="text-right">
            <p className="text-sm font-medium text-foreground">{user?.email?.split('@')[0] || 'User'}</p>
            <p className="text-xs text-muted-foreground capitalize">{user?.role || 'staff'}</p>
          </div>
          <div className="w-9 h-9 rounded-lg bg-primary/20 flex items-center justify-center">
            <User size={18} className="text-primary" />
          </div>
        </div>
      </div>
    </header>
  );
}
