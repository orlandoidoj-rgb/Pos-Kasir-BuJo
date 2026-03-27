import { eq } from 'drizzle-orm';
import { branches } from '@warung-bujo/database';

export async function getBranches(db: any) {
  return await db.select().from(branches).orderBy(branches.createdAt);
}

export async function getBranchById(db: any, id: string) {
  const [branch] = await db.select().from(branches).where(eq(branches.id, id)).limit(1);
  return branch || null;
}

export async function createBranch(db: any, input: { name: string; address?: string; phone?: string; isHq?: boolean }) {
  const [created] = await db.insert(branches).values({
    name: input.name,
    address: input.address || null,
    phone: input.phone || null,
    isHq: input.isHq || false,
  }).returning();
  return created;
}

export async function updateBranch(db: any, id: string, input: { name?: string; address?: string; phone?: string; isHq?: boolean }) {
  const updates: any = {};
  if (input.name !== undefined) updates.name = input.name;
  if (input.address !== undefined) updates.address = input.address || null;
  if (input.phone !== undefined) updates.phone = input.phone || null;
  if (input.isHq !== undefined) updates.isHq = input.isHq;

  if (Object.keys(updates).length === 0) throw new Error('Tidak ada data yang diupdate');

  const [updated] = await db
    .update(branches)
    .set(updates)
    .where(eq(branches.id, id))
    .returning();

  if (!updated) throw new Error('Cabang tidak ditemukan');
  return updated;
}
