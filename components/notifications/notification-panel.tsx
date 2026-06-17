'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Bell, X, CheckCheck, CheckCircle2, AlertTriangle, Info, XCircle, Trash2,
} from 'lucide-react';
import { useNotifications, AppNotification, NotifType } from '@/lib/notification-context';

const TYPE_CONFIG: Record<NotifType, { Icon: React.ElementType; iconCls: string; dot: string; bg: string }> = {
  success: { Icon: CheckCircle2, iconCls: 'text-emerald-400', dot: 'bg-emerald-400', bg: 'bg-emerald-500/8' },
  warning: { Icon: AlertTriangle, iconCls: 'text-amber-400', dot: 'bg-amber-400', bg: 'bg-amber-500/8' },
  error:   { Icon: XCircle,      iconCls: 'text-red-400',    dot: 'bg-red-400',    bg: 'bg-red-500/8' },
  info:    { Icon: Info,          iconCls: 'text-blue-400',   dot: 'bg-blue-400',   bg: 'bg-blue-500/8' },
};

function timeAgo(iso: string): string {
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

function NotifRow({ n, onRead, onDismiss }: { n: AppNotification; onRead: () => void; onDismiss: () => void }) {
  const router = useRouter();
  const cfg = TYPE_CONFIG[n.type] ?? TYPE_CONFIG.info;

  return (
    <div
      className={`relative flex gap-3 px-4 py-3.5 hover:bg-secondary/40 transition-colors cursor-pointer group border-b border-border/40 last:border-0 ${
        !n.read ? cfg.bg : ''
      }`}
      onClick={() => {
        onRead();
        if (n.link) router.push(n.link);
      }}
    >
      {/* Unread dot */}
      {!n.read && (
        <span className={`absolute left-1.5 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      )}

      <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5 border ${
        !n.read ? 'border-current/20 bg-current/10' : 'border-border bg-secondary'
      }`} style={{ color: cfg.iconCls.replace('text-', '') }}>
        <cfg.Icon size={15} className={cfg.iconCls} />
      </div>

      <div className="flex-1 min-w-0">
        <p className={`text-sm font-semibold truncate ${n.read ? 'text-muted-foreground' : 'text-foreground'}`}>
          {n.title}
        </p>
        <p className="text-xs text-muted-foreground leading-relaxed mt-0.5 line-clamp-2">{n.message}</p>
        <p className="text-[10px] text-muted-foreground/60 mt-1">{timeAgo(n.timestamp)}</p>
      </div>

      <button
        onClick={(e) => { e.stopPropagation(); onDismiss(); }}
        className="opacity-0 group-hover:opacity-100 p-1 text-muted-foreground hover:text-foreground transition-all shrink-0 mt-0.5"
      >
        <X size={13} />
      </button>
    </div>
  );
}

export default function NotificationPanel() {
  const { notifications, unreadCount, markAsRead, markAllAsRead, dismiss } = useNotifications();
  const [open, setOpen] = useState(false);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const panelRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const visible = filter === 'unread' ? notifications.filter((n) => !n.read) : notifications;

  return (
    <div className="relative" ref={panelRef}>
      {/* Bell Button */}
      <button
        onClick={() => setOpen((v) => !v)}
        className={`relative w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-200 ${
          open ? 'bg-primary/20 text-primary' : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
        }`}
      >
        <Bell size={16} />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-0.5 bg-red-500 border-2 border-card rounded-full flex items-center justify-center text-[9px] font-bold text-white">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Panel */}
      {open && (
        <div className="absolute right-0 top-full mt-2 w-96 bg-card border border-border rounded-2xl shadow-2xl shadow-black/40 z-50 flex flex-col overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3.5 border-b border-border shrink-0">
            <div className="flex items-center gap-2.5">
              <Bell size={15} className="text-primary" />
              <h3 className="text-sm font-bold text-foreground">Notifications</h3>
              {unreadCount > 0 && (
                <span className="text-[10px] font-bold bg-red-500/15 border border-red-500/25 text-red-400 px-1.5 py-0.5 rounded-full">
                  {unreadCount} new
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="flex items-center gap-1 text-[11px] text-primary hover:text-accent transition-colors font-medium"
                >
                  <CheckCheck size={12} /> Mark all read
                </button>
              )}
              <button onClick={() => setOpen(false)} className="p-1 text-muted-foreground hover:text-foreground">
                <X size={14} />
              </button>
            </div>
          </div>

          {/* Filter tabs */}
          <div className="flex border-b border-border shrink-0">
            {(['all', 'unread'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`flex-1 py-2 text-xs font-semibold transition-colors capitalize ${
                  filter === f ? 'text-primary border-b-2 border-primary' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {f} {f === 'unread' && unreadCount > 0 ? `(${unreadCount})` : ''}
              </button>
            ))}
          </div>

          {/* List */}
          <div className="overflow-y-auto max-h-[400px]">
            {visible.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                <Bell size={30} className="mb-3 opacity-20" />
                <p className="text-sm font-medium">
                  {filter === 'unread' ? 'All caught up!' : 'No notifications'}
                </p>
                <p className="text-xs mt-1 opacity-60">Check back later</p>
              </div>
            ) : (
              visible.map((n) => (
                <NotifRow
                  key={n.id}
                  n={n}
                  onRead={() => markAsRead(n.id)}
                  onDismiss={() => dismiss(n.id)}
                />
              ))
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="border-t border-border px-4 py-2.5 shrink-0 flex items-center justify-between">
              <p className="text-xs text-muted-foreground">{notifications.length} total notifications</p>
              <button
                onClick={() => { notifications.forEach((n) => dismiss(n.id)); }}
                className="flex items-center gap-1 text-xs text-muted-foreground hover:text-red-400 transition-colors"
              >
                <Trash2 size={11} /> Clear all
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
