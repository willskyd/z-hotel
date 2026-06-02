import { AuthProvider } from '@/lib/auth-context';
import { IconSidebar } from '@/components/layout/icon-sidebar';
import { TopHeader } from '@/components/layout/top-header';
import ProtectedRoute from '@/components/auth/protected-route';

export const metadata = {
  title: 'Dashboard | Zinuel-ch Hotel',
  description: 'Hotel property management dashboard',
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      <ProtectedRoute>
        <div className="min-h-screen bg-background">
          <IconSidebar />
          <TopHeader />
          <main className="ml-16 pt-16 overflow-auto">
            <div className="p-6 md:p-8">
              {children}
            </div>
          </main>
        </div>
      </ProtectedRoute>
    </AuthProvider>
  );
}
