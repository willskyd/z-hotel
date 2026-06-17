import { AuthProvider } from '@/lib/auth-context';
import { DashboardShell } from '@/components/layout/dashboard-shell';

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
      <DashboardShell>{children}</DashboardShell>
    </AuthProvider>
  );
}
