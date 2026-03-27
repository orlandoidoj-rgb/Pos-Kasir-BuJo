import { eq } from 'drizzle-orm';
import { categories } from '@warung-bujo/database';

export async function getCategories(db: any) {
  return await db.select().from(categories).orderBy(categories.name);
}

export async function getCategoryById(db: any, id: string) {
  const [category] = await db.select().from(categories).where(eq(categories.id, id)).limit(1);
  return category || null;
}

export async function createCategory(db: any, input: { name: string }) {
  const [created] = await db.insert(categories).values({ name: input.name }).returning();
  return created;
}

export async function updateCategory(db: any, id: string, input: { name?: string }) {
  const updates: any = {};
  if (input.name !== undefined) updates.name = input.name;

  if (Object.keys(updates).length === 0) throw new Error('Tidak ada data yang diupdate');

  const [updated] = await db
    .update(categories)
    .set(updates)
    .where(eq(categories.id, id))
    .returning();

  if (!updated) throw new Error('Kategori tidak ditemukan');
  return updated;
}

export async function deleteCategory(db: any, id: string) {
  const [deleted] = await db.delete(categories).where(eq(categories.id, id)).returning({ id: categories.id });
  if (!deleted) throw new Error('Kategori tidak ditemukan');
  return deleted;
}
