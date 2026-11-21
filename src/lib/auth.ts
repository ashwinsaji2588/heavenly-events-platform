import { cookies } from 'next/headers';
import { createHmac, scryptSync, timingSafeEqual, randomBytes } from 'node:crypto';

const SESSION_SECRET = process.env.SESSION_SECRET || 'heavenly-events-super-secure-production-secret-2026';
const COOKIE_NAME = 'heavenly_session';

export interface SessionUser {
  id: string;
  email: string;
  fullName: string;
  role: string;
  orgId: string;
}

// Password Hashing using scrypt
export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString('hex');
  const hash = scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, storedHash: string): boolean {
  try {
    const [salt, key] = storedHash.split(':');
    if (!salt || !key) return false;
    const keyBuffer = Buffer.from(key, 'hex');
    const derivedKey = scryptSync(password, salt, 64);
    return timingSafeEqual(keyBuffer, derivedKey);
  } catch {
    return false;
  }
}

// Stateless Cryptographic Token (HMAC-SHA256)
export function signToken(user: SessionUser): string {
  const payload = Buffer.from(
    JSON.stringify({
      ...user,
      exp: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days
    })
  ).toString('base64url');

  const signature = createHmac('sha256', SESSION_SECRET).update(payload).digest('base64url');
  return `${payload}.${signature}`;
}

export function verifyToken(token: string): SessionUser | null {
  try {
    const [payload, signature] = token.split('.');
    if (!payload || !signature) return null;

    const expectedSig = createHmac('sha256', SESSION_SECRET).update(payload).digest('base64url');
    if (!timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSig))) {
      return null;
    }

    const data = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
    if (data.exp < Date.now()) {
      return null;
    }

    return {
      id: data.id,
      email: data.email,
      fullName: data.fullName,
      role: data.role,
      orgId: data.orgId,
    };
  } catch {
    return null;
  }
}

// Server Component / Route Handler helper
export async function getCurrentUser(): Promise<SessionUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;
  return verifyToken(token);
}
