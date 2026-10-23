import { loadEnvConfig } from '@next/env';
import { ObjectId } from 'mongodb';
import { createInterface } from 'node:readline/promises';
import { stdin, stdout } from 'node:process';
import { getDatabase } from '../lib/mongodb';
import { hashPassword } from '../lib/auth';

loadEnvConfig(process.cwd());

async function askHiddenPassword(prompt: string): Promise<string> {
  stdout.write(prompt);

  if (!stdin.isTTY || !stdout.isTTY) {
    throw new Error('Run this script directly in an interactive terminal.');
  }

  stdin.setRawMode(true);
  stdin.resume();

  let password = '';

  try {
    for await (const chunk of stdin) {
      const input = chunk.toString();

      if (input === '\u0003') {
        throw new Error('Cancelled.');
      }

      if (input === '\r' || input === '\n') {
        stdout.write('\n');
        break;
      }

      if (input === '\u007f' || input === '\b') {
        password = password.slice(0, -1);
        continue;
      }

      if (!/[\x00-\x1f\x7f]/.test(input)) {
        password += input;
      }
    }
  } finally {
    stdin.setRawMode(false);
  }

  return password;
}

async function main() {
  const rl = createInterface({ input: stdin, output: stdout });

  try {
    const email = (await rl.question('Admin email: ')).trim().toLowerCase();
    const fullName = (await rl.question('Admin full name: ')).trim();

    rl.close();

    const password = await askHiddenPassword('Admin password (hidden): ');

    if (!email || !fullName || password.length < 10) {
      throw new Error(
        'Email and full name are required; password must be at least 10 characters.',
      );
    }

    const db = await getDatabase();
    const users = db.collection('users');

    if (await users.findOne({ email })) {
      throw new Error(
        'That email already exists. No account was created.',
      );
    }

    const result = await users.insertOne({
      _id: new ObjectId(),
      email,
      fullName,
      password: await hashPassword(password),
      role: 'admin',
      status: 'active',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    console.log('\nAdmin account created successfully.');
    console.log(`Email: ${email}`);
    console.log(`User ID: ${result.insertedId}`);
    console.log('You can now try signing in with this email and password.');
  } finally {
    rl.close();
  }
}

main().catch((error: unknown) => {
  console.error(
    '\nAdmin creation failed:',
    error instanceof Error ? error.message : error,
  );
  process.exitCode = 1;
});
