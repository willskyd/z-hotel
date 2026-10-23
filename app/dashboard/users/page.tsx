'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import {
  UserPlus,
  Users,
  ShieldCheck,
  LoaderCircle,
  RefreshCw,
} from 'lucide-react';

type ManagedUser = {
  id: string;
  fullName: string;
  email: string;
  role: 'admin' | 'manager' | 'staff';
  status: string;
  createdAt?: string | Date;
};

export default function UsersPage() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();

  const [users, setUsers] = useState<ManagedUser[]>([]);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'manager' | 'staff'>('staff');
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (isAuthenticated && user && user.role !== 'admin') {
      router.replace('/dashboard');
    }
  }, [isAuthenticated, user, router]);

  const loadUsers = useCallback(async () => {
    const token = localStorage.getItem('accessToken');

    if (!token) {
      setError('Your login session is missing. Please sign in again.');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      const response = await fetch('/api/admin/users', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        cache: 'no-store',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Unable to load user accounts.');
      }

      setUsers(data.users || []);
      setError('');
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Unable to load user accounts.',
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated && user?.role === 'admin') {
      void loadUsers();
    }
  }, [isAuthenticated, user, loadUsers]);

  async function handleCreateUser(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setMessage('');

    const token = localStorage.getItem('accessToken');

    if (!token) {
      setError('Your login session is missing. Please sign in again.');
      return;
    }

    setCreating(true);

    try {
      const response = await fetch('/api/admin/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          fullName,
          email,
          password,
          role,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Unable to create this account.');
      }

      setMessage('User account created successfully.');
      setFullName('');
      setEmail('');
      setPassword('');
      setRole('staff');

      await loadUsers();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Unable to create this account.',
      );
    } finally {
      setCreating(false);
    }
  }

  if (!isAuthenticated || !user) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <LoaderCircle className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  if (user.role !== 'admin') {
    return (
      <div className="rounded-xl border border-border bg-card p-8 text-center">
        <ShieldCheck className="mx-auto mb-3 h-10 w-10 text-muted-foreground" />
        <h1 className="text-xl font-semibold">Access restricted</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Only an administrator can manage user accounts.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">User Management</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Create staff accounts and assign hotel system roles.
          </p>
        </div>

        <div className="flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-3">
          <Users className="h-5 w-5 text-muted-foreground" />
          <div>
            <p className="text-xs text-muted-foreground">Total accounts</p>
            <p className="text-lg font-semibold">{users.length}</p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(280px,0.8fr)_minmax(0,1.4fr)]">
        <section className="h-fit rounded-xl border border-border bg-card p-5">
          <div className="mb-5 flex items-center gap-3">
            <div className="rounded-lg bg-primary/10 p-2">
              <UserPlus className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h2 className="font-semibold">Create account</h2>
              <p className="text-xs text-muted-foreground">
                Add a manager or staff member.
              </p>
            </div>
          </div>

          <form onSubmit={handleCreateUser} className="space-y-4">
            <div>
              <label htmlFor="fullName" className="mb-1.5 block text-sm font-medium">
                Full name
              </label>
              <input
                id="fullName"
                value={fullName}
                onChange={(event) => setFullName(event.target.value)}
                required
                maxLength={100}
                autoComplete="name"
                placeholder="Enter full name"
                className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-primary"
              />
            </div>

            <div>
              <label htmlFor="email" className="mb-1.5 block text-sm font-medium">
                Email address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
                autoComplete="email"
                placeholder="name@hotel.com"
                className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-primary"
              />
            </div>

            <div>
              <label htmlFor="password" className="mb-1.5 block text-sm font-medium">
                Temporary password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
                minLength={8}
                autoComplete="new-password"
                placeholder="At least 8 characters"
                className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-primary"
              />
            </div>

            <div>
              <label htmlFor="role" className="mb-1.5 block text-sm font-medium">
                Assign role
              </label>
              <select
                id="role"
                value={role}
                onChange={(event) =>
                  setRole(event.target.value as 'manager' | 'staff')
                }
                className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-primary"
              >
                <option value="staff">Staff</option>
                <option value="manager">Manager</option>
              </select>
              <p className="mt-1.5 text-xs text-muted-foreground">
                Admin accounts cannot be created from this form.
              </p>
            </div>

            {error && (
              <p role="alert" className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
                {error}
              </p>
            )}

            {message && (
              <p role="status" className="rounded-lg bg-emerald-500/10 p-3 text-sm text-emerald-600">
                {message}
              </p>
            )}

            <button
              type="submit"
              disabled={creating}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {creating ? (
                <LoaderCircle className="h-4 w-4 animate-spin" />
              ) : (
                <UserPlus className="h-4 w-4" />
              )}
              {creating ? 'Creating account...' : 'Create account'}
            </button>
          </form>
        </section>

        <section className="rounded-xl border border-border bg-card p-5">
          <div className="mb-5 flex items-center justify-between gap-3">
            <div>
              <h2 className="font-semibold">Hotel user accounts</h2>
              <p className="mt-1 text-xs text-muted-foreground">
                Accounts retrieved from the database.
              </p>
            </div>

            <button
              type="button"
              onClick={() => void loadUsers()}
              disabled={loading}
              aria-label="Refresh user list"
              className="rounded-lg border border-border p-2 transition-colors hover:bg-muted disabled:opacity-50"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>

          {loading ? (
            <div className="flex items-center justify-center gap-2 py-12 text-sm text-muted-foreground">
              <LoaderCircle className="h-5 w-5 animate-spin" />
              Loading accounts...
            </div>
          ) : error && users.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              Could not load accounts. Check the error shown in the form.
            </p>
          ) : users.length === 0 ? (
            <p className="py-10 text-center text-sm text-muted-foreground">
              No user accounts found.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[420px] text-left text-sm">
                <thead>
                  <tr className="border-b border-border text-xs text-muted-foreground">
                    <th className="px-3 py-3 font-medium">User</th>
                    <th className="px-3 py-3 font-medium">Role</th>
                    <th className="px-3 py-3 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((account) => (
                    <tr key={account.id} className="border-b border-border last:border-0">
                      <td className="px-3 py-4">
                        <p className="font-medium">{account.fullName}</p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {account.email}
                        </p>
                      </td>
                      <td className="px-3 py-4">
                        <span className="rounded-full bg-muted px-2.5 py-1 text-xs capitalize">
                          {account.role}
                        </span>
                      </td>
                      <td className="px-3 py-4">
                        <span className="text-xs capitalize text-emerald-600">
                          {account.status || 'active'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
