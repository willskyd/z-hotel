import { NextRequest, NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import { extractTokenFromHeader, verifyToken } from '@/lib/auth';
import { describeMongoError, getDatabase } from '@/lib/mongodb';

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

const DEFAULT_OPERATIONS = {
  checkInTime: '14:00',
  checkOutTime: '12:00',
  taxRate: '7.5',
  serviceCharge: '5',
  lateCheckoutFee: '15000',
  earlyCheckinFee: '10000',
  cancellationHours: '24',
  maxOccupancyBuffer: '2',
};

const DEFAULT_NOTIFICATIONS = {
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

const DEFAULT_SYSTEM = {
  timezone: 'Africa/Lagos',
  dateFormat: 'DD/MM/YYYY',
  language: 'en-NG',
  currency: 'NGN',
  compactMode: false,
  autoBackup: true,
  backupFrequency: 'daily',
};

const DEFAULT_SETTINGS = {
  hotel: DEFAULT_HOTEL,
  operations: DEFAULT_OPERATIONS,
  notifications: DEFAULT_NOTIFICATIONS,
  security: DEFAULT_SECURITY,
  system: DEFAULT_SYSTEM,
};

const ADMIN_ONLY_SECTIONS = new Set(['hotel', 'operations', 'security']);

function sanitizeSectionValues(section: string, values: Record<string, unknown>) {
  const defaults = DEFAULT_SETTINGS[section as keyof typeof DEFAULT_SETTINGS];
  if (!defaults || typeof defaults !== 'object') {
    return {};
  }

  return {
    ...(defaults as Record<string, unknown>),
    ...(values && typeof values === 'object' ? values : {}),
  };
}

async function getAuthenticatedUser(request: NextRequest) {
  const token = extractTokenFromHeader(request.headers.get('authorization'));
  if (!token) {
    return null;
  }

  const payload = verifyToken(token);
  if (!payload?.userId || !ObjectId.isValid(payload.userId)) {
    return null;
  }

  const db = await getDatabase();
  const user = await db.collection('users').findOne({
    _id: new ObjectId(payload.userId),
    status: 'active',
  });

  if (!user) {
    return null;
  }

  return { user, payload };
}

export async function GET(request: NextRequest) {
  try {
    const session = await getAuthenticatedUser(request);
    if (!session) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const db = await getDatabase();
    const settingsDoc = await db.collection('settings').findOne({ userId: session.user._id.toString() });
    const settings = settingsDoc?.settings ?? DEFAULT_SETTINGS;

    return NextResponse.json(
      {
        settings: {
          hotel: { ...DEFAULT_HOTEL, ...(settings.hotel ?? {}) },
          operations: { ...DEFAULT_OPERATIONS, ...(settings.operations ?? {}) },
          notifications: { ...DEFAULT_NOTIFICATIONS, ...(settings.notifications ?? {}) },
          security: { ...DEFAULT_SECURITY, ...(settings.security ?? {}) },
          system: { ...DEFAULT_SYSTEM, ...(settings.system ?? {}) },
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('[settings GET] Failed to load settings:', describeMongoError(error));
    return NextResponse.json(
      { error: 'Unable to load settings' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getAuthenticatedUser(request);
    if (!session) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const body = await request.json();
    const section = typeof body.section === 'string' ? body.section : '';
    const values = body.values && typeof body.values === 'object' ? body.values : {};

    if (!section || !(section in DEFAULT_SETTINGS)) {
      return NextResponse.json(
        { error: 'A valid settings section is required' },
        { status: 400 }
      );
    }

    if (ADMIN_ONLY_SECTIONS.has(section) && session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Only administrators can update this setting group' },
        { status: 403 }
      );
    }

    const db = await getDatabase();
    const settingsCollection = db.collection('settings');
    const userId = session.user._id.toString();
    const existing = await settingsCollection.findOne({ userId });

    const nextSettings = {
      ...(existing?.settings ?? DEFAULT_SETTINGS),
    } as Record<string, Record<string, unknown>>;

    nextSettings[section] = sanitizeSectionValues(section, values as Record<string, unknown>);

    await settingsCollection.updateOne(
      { userId },
      {
        $set: {
          userId,
          settings: nextSettings,
          updatedAt: new Date(),
        },
      },
      { upsert: true }
    );

    return NextResponse.json(
      {
        message: 'Settings saved',
        settings: nextSettings,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('[settings PUT] Failed to save settings:', describeMongoError(error));
    return NextResponse.json(
      { error: 'Unable to save settings' },
      { status: 500 }
    );
  }
}
