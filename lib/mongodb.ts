import { Db, MongoClient } from 'mongodb';

const DATABASE_NAME = 'zinuel_hotel';
const CONNECTION_TIMEOUT_MS = 10_000;

type MongoCache = typeof globalThis & {
  __zinuelMongoClientPromise?: Promise<MongoClient>;
};

const mongoCache = globalThis as MongoCache;

function getMongoUri(): string {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    throw new Error('Please define the MONGODB_URI environment variable');
  }

  return uri;
}

export function describeMongoError(error: unknown): string {
  if (!(error instanceof Error)) return 'Unknown MongoDB error';

  const code = 'code' in error && (typeof error.code === 'string' || typeof error.code === 'number')
    ? ` (${error.code})`
    : '';
  const safeMessage = error.message
    .replace(/mongodb(?:\+srv)?:\/\/[^\s"']+/gi, '[redacted MongoDB URI]')
    .replace(/(password|passwd|pwd)=([^&\s]+)/gi, '$1=[redacted]');

  return `${error.name}${code}: ${safeMessage}`;
}

function getClientPromise(): Promise<MongoClient> {
  if (!mongoCache.__zinuelMongoClientPromise) {
    const client = new MongoClient(getMongoUri(), {
      connectTimeoutMS: CONNECTION_TIMEOUT_MS,
      serverSelectionTimeoutMS: CONNECTION_TIMEOUT_MS,
    });

    mongoCache.__zinuelMongoClientPromise = client.connect()
      .then(async (connectedClient) => {
        // Do not hand out a connection until a real command confirms it is usable.
        await connectedClient.db(DATABASE_NAME).command({ ping: 1 });
        return connectedClient;
      })
      .catch(async (error: unknown) => {
        mongoCache.__zinuelMongoClientPromise = undefined;
        await client.close().catch(() => undefined);
        throw error;
      });
  }

  return mongoCache.__zinuelMongoClientPromise;
}

export async function connectToDatabase(): Promise<{ client: MongoClient; db: Db }> {
  const client = await getClientPromise();
  return { client, db: client.db(DATABASE_NAME) };
}

export async function getDatabase(): Promise<Db> {
  const { db } = await connectToDatabase();
  return db;
}
