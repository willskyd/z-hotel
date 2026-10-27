'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Sun, Moon, Palette, Hotel, Clock, Percent, Bell,
  Shield, Lock, Globe, LogOut, Save,
  AlertTriangle, CheckCircle2, Smartphone,
  Eye, EyeOff,
} from 'lucide-react';
import { useTheme } from '@/lib/theme-context';
import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';

const DEFAULT_HOTEL = {
  name: 'Zinuel-ch Hotel',
  address: '14 Adeola Odeku Street',
  city: 'Victoria Island',
  state: 'Lagos',
  phone: '+234 801 234 5678',
  email: 'info@zinuelch.com',
  website: 'https://zinuelch.com',
  taxId: 'RC-1234567',
};

const DEFAULT_OPS = {
  checkInTime: '14:00',
  checkOutTime: '12:00',
  taxRate: '7.5',
  serviceCharge: '5',
  lateCheckoutFee: '15000',
  earlyCheckinFee: '10000',
  cancellationHours: '24',
  maxOccupancyBuffer: '2',
};

const DEFAULT_NOTIF = {
  newReservation: true,
  checkinReminder: true,
  checkoutReminder: true,
  overduePayment: true,
  maintenanceAlert: false,
  lowOccupancy: true,
  staffMessages: true,
  emailAlerts: true,
  smsAlerts: false,
};

const DEFAULT_SECURITY = {
  sessionTimeout: '60',
  require2FA: false,
  loginNotifications: true,
  ipWhitelist: false,
};

const DEFAULT_SYS = {
  timezone: 'Africa/Lagos',
  dateFormat: 'DD/MM/YYYY',
  language: 'en-NG',
  currency: 'NGN',
  compactMode: false,
  autoBackup: true,
  backupFrequency: 'daily',
};

type SettingsSection = 'hotel' | 'operations' | 'notifications' | 'security' | 'system';

const defaultSettings = {
  hotel: DEFAULT_HOTEL,
  operations: DEFAULT_OPS,
  notifications: DEFAULT_NOTIF,
  security: DEFAULT_SECURITY,
  system: DEFAULT_SYS,
};

function SectionHeader({ icon: Icon, title, description }: { icon: React.ElementType; title: string; description: string }) {
  return (
    <div className="flex items-center gap-3 mb-5">
      <div className="w-9 h-9 rounded-xl bg-primary/15 border border-primary/25 flex items-center justify-center shrink-0">
        <Icon size={16} className="text-primary" />
      </div>
      <div>
        <h2 className="text-sm font-bold text-foreground">{title}</h2>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
    </div>
  );
}

function Card({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`bg-card border border-border rounded-2xl p-4 sm:p-6 ${className}`}>{children}</div>
  );
}

