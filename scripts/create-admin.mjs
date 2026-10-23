
import nextEnv from '@next/env';
const { loadEnvConfig } = nextEnv;import { MongoClient } from 'mongodb';
import bcrypt from 'bcryptjs';

loadEnvConfig(process.cwd());

async function main() {
  const { MONGODB_URI, ADMIN_EMAIL, ADMIN_NAME, ADMIN_PASSWORD } = process.env;

  if (!MONGODB_URI || !ADMIN_EMAIL || !ADMIN_NAME || !ADMIN_PASSWORD) {
    throw new Error('Required environment variables are missing.');
  }

  const client = new MongoClient(MONGODB_URI, {
    serverSelectionTimeoutMS: 10000,
  });

  try {
    await client.connect();

    const db = client.db('zinuel_hotel');
    const users = db.collection('users');
    const email = ADMIN_EMAIL.trim().toLowerCase();

    const existing = await users.findOne({ email });

    if (existing) {
      console.log('A user with this email already exists.');
      return;
    }

    const password = await bcrypt.hash(ADMIN_PASSWORD, 10);

    await users.insertOne({
      email,
      fullName: ADMIN_NAME.trim(),
      password,
      role: 'admin',
      status: 'active',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    console.log('Admin account created successfully.');
    console.log('Email:', email);
  } finally {
    await client.close();
  }
}

main().catch((error) => {
  console.error('Admin creation failed:', error.message);
  process.exitCode = 1;
});
