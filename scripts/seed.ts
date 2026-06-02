import { MongoClient, Db } from 'mongodb';
import bcryptjs from 'bcryptjs';

const MONGODB_URI = process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://localhost:27017/zinuel-ch-hotel';

if (!process.env.MONGODB_URI && !process.env.MONGO_URI) {
  console.log('⚠️  No MONGODB_URI found. Please set it in your environment variables.');
  console.log('   Using default: mongodb://localhost:27017/zinuel-ch-hotel');
}

interface User {
  _id?: string;
  email: string;
  password: string;
  name: string;
  role: string;
  department: string;
  status: string;
  createdAt: Date;
}

interface Room {
  roomNumber: string;
  type: string;
  capacity: number;
  pricePerNight: number;
  amenities: string[];
  status: string;
  floor: number;
  description: string;
  createdAt: Date;
}

interface Guest {
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  country: string;
  documentType: string;
  documentNumber: string;
  preferredLanguage: string;
  createdAt: Date;
}

interface Reservation {
  guestId?: string;
  roomId?: string;
  checkInDate: Date;
  checkOutDate: Date;
  numberOfGuests: number;
  totalPrice: number;
  status: string;
  specialRequests: string;
  createdAt: Date;
}

async function seedDatabase() {
  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    const db = client.db();

    console.log('🌱 Starting database seeding...\n');

    // Clear existing collections
    await clearCollections(db);

    // Seed users
    const users = await seedUsers(db);
    console.log(`✅ Seeded ${users.length} users\n`);

    // Seed rooms
    const rooms = await seedRooms(db);
    console.log(`✅ Seeded ${rooms.length} rooms\n`);

    // Seed guests
    const guests = await seedGuests(db);
    console.log(`✅ Seeded ${guests.length} guests\n`);

    // Seed reservations
    const reservations = await seedReservations(db, guests, rooms);
    console.log(`✅ Seeded ${reservations.length} reservations\n`);

    // Seed billing records
    const billingRecords = await seedBilling(db, reservations);
    console.log(`✅ Seeded ${billingRecords.length} billing records\n`);

    // Seed invoices
    const invoices = await seedInvoices(db, billingRecords, guests);
    console.log(`✅ Seeded ${invoices.length} invoices\n`);

    console.log('🎉 Database seeding completed successfully!');
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  } finally {
    await client.close();
  }
}

async function clearCollections(db: Db) {
  const collections = [
    'users',
    'rooms',
    'guests',
    'reservations',
    'billing',
    'invoices',
  ];

  for (const collection of collections) {
    try {
      await db.collection(collection).deleteMany({});
      console.log(`🗑️  Cleared collection: ${collection}`);
    } catch (error) {
      // Collection might not exist, ignore
    }
  }
  console.log();
}

async function seedUsers(db: Db): Promise<User[]> {
  const users: User[] = [
    {
      email: 'admin@zinuel-ch.com',
      password: await bcryptjs.hash('Admin@123', 10),
      name: 'Alexandre Durand',
      role: 'admin',
      department: 'Management',
      status: 'active',
      createdAt: new Date('2024-01-15'),
    },
    {
      email: 'manager@zinuel-ch.com',
      password: await bcryptjs.hash('Manager@123', 10),
      name: 'Sophie Martin',
      role: 'manager',
      department: 'Operations',
      status: 'active',
      createdAt: new Date('2024-02-01'),
    },
    {
      email: 'manager2@zinuel-ch.com',
      password: await bcryptjs.hash('Manager@123', 10),
      name: 'Jean-Pierre Leblanc',
      role: 'manager',
      department: 'Front Desk',
      status: 'active',
      createdAt: new Date('2024-02-15'),
    },
    {
      email: 'receptionist@zinuel-ch.com',
      password: await bcryptjs.hash('Staff@123', 10),
      name: 'Marie Dupont',
      role: 'staff',
      department: 'Front Desk',
      status: 'active',
      createdAt: new Date('2024-03-01'),
    },
    {
      email: 'receptionist2@zinuel-ch.com',
      password: await bcryptjs.hash('Staff@123', 10),
      name: 'Pierre Moreau',
      role: 'staff',
      department: 'Front Desk',
      status: 'active',
      createdAt: new Date('2024-03-05'),
    },
    {
      email: 'housekeeping@zinuel-ch.com',
      password: await bcryptjs.hash('Staff@123', 10),
      name: 'Isabelle Gauthier',
      role: 'staff',
      department: 'Housekeeping',
      status: 'active',
      createdAt: new Date('2024-03-10'),
    },
    {
      email: 'maintenance@zinuel-ch.com',
      password: await bcryptjs.hash('Staff@123', 10),
      name: 'Claude Bernard',
      role: 'staff',
      department: 'Maintenance',
      status: 'active',
      createdAt: new Date('2024-03-12'),
    },
  ];

  const result = await db.collection('users').insertMany(users as any);
  return users.map((u, i) => ({ ...u, _id: result.insertedIds[i]?.toString() }));
}

