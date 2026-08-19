import bcrypt from 'bcryptjs';
import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import { prisma } from './db';
import crypto from 'crypto';

export const SESSION_COOKIE_NAME = 'chips09_session';
export const RESET_SESSION_COOKIE_NAME = 'chips09_reset_session';
const JWT_SECRET_STRING = process.env.JWT_SECRET || 'default-distributeur-chips-09-secret-key-32-chars';
const JWT_SECRET = new TextEncoder().encode(JWT_SECRET_STRING);

export type UserRole = 'customer' | 'driver' | 'admin';

export interface TokenPayload {
  id: string;
  email: string;
  role: UserRole;
  name: string;
}

export interface ResetSessionPayload {
  userId: string;
  email: string;
  otpId: string;
  purpose: 'password_reset';
}

export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(12);
  return bcrypt.hash(password, salt);
}

export async function verifyPassword(plain: string, hashed: string): Promise<boolean> {
  return bcrypt.compare(plain, hashed);
}

export async function createSessionToken(payload: TokenPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('30d')
    .sign(JWT_SECRET);
}

export async function verifySessionToken(token: string): Promise<TokenPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return {
      id: payload.id as string,
      email: payload.email as string,
      role: payload.role as UserRole,
      name: payload.name as string,
    };
  } catch {
    return null;
  }
}

export async function setSessionCookie(token: string) {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  });
}

export async function clearSessionCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
}

export async function getSessionUser(): Promise<TokenPayload | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
    if (!token) return null;
    return await verifySessionToken(token);
  } catch {
    return null;
  }
}

export async function getFullCurrentUser() {
  const session = await getSessionUser();
  if (!session) return null;

  try {
    const user = await prisma.user.findUnique({
      where: { id: session.id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        phone: true,
        companyName: true,
        wilaya: true,
        address: true,
        merchantType: true,
        verificationStatus: true,
        commercialRegisterUrl: true,
        commercialRegisterName: true,
        rejectionReason: true,
        reviewedAt: true,
        reviewedBy: true,
        active: true,
        createdAt: true,
      },
    });
    if (!user || !user.active) return null;
    return user;
  } catch {
    return null;
  }
}

// ----------------------------------------------------
// EMAIL OTP & PASSWORD RESET HELPERS
// ----------------------------------------------------

/**
 * Generates a cryptographically random 6-digit OTP code (e.g., 483921).
 */
export function generateSixDigitOtp(): string {
  return crypto.randomInt(100000, 999999).toString();
}

/**
 * Secure SHA-256 hash with server salt for OTP storage.
 */
export function hashOtp(otp: string): string {
  return crypto
    .createHash('sha256')
    .update(`${otp}_${JWT_SECRET_STRING}`)
    .digest('hex');
}

/**
 * Generates a signed, short-lived reset authorization token after OTP verification.
 */
export async function createPasswordResetSessionToken(payload: ResetSessionPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('15m') // Valid for 15 minutes to set new password
    .sign(JWT_SECRET);
}

/**
 * Verifies the short-lived reset authorization token.
 */
export async function verifyPasswordResetSessionToken(token: string): Promise<ResetSessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    if (payload.purpose !== 'password_reset') return null;
    return {
      userId: payload.userId as string,
      email: payload.email as string,
      otpId: payload.otpId as string,
      purpose: 'password_reset',
    };
  } catch {
    return null;
  }
}

export function generateCryptoToken(): string {
  return crypto.randomBytes(32).toString('hex');
}
