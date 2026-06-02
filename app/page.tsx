import { AuthProvider } from '@/lib/auth-context';
import LoginPage from '@/components/auth/login-page';

export default function Page() {
  return (
    <AuthProvider>
      <LoginPage />
    </AuthProvider>
  );
}