async function seedRooms(db: Db): Promise<Room[]> {
  const roomTypes = [
    { type: 'Standard', capacity: 2, price: 150, amenities: ['WiFi', 'TV', 'Air Conditioning', 'Bathroom'] },
    { type: 'Deluxe', capacity: 2, price: 250, amenities: ['WiFi', 'Smart TV', 'Air Conditioning', 'Bath & Shower', 'Mini Bar', 'Work Desk'] },
    { type: 'Suite', capacity: 4, price: 400, amenities: ['WiFi', 'Smart TV', 'Air Conditioning', 'Jacuzzi', 'Mini Bar', 'Lounge Area', 'Work Desk'] },
    { type: 'Luxury Suite', capacity: 4, price: 600, amenities: ['WiFi', 'Smart TV', 'Climate Control', 'Jacuzzi', 'Premium Mini Bar', 'Lounge Area', 'Business Center'] },
    { type: 'Standard', capacity: 1, price: 100, amenities: ['WiFi', 'TV', 'Air Conditioning', 'Bathroom'] },
  ];

  const rooms: Room[] = [];
  const statuses = ['available', 'occupied', 'maintenance', 'cleaning'];
  const floors = [1, 2, 3, 4, 5];

  let roomNumber = 100;
  for (let floor = 1; floor <= 5; floor++) {
    for (let i = 0; i < 8; i++) {
      const roomType = roomTypes[Math.floor(Math.random() * roomTypes.length)];
      rooms.push({
        roomNumber: `${floor}${String(i + 1).padStart(2, '0')}`,
        type: roomType.type,
        capacity: roomType.capacity,
        pricePerNight: roomType.price,
        amenities: roomType.amenities,
        status: statuses[Math.floor(Math.random() * statuses.length)],
        floor,
        description: `${roomType.type} room with stunning views and premium amenities. Perfect for ${roomType.capacity} guests.`,
        createdAt: new Date('2024-01-01'),
      });
      roomNumber++;
    }
  }

  await db.collection('rooms').insertMany(rooms);
  return rooms;
}

