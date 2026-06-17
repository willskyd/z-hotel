'use client';

import { SidebarProvider, useSidebar } from '@/lib/sidebar-context';
import { NotificationProvider } from '@/lib/notification-context';
import { IconSidebar } from './icon-sidebar';
import { TopHeader } from './top-header';
import ProtectedRoute from '@/components/auth/protected-route';

function DashboardContent({ children }: { children: React.ReactNode }) {
  const { expanded } = useSidebar();
  return (
    <>
      <IconSidebar />
      <TopHeader />
      <main
        className="pt-16 min-h-screen overflow-auto transition-all duration-300 ease-in-out"
        style={{ marginLeft: expanded ? '240px' : '64px' }}
      >
        <div className="p-6 md:p-8">{children}</div>
      </main>
    </>
  );
}

export function DashboardShell({ children }: { children: React.ReactNode }) {
  return (
    <NotificationProvider>
      <SidebarProvider>
        <ProtectedRoute>
          <div className="min-h-screen bg-background">
            <DashboardContent>{children}</DashboardContent>
          </div>
        </ProtectedRoute>
      </SidebarProvider>
    </NotificationProvider>
  );
}
