import { MongoClient, Db } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable');
}

let cachedClient: MongoClient | null = null;
let cachedDb: Db | null = null;

export async function connectToDatabase() {
  if (cachedClient && cachedDb) {
    return { client: cachedClient, db: cachedDb };
  }

  try {
    const client = new MongoClient(MONGODB_URI);
    await client.connect();
    const db = client.db('zinuel_ch_hotel');

    cachedClient = client;
    cachedDb = db;

    console.log('[v0] Connected to MongoDB');
    return { client, db };
  } catch (error) {
    console.error('[v0] MongoDB connection error:', error);
    throw error;
  }
}

export async function getDatabase() {
  const { db } = await connectToDatabase();
  return db;
}
