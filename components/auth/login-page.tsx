'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import Image from 'next/image';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await login(email, password);
      router.push('/dashboard');
    } catch (err) {
      setError('Invalid email or password');
      console.error('[v0] Login error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo Section */}
        <div className="flex justify-center mb-12">
          <div className="relative w-32 h-32">
            <Image
              src="/logo.png"
              alt="Zinuel-ch Hotel"
              fill
              className="object-contain"
              priority
            />
          </div>
        </div>

        {/* Login Card */}
        <div className="card-premium">
          <div className="space-y-2 mb-8">
            <h1 className="text-3xl font-bold gradient-text">Zinuel-ch Hotel</h1>
            <p className="text-muted-foreground">Property Management System</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email Input */}
            <div className="space-y-2">
              <label htmlFor="email" className="block text-sm font-medium text-foreground">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="manager@zinuel-ch.com"
                className="w-full px-4 py-3 rounded-lg bg-secondary border border-border text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                required
              />
            </div>

            {/* Password Input */}
            <div className="space-y-2">
              <label htmlFor="password" className="block text-sm font-medium text-foreground">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-3 rounded-lg bg-secondary border border-border text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                required
              />
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-3 bg-destructive/10 border border-destructive/30 rounded-lg text-destructive text-sm">
                {error}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-6 btn-premium bg-primary text-primary-foreground font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg hover:shadow-primary/30"
            >
              {isLoading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          {/* Demo Credentials */}
          <div className="mt-8 pt-6 border-t border-border">
            <p className="text-xs text-muted-foreground text-center mb-3">
              Demo Credentials:
            </p>
            <div className="space-y-2 text-xs bg-secondary/50 p-3 rounded-lg border border-border">
              <p className="text-foreground">
                <span className="text-muted-foreground">Manager:</span> manager@hotel.com / password123
              </p>
              <p className="text-foreground">
                <span className="text-muted-foreground">Staff:</span> staff@hotel.com / password123
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-muted-foreground mt-8">
          © 2024 Zinuel-ch Hotel. All rights reserved.
        </p>
      </div>
    </main>
  );
}
