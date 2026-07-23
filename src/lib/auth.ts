import { SignJWT, jwtVerify } from 'jose';
import bcrypt from 'bcryptjs';
import { AdminUser, UserRole } from './types';
import { initialAdminUsers } from './seedData';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'edgesys-lab-super-secret-jwt-key-2026-vercel-ready'
);

export interface JWTPayload {
  id: string;
  username: string;
  name: string;
  email: string;
  role: UserRole;
}

export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  if (!hash) return false;
  // If hash is plain-text (e.g. legacy/seed data before bcrypt migration), check direct match
  if (!hash.startsWith('$2a$') && !hash.startsWith('$2b$') && !hash.startsWith('$2y$')) {
    return password === hash;
  }
  try {
    return await bcrypt.compare(password, hash);
  } catch {
    return password === hash;
  }
}

export async function signToken(payload: JWTPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('24h')
    .sign(JWT_SECRET);
}

export async function verifyToken(token: string): Promise<JWTPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as unknown as JWTPayload;
  } catch {
    return null;
  }
}

// In-memory / localStorage sync wrapper for admin user accounts
export function getAdminUsersList(): (AdminUser & { passwordHash?: string })[] {
  if (typeof window === 'undefined') {
    return initialAdminUsers;
  }
  try {
    const stored = localStorage.getItem('edgesys-admin-users-v1');
    if (stored) {
      return JSON.parse(stored);
    }
  } catch {
    // fallback
  }
  return initialAdminUsers;
}

export function saveAdminUsersList(users: (AdminUser & { passwordHash?: string })[]): void {
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem('edgesys-admin-users-v1', JSON.stringify(users));
    } catch (e) {
      console.error('Failed to save admin users to localStorage', e);
    }
  }
}
