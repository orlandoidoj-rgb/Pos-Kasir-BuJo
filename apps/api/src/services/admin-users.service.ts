import { eq, ilike, and, sql } from 'drizzle-orm';
import { users } from '@warung-bujo/database';
import crypto from 'crypto';

// ─── Password hashing (same as auth.service) ─────────────────────────────────

function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${hash}`;
}

function normalizePhone(phone: string): string | null {
  if (!phone) return null;
  let cleaned = phone.replace(/[\s\-\(\)]/g, '');
  if (cleaned.startsWith('0')) cleaned = '62' + cleaned.slice(1);
  if (!/^\d{10,15}$/.test(cleaned)) return null;
  return cleaned;
}

// ─── Get all users (filterable by role) ───────────────────────────────────────

export async function getAllUsers(db: any, filters?: { role?: string; search?: string }) {
  const conditions: any[] = [];

  if (filters?.role) {
    conditions.push(eq(users.role, filters.role as any));
  }

  if (filters?.search) {
    conditions.push(
      sql`(${users.fullName} ILIKE ${'%' + filters.search + '%'} OR ${users.phoneNumber} ILIKE ${'%' + filters.search + '%'} OR ${users.email} ILIKE ${'%' + filters.search + '%'})`
    );
  }

  const result = await db
    .select({
      id: users.id,
      role: users.role,
      phoneNumber: users.phoneNumber,
      email: users.email,
      fullName: users.fullName,
      points: users.points,
      branchId: users.branchId,
      createdAt: users.createdAt,
    })
    .from(users)
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(users.createdAt);

  return result;
}

// ─── Get user by ID ───────────────────────────────────────────────────────────

export async function getUserById(db: any, id: string) {
  const [user] = await db
    .select({
      id: users.id,
      role: users.role,
      phoneNumber: users.phoneNumber,
      email: users.email,
      fullName: users.fullName,
      points: users.points,
      branchId: users.branchId,
      createdAt: users.createdAt,
    })
    .from(users)
    .where(eq(users.id, id))
    .limit(1);

  return user || null;
}

// ─── Create staff user (ADMIN / CASHIER) ──────────────────────────────────────

interface CreateStaffInput {
  fullName: string;
  phoneNumber: string;
  email?: string;
  password: string;
  role: 'admin' | 'cashier';
  branchId?: string;
}

export async function createStaffUser(db: any, input: CreateStaffInput) {
  const { fullName, phoneNumber, email, password, role, branchId } = input;

  const normalizedPhone = normalizePhone(phoneNumber);
  if (!normalizedPhone) throw new Error('Nomor HP tidak valid');

  // Check uniqueness
  const existing = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.phoneNumber, normalizedPhone))
    .limit(1);

  if (existing.length > 0) throw new Error('Nomor HP sudah terdaftar');

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
      fullName,
      phoneNumber: normalizedPhone,
      email: email || null,
      passwordHash,
      role,
      branchId: branchId || null,
    })
    .returning();

  return created;
}

// ─── Update user ──────────────────────────────────────────────────────────────

interface UpdateUserInput {
  fullName?: string;
  phoneNumber?: string;
  email?: string;
  role?: string;
  branchId?: string;
  points?: number;
}

export async function updateUser(db: any, id: string, input: UpdateUserInput) {
  const updates: any = {};

  if (input.fullName !== undefined) updates.fullName = input.fullName;
  if (input.email !== undefined) updates.email = input.email || null;
  if (input.role !== undefined) updates.role = input.role;
  if (input.branchId !== undefined) updates.branchId = input.branchId || null;
  if (input.points !== undefined) updates.points = input.points;

  if (input.phoneNumber) {
    const normalizedPhone = normalizePhone(input.phoneNumber);
    if (!normalizedPhone) throw new Error('Nomor HP tidak valid');
    updates.phoneNumber = normalizedPhone;
  }

  if (Object.keys(updates).length === 0) throw new Error('Tidak ada data yang diupdate');

  const [updated] = await db
    .update(users)
    .set(updates)
    .where(eq(users.id, id))
    .returning();

  if (!updated) throw new Error('User tidak ditemukan');

  return updated;
}

// ─── Delete user ──────────────────────────────────────────────────────────────

export async function deleteUser(db: any, id: string) {
  const [deleted] = await db
    .delete(users)
    .where(eq(users.id, id))
    .returning({ id: users.id });

  if (!deleted) throw new Error('User tidak ditemukan');
  return deleted;
}
