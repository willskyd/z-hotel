import jwt from 'jsonwebtoken';
import bcryptjs from 'bcryptjs';

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error('Please define the JWT_SECRET environment variable');
}

export async function hashPassword(password: string): Promise<string> {
  const salt = await bcryptjs.genSalt(10);
  return bcryptjs.hash(password, salt);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcryptjs.compare(password, hash);
}

export function generateToken(payload: Record<string, any>): string {
  return jwt.sign(payload, JWT_SECRET!, { expiresIn: '24h' });
}

export function generateRefreshToken(payload: Record<string, any>): string {
  return jwt.sign(payload, JWT_SECRET!, { expiresIn: '7d' });
}

export function verifyToken(token: string): Record<string, any> | null {
  try {
    return jwt.verify(token, JWT_SECRET!) as Record<string, any>;
  } catch (error) {
    console.error('[v0] Token verification failed:', error);
    return null;
  }
}

export function extractTokenFromHeader(authHeader: string | undefined): string | null {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  return authHeader.substring(7);
}
