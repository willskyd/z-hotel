import { AuthProvider } from '@/lib/auth-context';
import Sidebar from '@/components/layout/sidebar';
import Header from '@/components/layout/header';
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
        <div className="flex min-h-screen bg-background">
          <Sidebar />
          <div className="flex-1 flex flex-col">
            <Header />
            <main className="flex-1 overflow-auto">
              <div className="p-6 md:p-8">
                {children}
              </div>
            </main>
          </div>
        </div>
      </ProtectedRoute>
    </AuthProvider>
  );
}