function Toggle({ checked, onChange, disabled = false }: { checked: boolean; onChange: (v: boolean) => void; disabled?: boolean }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => !disabled && onChange(!checked)}
      disabled={disabled}
      className={`relative w-11 h-6 rounded-full transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 shrink-0 ${
        checked ? 'bg-primary' : 'bg-muted'
      } ${disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}`}
    >
      <span
        className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-md transition-transform duration-200 ${
          checked ? 'translate-x-5' : 'translate-x-0'
        }`}
      />
    </button>
  );
}

function Row({ label, description, children }: { label: string; description?: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 py-4 border-b border-border last:border-0">
      <div className="min-w-0 flex-1 pr-1 sm:pr-4">
        <p className="text-sm font-medium text-foreground">{label}</p>
        {description && <p className="text-xs text-muted-foreground mt-0.5">{description}</p>}
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  );
}

function inputCls(err?: string) {
  return `w-full px-3.5 py-2.5 bg-secondary border rounded-xl text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 transition-all ${
    err ? 'border-red-500/50 focus:ring-red-500/30' : 'border-border focus:ring-primary/50 focus:border-primary/50'
  }`;
}

export default function SettingsPage() {
  const { theme, setTheme, accentColor, setAccentColor } = useTheme();
  const { user, logout } = useAuth();
  const router = useRouter();
  const isAdmin = user?.role === 'admin';

  const [hotel, setHotel] = useState(DEFAULT_HOTEL);
  const [ops, setOps] = useState(DEFAULT_OPS);
  const [notif, setNotif] = useState(DEFAULT_NOTIF);
  const [security, setSecurity] = useState(DEFAULT_SECURITY);
  const [sys, setSys] = useState(DEFAULT_SYS);
  const [saved, setSaved] = useState<string | null>(null);
  const [isLoadingSettings, setIsLoadingSettings] = useState(true);
  const [settingsError, setSettingsError] = useState('');
  const [passwordForm, setPasswordForm] = useState({ current: '', next: '', confirm: '' });
  const [showPwd, setShowPwd] = useState(false);
  const [pwdError, setPwdError] = useState('');
  const [pwdSuccess, setPwdSuccess] = useState(false);
  const [isSaving, setIsSaving] = useState<string | null>(null);

  const loadSettings = useCallback(async () => {
    if (!user) {
      setIsLoadingSettings(false);
      setSettingsError('');
      return;
    }

    const token = localStorage.getItem('accessToken');
    if (!token) {
      setIsLoadingSettings(false);
      setSettingsError('');
      return;
    }

    try {
      const response = await fetch('/api/settings', {
        headers: { Authorization: `Bearer ${token}` },
        cache: 'no-store',
      });

      if (response.status === 401 || response.status === 403) {
        setSettingsError('');
        return;
      }

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        throw new Error(data?.error || 'Unable to load settings');
      }

      const data = await response.json();
      const nextSettings = data.settings ?? defaultSettings;

      setHotel({ ...DEFAULT_HOTEL, ...(nextSettings.hotel ?? {}) });
      setOps({ ...DEFAULT_OPS, ...(nextSettings.operations ?? {}) });
      setNotif({ ...DEFAULT_NOTIF, ...(nextSettings.notifications ?? {}) });
      setSecurity({ ...DEFAULT_SECURITY, ...(nextSettings.security ?? {}) });
      setSys((prev) => ({ ...prev, ...DEFAULT_SYS, ...(nextSettings.system ?? {}) }));
    } catch (error) {
      console.error('[settings] Failed to load settings:', error);
      setSettingsError('Unable to load saved settings. You can continue editing locally.');
    } finally {
      setIsLoadingSettings(false);
    }
  }, [user]);

  useEffect(() => {
    const storedCompact = localStorage.getItem('zinuel-compact-mode');
    if (storedCompact !== null) {
      setSys((prev) => ({ ...prev, compactMode: storedCompact === 'true' }));
    }

    if (!user) {
      setIsLoadingSettings(false);
      setSettingsError('');
      return;
    }

    void loadSettings();
  }, [loadSettings, user]);

  useEffect(() => {
    const root = document.documentElement;
    root.dataset.compact = String(sys.compactMode);
    localStorage.setItem('zinuel-compact-mode', String(sys.compactMode));
  }, [sys.compactMode]);

  const saveSection = async (section: SettingsSection, values: Record<string, unknown>) => {
    if (!user) {
      setSettingsError('Please sign in to save settings.');
      return false;
    }

    const token = localStorage.getItem('accessToken');
    if (!token) {
      setSettingsError('Your login session is missing. Please sign in again.');
      return false;
    }

    setIsSaving(section);
    setSettingsError('');

    try {
      const response = await fetch('/api/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ section, values }),
      });

      const data = await response.json().catch(() => null);
      if (response.status === 401 || response.status === 403) {
        setSettingsError('Your session is no longer valid. Please sign in again.');
        return false;
      }

      if (!response.ok) {
        throw new Error(data?.error || 'Unable to save settings');
      }

      return true;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to save settings';
      setSettingsError(message);
      return false;
    } finally {
      setIsSaving(null);
    }
  };

  const showSaved = (section: string) => {
    setSaved(section);
    window.setTimeout(() => setSaved(null), 2500);
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwdError('');
    setPwdSuccess(false);

    if (!passwordForm.current) {
      setPwdError('Current password is required');
      return;
    }
    if (passwordForm.next.length < 8) {
      setPwdError('New password must be at least 8 characters');
      return;
    }
    if (passwordForm.next !== passwordForm.confirm) {
      setPwdError('Passwords do not match');
      return;
    }

    const token = localStorage.getItem('accessToken');
    if (!token) {
      setPwdError('Your session is no longer active. Please sign in again.');
      return;
    }

    try {
      const response = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          currentPassword: passwordForm.current,
          newPassword: passwordForm.next,
        }),
      });

      const data = await response.json().catch(() => null);
      if (!response.ok) {
        throw new Error(data?.error || 'Unable to change password');
      }

      setPwdSuccess(true);
      setPasswordForm({ current: '', next: '', confirm: '' });
      window.setTimeout(() => setPwdSuccess(false), 3000);
    } catch (error) {
      setPwdError(error instanceof Error ? error.message : 'Unable to change password');
    }
  };

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  const [tab, setTab] = useState<'appearance' | 'hotel' | 'operations' | 'notifications' | 'security' | 'system'>('appearance');

  const TABS = [
    { id: 'appearance', label: 'Appearance', icon: Palette },
    { id: 'hotel', label: 'Hotel Profile', icon: Hotel },
    { id: 'operations', label: 'Operations', icon: Clock },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'system', label: 'System', icon: Globe },
  ] as const;

  return (
    <div className="w-full max-w-5xl space-y-5 sm:space-y-6">
      <div>
        <h1 className="text-xl font-bold text-foreground sm:text-2xl">Settings</h1>
        <p className="text-sm text-muted-foreground mt-1">Manage system preferences and hotel configuration</p>
      </div>

      <div className="flex min-w-0 flex-col gap-5 md:flex-row md:gap-6">
        <nav aria-label="Settings sections" className="grid w-full grid-cols-2 gap-2 rounded-2xl border border-border bg-card p-3 md:block md:w-52 md:shrink-0 md:space-y-1 md:rounded-none md:border-0 md:bg-transparent md:p-0">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={`min-h-11 w-full flex items-center gap-2.5 px-3 py-3 rounded-xl text-left text-xs font-medium transition-colors sm:gap-3 sm:px-3.5 sm:text-sm md:py-2.5 ${
                tab === id
                  ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20'
                  : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
              }`}
            >
              <Icon size={15} />
              {label}
            </button>
          ))}

          <div className="col-span-2 mt-1 border-t border-border pt-3 md:mt-4 md:pt-4">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium text-red-400 hover:bg-red-500/10 transition-all"
            >
              <LogOut size={15} />
              Sign Out
            </button>
          </div>
        </nav>

        <div className="min-w-0 flex-1 space-y-5">
          {settingsError && (
            <div className="rounded-xl border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
              {settingsError}
            </div>
          )}

          {tab === 'appearance' && (
            <>
              <Card>
                <SectionHeader icon={Palette} title="Appearance" description="Customise how the interface looks and feels" />
                <div className="grid grid-cols-2 gap-3 mb-6">
                  {(['dark', 'light'] as const).map((t) => (
                    <button
                      key={t}
                      onClick={() => {
                        if (theme !== t) {
                          setTheme(t);
                        }
                      }}
                      className={`relative flex flex-col items-center gap-3 p-5 rounded-2xl border-2 transition-all ${
                        theme === t
                          ? 'border-primary bg-primary/10 shadow-lg shadow-primary/20'
                          : 'border-border hover:border-primary/40 bg-secondary/40'
                      }`}
                    >
                      {theme === t && (
                        <span className="absolute top-2.5 right-2.5 w-2 h-2 rounded-full bg-primary" />
                      )}
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                        t === 'dark' ? 'bg-[#0a0e27] border border-[#242839]' : 'bg-white border border-[#dce0f0]'
                      }`}>
                        {t === 'dark' ? (
                          <Moon size={20} className="text-[#d4a574]" />
                        ) : (
                          <Sun size={20} className="text-[#b8793a]" />
                        )}
                      </div>
                      <div className="text-center">
                        <p className={`text-sm font-semibold ${theme === t ? 'text-primary' : 'text-foreground'}`}>
                          {t === 'dark' ? 'Dark Mode' : 'Light Mode'}
                        </p>
                        <p className="text-[11px] text-muted-foreground mt-0.5">
                          {t === 'dark' ? 'Deep navy theme' : 'Clean bright theme'}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>

                <Row label="Compact Mode" description="Reduce padding and spacing throughout the interface">
                  <Toggle checked={sys.compactMode} onChange={(v) => setSys((p) => ({ ...p, compactMode: v }))} />
                </Row>
              </Card>

              <Card>
                <SectionHeader icon={Palette} title="Accent Colour" description="Choose the brand colour used across the interface" />
                <div className="flex items-center gap-3 flex-wrap">
                  {[
                    { label: 'Gold', value: '#d4a574' },
                    { label: 'Sapphire', value: '#3b82f6' },
                    { label: 'Emerald', value: '#10b981' },
                    { label: 'Rose', value: '#f43f5e' },
                    { label: 'Violet', value: '#8b5cf6' },
                    { label: 'Slate', value: '#64748b' },
                  ].map(({ label, value }) => (
                    <button
                      key={value}
                      type="button"
                      title={label}
                      aria-label={`Set accent color to ${label}`}
                      aria-pressed={accentColor === value}
                      onClick={() => setAccentColor(value)}
                      className={`w-8 h-8 rounded-xl border-2 transition-all ${
                        accentColor === value ? 'border-white scale-110 shadow-md shadow-primary/30' : 'border-transparent hover:scale-105'
                      }`}
                      style={{ backgroundColor: value }}
                    />
                  ))}
                  <span className="text-xs text-muted-foreground ml-1">(applies instantly)</span>
                </div>
              </Card>
            </>
          )}

          {tab === 'hotel' && (
            <Card>
              <SectionHeader icon={Hotel} title="Hotel Profile" description="Basic information about your property" />
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {[
                  { label: 'Hotel Name', key: 'name', placeholder: 'e.g. Grand Zinuel Hotel' },
                  { label: 'Tax ID / RC', key: 'taxId', placeholder: 'e.g. RC-1234567' },
                  { label: 'Phone Number', key: 'phone', placeholder: '+234 800 000 0000' },
                  { label: 'Contact Email', key: 'email', placeholder: 'info@hotel.com' },
                  { label: 'Website', key: 'website', placeholder: 'https://...' },
                  { label: 'Address', key: 'address', placeholder: 'Street address' },
                  { label: 'City', key: 'city', placeholder: 'e.g. Victoria Island' },
                  { label: 'State', key: 'state', placeholder: 'e.g. Lagos' },
                ].map(({ label, key, placeholder }) => (
                  <div key={key}>
                    <label className="block text-xs font-semibold text-muted-foreground mb-1.5">{label}</label>
                    <input
                      type="text"
                      value={(hotel as any)[key]}
                      onChange={(e) => setHotel((p) => ({ ...p, [key]: e.target.value }))}
                      placeholder={placeholder}
                      disabled={!isAdmin}
                      className={inputCls()}
                    />
                  </div>
                ))}
              </div>
              {!isAdmin && (
                <p className="flex items-center gap-2 text-xs text-amber-400 mt-4">
                  <AlertTriangle size={12} />
                  Only administrators can edit hotel profile information.
                </p>
              )}
              {isAdmin && (
                <button
                  onClick={async () => {
                    const ok = await saveSection('hotel', hotel);
                    if (ok) {
                      showSaved('hotel');
                    }
                  }}
                  disabled={isSaving === 'hotel'}
                  className="mt-5 flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground text-sm font-semibold rounded-xl hover:shadow-lg hover:shadow-primary/30 transition-all disabled:opacity-60"
                >
                  {saved === 'hotel' ? <CheckCircle2 size={15} /> : <Save size={15} />}
                  {isSaving === 'hotel' ? 'Saving...' : saved === 'hotel' ? 'Saved!' : 'Save Changes'}
                </button>
              )}
            </Card>
          )}

          {tab === 'operations' && (
            <Card>
              <SectionHeader icon={Clock} title="Operational Settings" description="Configure check-in/out times, fees, and policies" />
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground mb-1.5">Default Check-in Time</label>
                  <input type="time" value={ops.checkInTime} onChange={(e) => setOps((p) => ({ ...p, checkInTime: e.target.value }))} disabled={!isAdmin} className={inputCls()} />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground mb-1.5">Default Check-out Time</label>
                  <input type="time" value={ops.checkOutTime} onChange={(e) => setOps((p) => ({ ...p, checkOutTime: e.target.value }))} disabled={!isAdmin} className={inputCls()} />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground mb-1.5">Tax Rate (%)</label>
                  <div className="relative">
                    <input type="number" value={ops.taxRate} onChange={(e) => setOps((p) => ({ ...p, taxRate: e.target.value }))} disabled={!isAdmin} className={`${inputCls()} pr-8`} min="0" max="30" step="0.5" />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none">%</span>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground mb-1.5">Service Charge (%)</label>
                  <div className="relative">
                    <input type="number" value={ops.serviceCharge} onChange={(e) => setOps((p) => ({ ...p, serviceCharge: e.target.value }))} disabled={!isAdmin} className={`${inputCls()} pr-8`} min="0" max="20" step="0.5" />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none">%</span>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground mb-1.5">Late Checkout Fee (₦)</label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-primary font-bold pointer-events-none">₦</span>
                    <input type="number" value={ops.lateCheckoutFee} onChange={(e) => setOps((p) => ({ ...p, lateCheckoutFee: e.target.value }))} disabled={!isAdmin} className={`${inputCls()} pl-8`} min="0" step="500" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground mb-1.5">Early Check-in Fee (₦)</label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-primary font-bold pointer-events-none">₦</span>
                    <input type="number" value={ops.earlyCheckinFee} onChange={(e) => setOps((p) => ({ ...p, earlyCheckinFee: e.target.value }))} disabled={!isAdmin} className={`${inputCls()} pl-8`} min="0" step="500" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground mb-1.5">Free Cancellation Window (hours)</label>
                  <input type="number" value={ops.cancellationHours} onChange={(e) => setOps((p) => ({ ...p, cancellationHours: e.target.value }))} disabled={!isAdmin} className={inputCls()} min="0" max="168" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground mb-1.5">Max Overbooking Buffer (rooms)</label>
                  <input type="number" value={ops.maxOccupancyBuffer} onChange={(e) => setOps((p) => ({ ...p, maxOccupancyBuffer: e.target.value }))} disabled={!isAdmin} className={inputCls()} min="0" max="10" />
                </div>
              </div>
              {!isAdmin && (
                <p className="flex items-center gap-2 text-xs text-amber-400 mt-4">
                  <AlertTriangle size={12} /> Only administrators can modify operational settings.
                </p>
              )}
              {isAdmin && (
                <button onClick={async () => { const ok = await saveSection('operations', ops); if (ok) showSaved('ops'); }} disabled={isSaving === 'operations'} className="mt-5 flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground text-sm font-semibold rounded-xl hover:shadow-lg hover:shadow-primary/30 transition-all disabled:opacity-60">
                  {saved === 'ops' ? <CheckCircle2 size={15} /> : <Save size={15} />}
                  {isSaving === 'operations' ? 'Saving...' : saved === 'ops' ? 'Saved!' : 'Save Changes'}
                </button>
              )}
            </Card>
          )}

          {tab === 'notifications' && (
            <>
              <Card>
                <SectionHeader icon={Bell} title="Event Alerts" description="Choose which events trigger notifications" />
                {[
                  { key: 'newReservation', label: 'New Reservation', desc: 'Alert when a new booking is created' },
                  { key: 'checkinReminder', label: 'Check-in Reminder', desc: 'Reminder 2 hours before expected arrival' },
                  { key: 'checkoutReminder', label: 'Check-out Reminder', desc: 'Alert when a guest is approaching check-out time' },
                  { key: 'overduePayment', label: 'Overdue Payment', desc: 'Notify when an invoice is past due date' },
                  { key: 'maintenanceAlert', label: 'Maintenance Requests', desc: 'Alert when a room is flagged for maintenance' },
                  { key: 'lowOccupancy', label: 'Low Occupancy Warning', desc: 'Alert when hotel occupancy drops below 40%' },
                  { key: 'staffMessages', label: 'Staff Messages', desc: 'Internal messages from staff members' },
                ].map(({ key, label, desc }) => (
                  <Row key={key} label={label} description={desc}>
                    <Toggle checked={Boolean((notif as any)[key])} onChange={(v) => setNotif((p) => ({ ...p, [key]: v }))} />
                  </Row>
                ))}
              </Card>

              <Card>
                <SectionHeader icon={Smartphone} title="Delivery Channels" description="How you receive notifications" />
                <Row label="In-app Notifications" description="Bell icon in the dashboard header">
                  <Toggle checked={true} onChange={() => {}} disabled />
                </Row>
                <Row label="Email Alerts" description="Send alerts to your registered email address">
                  <Toggle checked={notif.emailAlerts} onChange={(v) => setNotif((p) => ({ ...p, emailAlerts: v }))} />
                </Row>
                <Row label="SMS Alerts" description="Receive critical alerts via SMS (carrier charges may apply)">
                  <Toggle checked={notif.smsAlerts} onChange={(v) => setNotif((p) => ({ ...p, smsAlerts: v }))} />
                </Row>
                <button onClick={async () => { const ok = await saveSection('notifications', notif); if (ok) showSaved('notif'); }} disabled={isSaving === 'notifications'} className="mt-4 flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground text-sm font-semibold rounded-xl hover:shadow-lg hover:shadow-primary/30 transition-all disabled:opacity-60">
                  {saved === 'notif' ? <CheckCircle2 size={15} /> : <Save size={15} />}
                  {isSaving === 'notifications' ? 'Saving...' : saved === 'notif' ? 'Saved!' : 'Save Preferences'}
                </button>
              </Card>
            </>
          )}

          {tab === 'security' && (
            <>
              <Card>
                <SectionHeader icon={Shield} title="Access & Session" description="Control authentication and session behaviour" />
                <Row label="Session Timeout" description="Automatically sign out after inactivity (minutes)">
                  <select
                    value={security.sessionTimeout}
                    onChange={(e) => setSecurity((p) => ({ ...p, sessionTimeout: e.target.value }))}
                    className="px-3 py-1.5 bg-secondary border border-border rounded-xl text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                    disabled={!isAdmin}
                  >
                    {['15', '30', '60', '120', '240', 'never'].map((v) => (
                      <option key={v} value={v}>{v === 'never' ? 'Never' : `${v} min`}</option>
                    ))}
                  </select>
                </Row>
                <Row label="Two-Factor Authentication" description="Require 2FA for admin-level actions">
                  <Toggle checked={security.require2FA} onChange={(v) => setSecurity((p) => ({ ...p, require2FA: v }))} disabled={!isAdmin} />
                </Row>
                <Row label="Login Notifications" description="Send email when account is accessed from a new device">
                  <Toggle checked={security.loginNotifications} onChange={(v) => setSecurity((p) => ({ ...p, loginNotifications: v }))} disabled={!isAdmin} />
                </Row>
                <Row label="IP Whitelist" description="Restrict access to approved IP addresses only (enterprise)">
                  <Toggle checked={security.ipWhitelist} onChange={(v) => setSecurity((p) => ({ ...p, ipWhitelist: v }))} disabled={!isAdmin} />
                </Row>
                <button onClick={async () => { const ok = await saveSection('security', security); if (ok) showSaved('security'); }} disabled={isSaving === 'security' || !isAdmin} className="mt-4 flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground text-sm font-semibold rounded-xl hover:shadow-lg hover:shadow-primary/30 transition-all disabled:opacity-60">
                  {saved === 'security' ? <CheckCircle2 size={15} /> : <Save size={15} />}
                  {isSaving === 'security' ? 'Saving...' : saved === 'security' ? 'Saved!' : 'Save Settings'}
                </button>
              </Card>

              <Card>
                <SectionHeader icon={Lock} title="Change Password" description="Update your account password" />
                <form onSubmit={handlePasswordChange} className="space-y-4">
                  {[
                    { label: 'Current Password', key: 'current' },
                    { label: 'New Password', key: 'next' },
                    { label: 'Confirm Password', key: 'confirm' },
                  ].map(({ label, key }) => (
                    <div key={key}>
                      <label className="block text-xs font-semibold text-muted-foreground mb-1.5">{label}</label>
                      <div className="relative">
                        <input
                          type={showPwd ? 'text' : 'password'}
                          value={(passwordForm as any)[key]}
                          onChange={(e) => setPasswordForm((p) => ({ ...p, [key]: e.target.value }))}
                          className={`${inputCls()} pr-10`}
                          placeholder="••••••••"
                          autoComplete={key === 'current' ? 'current-password' : 'new-password'}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPwd((v) => !v)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                        >
                          {showPwd ? <EyeOff size={15} /> : <Eye size={15} />}
                        </button>
                      </div>
                    </div>
                  ))}
                  {pwdError && (
                    <p className="flex items-center gap-1.5 text-xs text-red-400">
                      <AlertTriangle size={12} />{pwdError}
                    </p>
                  )}
                  {pwdSuccess && (
                    <p className="flex items-center gap-1.5 text-xs text-emerald-400">
                      <CheckCircle2 size={12} />Password changed successfully
                    </p>
                  )}
                  <button type="submit" className="flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground text-sm font-semibold rounded-xl hover:shadow-lg hover:shadow-primary/30 transition-all">
                    <Lock size={14} />
                    Update Password
                  </button>
                </form>
              </Card>

              <Card className="border-red-500/20 bg-red-500/3">
                <div className="flex items-center gap-2 mb-4">
                  <AlertTriangle size={16} className="text-red-400" />
                  <h3 className="text-sm font-bold text-red-400">Danger Zone</h3>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-foreground">Sign Out</p>
                    <p className="text-xs text-muted-foreground mt-0.5">End your current session on all devices</p>
                  </div>
                  <button onClick={handleLogout} className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-red-400 border border-red-500/30 rounded-xl hover:bg-red-500/10 transition-all">
                    <LogOut size={14} />
                    Sign Out
                  </button>
                </div>
              </Card>
            </>
          )}

          {tab === 'system' && (
            <>
              <Card>
                <SectionHeader icon={Globe} title="Regional Settings" description="Timezone, language and date preferences" />
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-xs font-semibold text-muted-foreground mb-1.5">Timezone</label>
                    <select value={sys.timezone} onChange={(e) => setSys((p) => ({ ...p, timezone: e.target.value }))} disabled={!isAdmin} className={inputCls()}>
                      <option value="Africa/Lagos">Africa/Lagos (WAT, UTC+1)</option>
                      <option value="Africa/Abuja">Africa/Abuja (WAT, UTC+1)</option>
                      <option value="UTC">UTC</option>
                      <option value="Europe/London">Europe/London (GMT/BST)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-muted-foreground mb-1.5">Date Format</label>
                    <select value={sys.dateFormat} onChange={(e) => setSys((p) => ({ ...p, dateFormat: e.target.value }))} disabled={!isAdmin} className={inputCls()}>
                      <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                      <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                      <option value="YYYY/MM/DD">YYYY/MM/DD</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-muted-foreground mb-1.5">Language</label>
                    <select value={sys.language} onChange={(e) => setSys((p) => ({ ...p, language: e.target.value }))} disabled={!isAdmin} className={inputCls()}>
                      <option value="en-NG">English (Nigeria)</option>
                      <option value="en-US">English (US)</option>
                      <option value="fr-FR">Français</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-muted-foreground mb-1.5">Currency</label>
                    <select value={sys.currency} onChange={(e) => setSys((p) => ({ ...p, currency: e.target.value }))} disabled={!isAdmin} className={inputCls()}>
                      <option value="NGN">Nigerian Naira (₦)</option>
                      <option value="USD">US Dollar ($)</option>
                      <option value="GBP">Pound Sterling (£)</option>
                    </select>
                  </div>
                </div>
              </Card>

              <Card>
                <SectionHeader icon={Clock} title="Backup & Data" description="Automated data backup settings" />
                <Row label="Automatic Backup" description="Create daily backups of hotel records and reports">
                  <Toggle checked={sys.autoBackup} onChange={(v) => setSys((p) => ({ ...p, autoBackup: v }))} disabled={!isAdmin} />
                </Row>
                <Row label="Backup Frequency" description="How often data should be backed up">
                  <select value={sys.backupFrequency} onChange={(e) => setSys((p) => ({ ...p, backupFrequency: e.target.value }))} disabled={!isAdmin} className="px-3 py-1.5 bg-secondary border border-border rounded-xl text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50">
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                  </select>
                </Row>
                <button onClick={async () => { const ok = await saveSection('system', sys); if (ok) showSaved('system'); }} disabled={isSaving === 'system'} className="mt-4 flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground text-sm font-semibold rounded-xl hover:shadow-lg hover:shadow-primary/30 transition-all disabled:opacity-60">
                  {saved === 'system' ? <CheckCircle2 size={15} /> : <Save size={15} />}
                  {isSaving === 'system' ? 'Saving...' : saved === 'system' ? 'Saved!' : 'Save Settings'}
                </button>
              </Card>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
