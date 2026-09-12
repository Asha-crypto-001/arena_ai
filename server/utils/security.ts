import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User, UserRole } from '../types.js';

const SALT_ROUNDS = 10;
export const JWT_SECRET = process.env.JWT_SECRET || 'iskilllink-secure-token-uganda-mbarara-2026';
export const JWT_EXPIRY = '7d';

export interface TokenPayload {
  id: string;
  email: string;
  role: UserRole;
  name: string;
  is_primary_admin?: boolean;
}

/**
 * Asynchronously hashes a plaintext password using bcrypt.
 */
export async function hashPassword(password: string): Promise<string> {
  return await bcrypt.hash(password, SALT_ROUNDS);
}

/**
 * Synchronously hashes a plaintext password using bcrypt.
 * Useful for synchronous DB initialization and migration.
 */
export function hashPasswordSync(password: string): string {
  return bcrypt.hashSync(password, SALT_ROUNDS);
}

/**
 * Compares a candidate password against a stored bcrypt hash.
 * Handles legacy plaintext comparisons if migration has not occurred yet.
 */
export async function comparePassword(password: string, hash: string): Promise<boolean> {
  if (!password || !hash) return false;
  if (!hash.startsWith('$2')) {
    return password === hash;
  }
  return await bcrypt.compare(password, hash);
}

/**
 * Generates a cryptographically signed JSON Web Token (JWT) with user claims.
 */
export function generateToken(user: { id: string; email: string; role: UserRole; name: string; is_primary_admin?: boolean }): string {
  const isPrimary = user.is_primary_admin === true ||
    (user.role === 'admin' && user.email.toLowerCase() === 'ashabahebwahassan665@gmail.com');
  const payload: TokenPayload = {
    id: user.id,
    email: user.email,
    role: user.role,
    name: user.name,
    is_primary_admin: isPrimary
  };
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRY });
}

/**
 * Strips password_hash and internal credentials from a user object before returning to client.
 */
export function sanitizeUser<T extends Partial<User> | null | undefined>(user: T): Omit<T, 'password_hash'> | null {
  if (!user) return null as any;
  const clone = { ...user } as any;
  delete clone.password_hash;
  return clone;
}
