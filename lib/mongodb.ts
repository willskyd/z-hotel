import { MongoClient, Db } from 'mongodb';

function getMongoUri(): string {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    throw new Error('Please define the MONGODB_URI environment variable');
  }

  return uri;
}

let cachedClient: MongoClient | null = null;
let cachedDb: Db | null = null;

export async function connectToDatabase() {
  if (cachedClient && cachedDb) {
    return { client: cachedClient, db: cachedDb };
  }

  try {
    const client = new MongoClient(getMongoUri());
    await client.connect();
    const db = client.db(); // Uses the database from the connection string (hotel-mgmt)

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