async function seedGuests(db: Db): Promise<Guest[]> {
  const firstNames = [
    'Emma', 'Oliver', 'Sophia', 'Liam', 'Ava', 'Noah', 'Isabella', 'Ethan',
    'Mia', 'Benjamin', 'Charlotte', 'Lucas', 'Amelia', 'Mason', 'Harper',
    'Jean', 'Marie', 'Pierre', 'Anne', 'Marc', 'Sophie', 'Laurent', 'Nicole',
  ];

  const lastNames = [
    'Johnson', 'Smith', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis',
    'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson',
    'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin', 'Lee', 'Perez', 'Thompson',
  ];

  const countries = [
    'USA', 'Canada', 'UK', 'France', 'Germany', 'Spain', 'Italy', 'Netherlands',
    'Belgium', 'Switzerland', 'Australia', 'Japan', 'Brazil', 'Mexico', 'China',
  ];

  const guests: Guest[] = [];

  for (let i = 0; i < 50; i++) {
    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
    const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}${i}@example.com`;

    guests.push({
      email,
      firstName,
      lastName,
      phone: `+${Math.floor(Math.random() * 900000000 + 100000000)}`,
      country: countries[Math.floor(Math.random() * countries.length)],
      documentType: Math.random() > 0.5 ? 'Passport' : 'ID Card',
      documentNumber: `${String(Math.floor(Math.random() * 1000000000)).padStart(9, '0')}`,
      preferredLanguage: 'English',
      createdAt: new Date(2024, Math.floor(Math.random() * 6), Math.floor(Math.random() * 28) + 1),
    });
  }

  await db.collection('guests').insertMany(guests);
  return guests;
}

async function seedReservations(db: Db, guests: Guest[], rooms: Room[]): Promise<Reservation[]> {
  const reservations: Reservation[] = [];
  const statuses = ['confirmed', 'checked-in', 'checked-out', 'cancelled', 'pending'];

  const guestIds = (await db.collection('guests').find().project({ _id: 1 }).toArray()).map(g => g._id);
  const roomIds = (await db.collection('rooms').find().project({ _id: 1, pricePerNight: 1 }).toArray());

  for (let i = 0; i < 60; i++) {
    const checkInDate = new Date(2024, Math.floor(Math.random() * 12), Math.floor(Math.random() * 25) + 1);
    const nights = Math.floor(Math.random() * 7) + 1;
    const checkOutDate = new Date(checkInDate);
    checkOutDate.setDate(checkOutDate.getDate() + nights);

    const room = roomIds[Math.floor(Math.random() * roomIds.length)];
    const totalPrice = (room.pricePerNight || 150) * nights;

    reservations.push({
      guestId: guestIds[Math.floor(Math.random() * guestIds.length)]?.toString(),
      roomId: room._id?.toString(),
      checkInDate,
      checkOutDate,
      numberOfGuests: Math.floor(Math.random() * 3) + 1,
      totalPrice,
      status: statuses[Math.floor(Math.random() * statuses.length)],
      specialRequests: [
        'Early check-in requested',
        'High floor preferred',
        'Birthday celebration',
        'Business trip',
        'Honeymoon suite preferred',
        'No smoking preferred',
      ][Math.floor(Math.random() * 6)],
      createdAt: new Date(2024, Math.floor(Math.random() * 6), Math.floor(Math.random() * 28) + 1),
    });
  }

  await db.collection('reservations').insertMany(reservations);
  return reservations;
}

async function seedBilling(db: Db, reservations: Reservation[]): Promise<object[]> {
  const billingRecords: object[] = [];

  const paymentMethods = ['Credit Card', 'Debit Card', 'Bank Transfer', 'Cash'];
  const paymentStatuses = ['paid', 'pending', 'partial', 'refunded'];

  for (const reservation of reservations) {
    const foundReservation = await db.collection('reservations').findOne({ checkInDate: reservation.checkInDate });
    billingRecords.push({
      reservationId: foundReservation?._id?.toString(),
      amount: reservation.totalPrice,
      currency: 'EUR',
      paymentMethod: paymentMethods[Math.floor(Math.random() * paymentMethods.length)],
      paymentStatus: paymentStatuses[Math.floor(Math.random() * paymentStatuses.length)],
      transactionId: `TXN-${String(Math.floor(Math.random() * 1000000)).padStart(6, '0')}`,
      paidDate: reservation.totalPrice > 0 ? new Date() : null,
      notes: ['No special notes', 'Late payment', 'Corporate rate applied', 'Discount applied'][
        Math.floor(Math.random() * 4)
      ],
      createdAt: new Date(),
    });
  }

  if (billingRecords.length > 0) {
    await db.collection('billing').insertMany(billingRecords);
  }
  return billingRecords;
}

async function seedInvoices(db: Db, billingRecords: object[], guests: Guest[]): Promise<object[]> {
  const invoices: object[] = [];
  const invoiceStatuses = ['issued', 'paid', 'overdue', 'partial'];

  const guestIds = (await db.collection('guests').find().project({ _id: 1 }).toArray());

  for (let i = 0; i < Math.min(40, billingRecords.length); i++) {
    const guest = guestIds[Math.floor(Math.random() * guestIds.length)];
    const billingRecord = billingRecords[i] as any;

    invoices.push({
      invoiceNumber: `INV-2024-${String(i + 1000).substring(1)}`,
      guestId: guest._id,
      billingId: billingRecord._id,
      amount: billingRecord.amount || 0,
      currency: 'EUR',
      issueDate: new Date(),
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      status: invoiceStatuses[Math.floor(Math.random() * invoiceStatuses.length)],
      description: 'Hotel accommodation and services',
      taxAmount: Math.round((billingRecord.amount || 0) * 0.2 * 100) / 100,
      notes: 'Thank you for choosing Zinuel-ch Hotel',
      createdAt: new Date(),
    });
  }

  if (invoices.length > 0) {
    await db.collection('invoices').insertMany(invoices);
  }
  return invoices;
}

// Run the seeding
seedDatabase().catch(console.error);
