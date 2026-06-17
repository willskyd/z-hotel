'use client';

import { useState } from 'react';
import {
  Sun, Moon, Palette, Hotel, Clock, Percent, Bell, BellOff,
  Shield, Lock, Globe, Calendar, RefreshCw, LogOut, Save,
  ChevronRight, AlertTriangle, CheckCircle2, Smartphone, Mail,
  CreditCard, Users, Zap, Eye, EyeOff,
} from 'lucide-react';
import { useTheme } from '@/lib/theme-context';
import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';

/* ─────────────────── helpers ─────────────────── */

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
    <div className={`bg-card border border-border rounded-2xl p-6 ${className}`}>{children}</div>
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
    <div className="flex items-center justify-between py-3.5 border-b border-border last:border-0">
      <div className="flex-1 pr-4">
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

/* ─────────────────── page ─────────────────── */

export default function SettingsPage() {
  const { theme, toggleTheme, isDark } = useTheme();
  const { user, logout } = useAuth();
  const router = useRouter();
  const isAdmin = user?.role === 'admin';

  /* Hotel profile */
  const [hotel, setHotel] = useState({
    name: 'Zinuel-ch Hotel',
    address: '14 Adeola Odeku Street',
    city: 'Victoria Island',
    state: 'Lagos',
    phone: '+234 801 234 5678',
    email: 'info@zinuelch.com',
    website: 'https://zinuelch.com',
    taxId: 'RC-1234567',
  });

  /* Operations */
  const [ops, setOps] = useState({
    checkInTime: '14:00',
    checkOutTime: '12:00',
    taxRate: '7.5',
    serviceCharge: '5',
    lateCheckoutFee: '15000',
    earlyCheckinFee: '10000',
    cancellationHours: '24',
    maxOccupancyBuffer: '2',
  });

  /* Notifications */
  const [notif, setNotif] = useState({
    newReservation: true,
    checkinReminder: true,
    checkoutReminder: true,
    overduePayment: true,
    maintenanceAlert: false,
    lowOccupancy: true,
    staffMessages: true,
    emailAlerts: true,
    smsAlerts: false,
  });

  /* Security */
  const [security, setSecurity] = useState({
    sessionTimeout: '60',
    require2FA: false,
    loginNotifications: true,
    ipWhitelist: false,
  });
  const [passwordForm, setPasswordForm] = useState({ current: '', next: '', confirm: '' });
  const [showPwd, setShowPwd] = useState(false);
  const [pwdError, setPwdError] = useState('');
  const [pwdSuccess, setPwdSuccess] = useState(false);

  /* System */
  const [sys, setSys] = useState({
    timezone: 'Africa/Lagos',
    dateFormat: 'DD/MM/YYYY',
    language: 'en-NG',
    currency: 'NGN',
    compactMode: false,
    autoBackup: true,
    backupFrequency: 'daily',
  });

  const [saved, setSaved] = useState<string | null>(null);

  const showSaved = (section: string) => {
    setSaved(section);
    setTimeout(() => setSaved(null), 2500);
  };

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    setPwdError('');
    if (!passwordForm.current) return setPwdError('Current password is required');
    if (passwordForm.next.length < 8) return setPwdError('New password must be at least 8 characters');
    if (passwordForm.next !== passwordForm.confirm) return setPwdError('Passwords do not match');
    setPwdSuccess(true);
    setPasswordForm({ current: '', next: '', confirm: '' });
    setTimeout(() => setPwdSuccess(false), 3000);
  };

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  /* ─── nav tabs ─── */
  const [tab, setTab] = useState<'appearance' | 'hotel' | 'operations' | 'notifications' | 'security' | 'system'>('appearance');

  const TABS = [
    { id: 'appearance',    label: 'Appearance',    icon: Palette   },
    { id: 'hotel',         label: 'Hotel Profile', icon: Hotel     },
    { id: 'operations',    label: 'Operations',    icon: Clock     },
    { id: 'notifications', label: 'Notifications', icon: Bell      },
    { id: 'security',      label: 'Security',      icon: Shield    },
    { id: 'system',        label: 'System',        icon: Globe     },
  ] as const;

  return (
    <div className="max-w-5xl space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Settings</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Manage system preferences and hotel configuration</p>
      </div>

      <div className="flex gap-6">
        {/* Sidebar nav */}
        <nav className="w-52 shrink-0 space-y-1">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                tab === id
                  ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20'
                  : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
              }`}
            >
              <Icon size={15} />
              {label}
            </button>
          ))}

          {/* Logout at bottom */}
          <div className="pt-4 border-t border-border mt-4">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium text-red-400 hover:bg-red-500/10 transition-all"
            >
              <LogOut size={15} />
              Sign Out
            </button>
          </div>
        </nav>

        {/* Content */}
        <div className="flex-1 space-y-5">

          {/* ─── APPEARANCE ─── */}
          {tab === 'appearance' && (
            <>
              <Card>
                <SectionHeader icon={Palette} title="Appearance" description="Customise how the interface looks and feels" />

                {/* Theme toggle */}
                <div className="grid grid-cols-2 gap-3 mb-6">
                  {(['dark', 'light'] as const).map((t) => (
                    <button
                      key={t}
                      onClick={() => { if (theme !== t) toggleTheme(); }}
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
                    { label: 'Gold',     value: '#d4a574' },
                    { label: 'Sapphire', value: '#3b82f6' },
                    { label: 'Emerald',  value: '#10b981' },
                    { label: 'Rose',     value: '#f43f5e' },
                    { label: 'Violet',   value: '#8b5cf6' },
                    { label: 'Slate',    value: '#64748b' },
                  ].map(({ label, value }) => (
                    <button
                      key={value}
                      title={label}
                      className={`w-8 h-8 rounded-xl border-2 transition-all ${
                        value === '#d4a574' ? 'border-white scale-110' : 'border-transparent hover:scale-105'
                      }`}
                      style={{ backgroundColor: value }}
                    />
                  ))}
                  <span className="text-xs text-muted-foreground ml-1">(requires rebuild to apply)</span>
                </div>
              </Card>
            </>
          )}

          {/* ─── HOTEL PROFILE ─── */}
          {tab === 'hotel' && (
            <Card>
              <SectionHeader icon={Hotel} title="Hotel Profile" description="Basic information about your property" />
              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: 'Hotel Name',    key: 'name',    placeholder: 'e.g. Grand Zinuel Hotel'   },
                  { label: 'Tax ID / RC',   key: 'taxId',   placeholder: 'e.g. RC-1234567'          },
                  { label: 'Phone Number',  key: 'phone',   placeholder: '+234 800 000 0000'         },
                  { label: 'Contact Email', key: 'email',   placeholder: 'info@hotel.com'            },
                  { label: 'Website',       key: 'website', placeholder: 'https://...'               },
                  { label: 'Address',       key: 'address', placeholder: 'Street address'            },
                  { label: 'City',          key: 'city',    placeholder: 'e.g. Victoria Island'      },
                  { label: 'State',         key: 'state',   placeholder: 'e.g. Lagos'                },
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
                  onClick={() => showSaved('hotel')}
                  className="mt-5 flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground text-sm font-semibold rounded-xl hover:shadow-lg hover:shadow-primary/30 transition-all"
                >
                  {saved === 'hotel' ? <CheckCircle2 size={15} /> : <Save size={15} />}
                  {saved === 'hotel' ? 'Saved!' : 'Save Changes'}
                </button>
              )}
            </Card>
          )}

          {/* ─── OPERATIONS ─── */}
          {tab === 'operations' && (
            <Card>
              <SectionHeader icon={Clock} title="Operational Settings" description="Configure check-in/out times, fees, and policies" />
              <div className="grid grid-cols-2 gap-4">
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
                    <Percent size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground mb-1.5">Service Charge (%)</label>
                  <div className="relative">
                    <input type="number" value={ops.serviceCharge} onChange={(e) => setOps((p) => ({ ...p, serviceCharge: e.target.value }))} disabled={!isAdmin} className={`${inputCls()} pr-8`} min="0" max="20" step="0.5" />
                    <Percent size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
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
                <button onClick={() => showSaved('ops')} className="mt-5 flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground text-sm font-semibold rounded-xl hover:shadow-lg hover:shadow-primary/30 transition-all">
                  {saved === 'ops' ? <CheckCircle2 size={15} /> : <Save size={15} />}
                  {saved === 'ops' ? 'Saved!' : 'Save Changes'}
                </button>
              )}
            </Card>
          )}

          {/* ─── NOTIFICATIONS ─── */}
          {tab === 'notifications' && (
            <>
              <Card>
                <SectionHeader icon={Bell} title="Event Alerts" description="Choose which events trigger notifications" />
                {[
                  { key: 'newReservation',    label: 'New Reservation',      desc: 'Alert when a new booking is created' },
                  { key: 'checkinReminder',   label: 'Check-in Reminder',    desc: 'Reminder 2 hours before expected arrival' },
                  { key: 'checkoutReminder',  label: 'Check-out Reminder',   desc: 'Alert when a guest is approaching check-out time' },
                  { key: 'overduePayment',    label: 'Overdue Payment',      desc: 'Notify when an invoice is past due date' },
                  { key: 'maintenanceAlert',  label: 'Maintenance Requests', desc: 'Alert when a room is flagged for maintenance' },
                  { key: 'lowOccupancy',      label: 'Low Occupancy Warning', desc: 'Alert when hotel occupancy drops below 40%' },
                  { key: 'staffMessages',     label: 'Staff Messages',       desc: 'Internal messages from staff members' },
                ].map(({ key, label, desc }) => (
                  <Row key={key} label={label} description={desc}>
                    <Toggle
                      checked={(notif as any)[key]}
                      onChange={(v) => setNotif((p) => ({ ...p, [key]: v }))}
                    />
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
                <button onClick={() => showSaved('notif')} className="mt-4 flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground text-sm font-semibold rounded-xl hover:shadow-lg hover:shadow-primary/30 transition-all">
                  {saved === 'notif' ? <CheckCircle2 size={15} /> : <Save size={15} />}
                  {saved === 'notif' ? 'Saved!' : 'Save Preferences'}
                </button>
              </Card>
            </>
          )}

          {/* ─── SECURITY ─── */}
          {tab === 'security' && (
            <>
              <Card>
                <SectionHeader icon={Shield} title="Access & Session" description="Control authentication and session behaviour" />
                <Row label="Session Timeout" description="Automatically sign out after inactivity (minutes)">
                  <select
                    value={security.sessionTimeout}
                    onChange={(e) => setSecurity((p) => ({ ...p, sessionTimeout: e.target.value }))}
                    className="px-3 py-1.5 bg-secondary border border-border rounded-xl text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                  >
                    {['15', '30', '60', '120', '240', 'never'].map((v) => (
                      <option key={v} value={v}>{v === 'never' ? 'Never' : `${v} min`}</option>
                    ))}
                  </select>
                </Row>
                <Row label="Two-Factor Authentication" description="Require 2FA for admin-level actions">
                  <Toggle checked={security.require2FA} onChange={(v) => setSecurity((p) => ({ ...p, require2FA: v }))} />
                </Row>
                <Row label="Login Notifications" description="Send email when account is accessed from a new device">
                  <Toggle checked={security.loginNotifications} onChange={(v) => setSecurity((p) => ({ ...p, loginNotifications: v }))} />
                </Row>
                <Row label="IP Whitelist" description="Restrict access to approved IP addresses only (enterprise)">
                  <Toggle checked={security.ipWhitelist} onChange={(v) => setSecurity((p) => ({ ...p, ipWhitelist: v }))} disabled={!isAdmin} />
                </Row>
                <button onClick={() => showSaved('security')} className="mt-4 flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground text-sm font-semibold rounded-xl hover:shadow-lg hover:shadow-primary/30 transition-all">
                  {saved === 'security' ? <CheckCircle2 size={15} /> : <Save size={15} />}
                  {saved === 'security' ? 'Saved!' : 'Save Settings'}
                </button>
              </Card>

              <Card>
                <SectionHeader icon={Lock} title="Change Password" description="Update your account password" />
                <form onSubmit={handlePasswordChange} className="space-y-4">
                  {[
                    { label: 'Current Password', key: 'current' },
                    { label: 'New Password',      key: 'next' },
                    { label: 'Confirm Password',  key: 'confirm' },
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

              {/* Danger Zone */}
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

          {/* ─── SYSTEM ─── */}
          {tab === 'system' && (
            <>
              <Card>
                <SectionHeader icon={Globe} title="Regional Settings" description="Timezone, language and date preferences" />
                <div className="grid grid-cols-2 gap-4">
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
                    <select value={sys.dateFormat} onChange={(e) => setSys((p) => ({ ...p, dateFormat: e.target.value }))} className={inputCls()}>
                      <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                      <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                      <option value="YYYY-MM-DD">YYYY-MM-DD (ISO)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-muted-foreground mb-1.5">Language</label>
                    <select value={sys.language} onChange={(e) => setSys((p) => ({ ...p, language: e.target.value }))} className={inputCls()}>
                      <option value="en-NG">English (Nigeria)</option>
                      <option value="en-GB">English (UK)</option>
                      <option value="en-US">English (US)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-muted-foreground mb-1.5">Currency</label>
                    <select value={sys.currency} disabled className={inputCls()}>
                      <option value="NGN">Nigerian Naira (₦)</option>
                    </select>
                  </div>
                </div>
              </Card>

              <Card>
                <SectionHeader icon={RefreshCw} title="Backup & Data" description="Automated data backup settings" />
                <Row label="Automatic Backup" description="Automatically back up hotel data to secure storage">
                  <Toggle checked={sys.autoBackup} onChange={(v) => setSys((p) => ({ ...p, autoBackup: v }))} disabled={!isAdmin} />
                </Row>
                <Row label="Backup Frequency" description="How often automated backups run">
                  <select
                    value={sys.backupFrequency}
                    onChange={(e) => setSys((p) => ({ ...p, backupFrequency: e.target.value }))}
                    disabled={!isAdmin || !sys.autoBackup}
                    className="px-3 py-1.5 bg-secondary border border-border rounded-xl text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-40"
                  >
                    <option value="hourly">Every Hour</option>
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                  </select>
                </Row>
                <Row label="Last Backup" description="Most recent successful backup">
                  <span className="text-xs font-medium text-emerald-400 flex items-center gap-1.5">
                    <CheckCircle2 size={12} />
                    Today, 03:00 AM
                  </span>
                </Row>
                <div className="mt-4 flex items-center gap-3">
                  <button
                    onClick={() => showSaved('backup')}
                    disabled={!isAdmin}
                    className="flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground text-sm font-semibold rounded-xl hover:shadow-lg hover:shadow-primary/30 transition-all disabled:opacity-40"
                  >
                    {saved === 'backup' ? <CheckCircle2 size={15} /> : <Save size={15} />}
                    {saved === 'backup' ? 'Saved!' : 'Save Settings'}
                  </button>
                  <button
                    onClick={() => showSaved('manualBackup')}
                    disabled={!isAdmin}
                    className="flex items-center gap-2 px-4 py-2.5 border border-border text-sm font-medium text-foreground rounded-xl hover:bg-secondary transition-all disabled:opacity-40"
                  >
                    {saved === 'manualBackup' ? <CheckCircle2 size={15} className="text-emerald-400" /> : <RefreshCw size={15} />}
                    {saved === 'manualBackup' ? 'Backup Started' : 'Run Manual Backup'}
                  </button>
                </div>
              </Card>

              {/* Account info */}
              <Card>
                <SectionHeader icon={Users} title="Account Details" description="Your current account information" />
                <div className="space-y-3">
                  {[
                    { label: 'Name',  value: user?.fullName ?? '—' },
                    { label: 'Email', value: user?.email ?? '—' },
                    { label: 'Role',  value: (user?.role ?? '—').charAt(0).toUpperCase() + (user?.role ?? '').slice(1) },
                  ].map(({ label, value }) => (
                    <div key={label} className="flex items-center justify-between py-2.5 border-b border-border last:border-0">
                      <span className="text-xs text-muted-foreground">{label}</span>
                      <span className="text-sm font-medium text-foreground">{value}</span>
                    </div>
                  ))}
                </div>
              </Card>
            </>
          )}

        </div>
      </div>
    </div>
  );
}
