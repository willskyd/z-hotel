'use client';

import { createContext, useContext, useState, useCallback } from 'react';

export type NotifType = 'info' | 'success' | 'warning' | 'error';

export interface AppNotification {
  id: string;
  type: NotifType;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  link?: string;
}

interface NotificationContextType {
  notifications: AppNotification[];
  unreadCount: number;
  addNotification: (n: Omit<AppNotification, 'id' | 'timestamp' | 'read'>) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  dismiss: (id: string) => void;
}

const NotificationContext = createContext<NotificationContextType>({
  notifications: [],
  unreadCount: 0,
  addNotification: () => {},
  markAsRead: () => {},
  markAllAsRead: () => {},
  dismiss: () => {},
});

const SEED_NOTIFICATIONS: AppNotification[] = [
  {
    id: 'n1',
    type: 'success',
    title: 'Check-In Completed',
    message: 'Emeka Okafor checked into Room 301 at 14:30.',
    timestamp: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
    read: false,
    link: '/dashboard/front-desk',
  },
  {
    id: 'n2',
    type: 'warning',
    title: 'Overdue Check-Out',
    message: 'Aisha Bello (Room 102) was due to check out at 11:30 — still in room.',
    timestamp: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
    read: false,
    link: '/dashboard/front-desk',
  },
  {
    id: 'n3',
    type: 'info',
    title: 'New Reservation',
    message: 'Reservation RES-2024-007 created for Chidi Nwosu (Room 410, 3 nights).',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    read: false,
    link: '/dashboard/reservations',
  },
  {
    id: 'n4',
    type: 'error',
    title: 'Payment Overdue',
    message: 'Invoice INV-2024-005 for Biodun Fashola is 7 days overdue.',
    timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    read: true,
    link: '/dashboard/billing',
  },
  {
    id: 'n5',
    type: 'info',
    title: 'Room Under Maintenance',
    message: 'Room 302 has been placed under maintenance by Manager Kingsley.',
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    read: true,
    link: '/dashboard/rooms',
  },
];

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<AppNotification[]>(SEED_NOTIFICATIONS);

  const addNotification = useCallback(
    (n: Omit<AppNotification, 'id' | 'timestamp' | 'read'>) => {
      const newNotif: AppNotification = {
        ...n,
        id: `n-${Date.now()}`,
        timestamp: new Date().toISOString(),
        read: false,
      };
      setNotifications((prev) => [newNotif, ...prev]);
    },
    []
  );

  const markAsRead = useCallback((id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }, []);

  const dismiss = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <NotificationContext.Provider
      value={{ notifications, unreadCount, addNotification, markAsRead, markAllAsRead, dismiss }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  return useContext(NotificationContext);
}
