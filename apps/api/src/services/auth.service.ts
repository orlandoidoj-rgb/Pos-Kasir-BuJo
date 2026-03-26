import { eq, or } from 'drizzle-orm';
import { users } from '@warung-bujo/database';
import { OAuth2Client } from 'google-auth-library';
import crypto from 'crypto';

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// ─── Simple password hashing (using Node's built-in crypto, no bcrypt needed) ──

function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${hash}`;
}

function verifyPassword(password: string, stored: string): boolean {
  const [salt, hash] = stored.split(':');
  if (!salt || !hash) return false;
  const verifyHash = crypto.scryptSync(password, salt, 64).toString('hex');
  return hash === verifyHash;
}

// ─── Register ──────────────────────────────────────────────────────────────────

interface RegisterInput {
  phoneNumber: string;
  fullName: string;
  password: string;
  email?: string;
  role?: 'customer' | 'driver' | 'cashier' | 'admin';
}

export async function registerUser(db: any, input: RegisterInput) {
  const { phoneNumber, fullName, password, email, role = 'customer' } = input;

  // Normalize phone
  const normalizedPhone = normalizePhone(phoneNumber);
  if (!normalizedPhone) throw new Error('Nomor HP tidak valid');

  // Check uniqueness
  const existing = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.phoneNumber, normalizedPhone))
    .limit(1);

  if (existing.length > 0) throw new Error('Nomor HP sudah terdaftar');

  // Check email uniqueness if provided
  if (email) {
    const existingEmail = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, email))
      .limit(1);
    if (existingEmail.length > 0) throw new Error('Email sudah terdaftar');
  }

  const passwordHash = hashPassword(password);

  const [created] = await db
    .insert(users)
    .values({
      phoneNumber: normalizedPhone,
      fullName,
      email: email || null,
      passwordHash,
      role,
    })
    .returning();

  return created;
}

// ─── Login by Phone ────────────────────────────────────────────────────────────

export async function loginByPhone(db: any, phoneNumber: string, password: string) {
  const normalizedPhone = normalizePhone(phoneNumber);
  if (!normalizedPhone) throw new Error('Nomor HP tidak valid');

  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.phoneNumber, normalizedPhone))
    .limit(1);

  if (!user) throw new Error('Nomor HP tidak terdaftar');
  if (!user.passwordHash) throw new Error('Akun ini menggunakan Google Sign-In. Silakan login dengan Google.');

  if (!verifyPassword(password, user.passwordHash)) {
    throw new Error('Password salah');
  }

  return user;
}

// ─── Login by Google ───────────────────────────────────────────────────────────

export async function loginByGoogle(db: any, credential: string) {
  let payload: any;

  const googleClientId = process.env.GOOGLE_CLIENT_ID;
  if (!googleClientId || googleClientId.includes('GANTI')) {
    // Dev/test mode: decode without verify
    const parts = credential.split('.');
    if (parts.length === 3) {
      payload = JSON.parse(Buffer.from(parts[1], 'base64url').toString());
    } else {
      throw new Error('GOOGLE_CLIENT_ID belum dikonfigurasi');
    }
  } else {
    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: googleClientId,
    });
    payload = ticket.getPayload();
  }

  if (!payload?.sub) throw new Error('Token Google tidak valid');

  const googleId = payload.sub;
  const email = payload.email || '';
  const name = payload.name || email.split('@')[0];

  // Find by googleId or email
  const existing = await db
    .select()
    .from(users)
    .where(or(
      eq(users.googleId, googleId),
      eq(users.email, email)
    ))
    .limit(1);

  let user = existing[0];

  if (!user) {
    // Create new customer via Google
    const [created] = await db
      .insert(users)
      .values({
        googleId,
        email,
        fullName: name,
        role: 'customer',
      })
      .returning();
    user = created;
  } else if (!user.googleId) {
    // Link Google account
    await db
      .update(users)
      .set({ googleId })
      .where(eq(users.id, user.id));
    user = { ...user, googleId };
  }

  return user;
}

// ─── Helpers ───────────────────────────────────────────────────────────────────

function normalizePhone(phone: string): string | null {
  if (!phone) return null;
  let cleaned = phone.replace(/[\s\-\(\)]/g, '');
  // Convert 08xx to 628xx
  if (cleaned.startsWith('0')) cleaned = '62' + cleaned.slice(1);
  // Must be all digits and reasonable length
  if (!/^\d{10,15}$/.test(cleaned)) return null;
  return cleaned;
}
