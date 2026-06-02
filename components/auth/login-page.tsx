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
    <main className="min-h-screen bg-background flex">
      {/* Left Side - Info Section */}
      <div className="hidden lg:flex w-1/2 flex-col justify-center px-16 relative overflow-hidden">
        {/* Background Elements */}
        <div className="absolute top-20 left-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-accent/5 rounded-full blur-3xl"></div>

        {/* Logo */}
        <div className="relative z-10 mb-12">
          <div className="relative w-24 h-24 mb-8">
            <Image
              src="/logo.png"
              alt="Zinuel-ch Hotel"
              fill
              className="object-contain"
              priority
            />
          </div>
          <div className="space-y-4">
            <h1 className="text-4xl font-bold text-foreground">Zinuel-ch Hotel</h1>
            <p className="text-lg text-muted-foreground">Premium Property Management System</p>
          </div>
        </div>

        {/* Description */}
        <div className="relative z-10 space-y-4 max-w-md">
          <p className="text-foreground leading-relaxed">
            Streamline your hotel operations with our comprehensive property management solution. 
            Manage rooms, reservations, guests, and billing all in one place.
          </p>
          <div className="space-y-2 text-sm text-muted-foreground">
            <p>✓ Real-time room management</p>
            <p>✓ Advanced reservation system</p>
            <p>✓ Complete guest CRM</p>
            <p>✓ Integrated billing & payments</p>
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center px-6 py-8 relative">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center gap-3 mb-12">
            <div className="relative w-12 h-12">
              <Image
                src="/logo.png"
                alt="Zinuel-ch Hotel"
                fill
                className="object-contain"
                priority
              />
            </div>
            <div>
              <h2 className="text-xl font-bold text-foreground">Zinuel-ch</h2>
              <p className="text-xs text-muted-foreground">Hotel PMS</p>
            </div>
          </div>

          {/* Login Form Container */}
          <div className="space-y-6">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold text-foreground">Welcome back</h2>
              <p className="text-muted-foreground">Sign in to your Zinuel-ch account</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Email Input */}
              <div className="space-y-2">
                <label htmlFor="email" className="block text-sm font-medium text-foreground">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="w-full px-4 py-3 rounded-lg bg-secondary border border-border text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  required
                />
              </div>

              {/* Password Input */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label htmlFor="password" className="block text-sm font-medium text-foreground">
                    Password
                  </label>
                  <button
                    type="button"
                    className="text-xs text-primary hover:text-accent transition-colors"
                  >
                    Forgot Password?
                  </button>
                </div>
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
                className="w-full mt-8 px-6 py-3 rounded-lg bg-primary text-primary-foreground font-semibold transition-all duration-200 hover:shadow-lg hover:shadow-primary/30 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Signing in...' : 'Sign In'}
              </button>
            </form>

            {/* Demo Credentials */}
            <div className="pt-6 border-t border-border">
              <p className="text-xs text-muted-foreground text-center mb-3">
                Demo Credentials
              </p>
              <div className="space-y-2 text-xs bg-secondary/40 p-4 rounded-lg border border-border">
                <div className="text-foreground">
                  <p className="font-medium mb-1">Manager Account:</p>
                  <p className="text-muted-foreground">Email: manager@hotel.com</p>
                  <p className="text-muted-foreground">Password: password123</p>
                </div>
                <div className="text-foreground pt-3 border-t border-border">
                  <p className="font-medium mb-1">Staff Account:</p>
                  <p className="text-muted-foreground">Email: staff@hotel.com</p>
                  <p className="text-muted-foreground">Password: password123</p>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <p className="text-center text-xs text-muted-foreground mt-8">
            © 2024 Zinuel-ch Hotel. All rights reserved.
          </p>
        </div>
      </div>
    </main>
  );
}
