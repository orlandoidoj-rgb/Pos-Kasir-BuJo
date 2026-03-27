import { eq, sql, and, count } from 'drizzle-orm';
import { products, categories, stockMoves, boms } from '@warung-bujo/database';

export async function getProducts(db: any, branchId?: string) {
  // Join condition: if branchId specified, only sum stock moves for that branch
  const stockJoinCondition = branchId
    ? and(eq(products.id, stockMoves.productId), eq(stockMoves.branchId, branchId))
    : eq(products.id, stockMoves.productId);

  return await db
    .select({
      id: products.id,
      name: products.name,
      image: products.image,
      unit: products.unit,
      price: products.price,
      purchasePrice: products.purchasePrice,
      categoryId: products.categoryId,
      categoryName: categories.name,
      isSellable: products.isSellable,
      isRawMaterial: products.isRawMaterial,
      stock: sql<number>`COALESCE(SUM(${stockMoves.qty}), 0)`.mapWith(Number),
    })
    .from(products)
    .leftJoin(categories, eq(products.categoryId, categories.id))
    .leftJoin(stockMoves, stockJoinCondition)
    .groupBy(products.id, categories.name)
    .orderBy(products.name);
}

export async function getProductById(db: any, id: string, branchId?: string) {
  const productsList = await getProducts(db, branchId);
  return productsList.find(p => p.id === id) || null;
}

export async function createProduct(db: any, input: {
  name: string;
  image?: string;
  unit?: string;
  price: string | number;
  purchasePrice?: string | number;
  categoryId: string;
  isSellable?: boolean;
  isRawMaterial?: boolean;
}) {
  const [created] = await db.insert(products).values({
    name: input.name,
    image: input.image || null,
    unit: input.unit || 'pcs',
    price: String(input.price),
    purchasePrice: String(input.purchasePrice || 0),
    categoryId: input.categoryId,
    isSellable: input.isSellable !== undefined ? input.isSellable : true,
    isRawMaterial: input.isRawMaterial !== undefined ? input.isRawMaterial : false,
  }).returning();
  return created;
}

export async function updateProduct(db: any, id: string, input: {
  name?: string;
  image?: string;
  unit?: string;
  price?: string | number;
  purchasePrice?: string | number;
  categoryId?: string;
  isSellable?: boolean;
  isRawMaterial?: boolean;
}) {
  const updates: any = {};
  if (input.name !== undefined) updates.name = input.name;
  if (input.image !== undefined) updates.image = input.image || null;
  if (input.unit !== undefined) updates.unit = input.unit;
  if (input.price !== undefined) updates.price = String(input.price);
  if (input.purchasePrice !== undefined) updates.purchasePrice = String(input.purchasePrice);
  if (input.categoryId !== undefined) updates.categoryId = input.categoryId;
  if (input.isSellable !== undefined) updates.isSellable = input.isSellable;
  if (input.isRawMaterial !== undefined) updates.isRawMaterial = input.isRawMaterial;

  if (Object.keys(updates).length === 0) throw new Error('Tidak ada data yang diupdate');

  const [updated] = await db
    .update(products)
    .set(updates)
    .where(eq(products.id, id))
    .returning();

  if (!updated) throw new Error('Produk tidak ditemukan');
  return updated;
}

export async function deleteProduct(db: any, id: string) {
  // Check if product is used as raw material in any BOM
  const bomUsage = await db
    .select({ count: count() })
    .from(boms)
    .where(eq(boms.rawMaterialId, id));

  if (bomUsage.length > 0 && bomUsage[0].count > 0) {
    throw new Error('Tidak dapat menghapus bahan baku ini karena masih digunakan dalam resep (BOM/Bill of Materials). Hapus atau edit resep yang menggunakan bahan baku ini terlebih dahulu.');
  }

  // Check if product has any BOM entries (as a finished product)
  const bomAsProduct = await db
    .select({ count: count() })
    .from(boms)
    .where(eq(boms.productId, id));

  if (bomAsProduct.length > 0 && bomAsProduct[0].count > 0) {
    throw new Error('Tidak dapat menghapus produk ini karena memiliki resep (BOM/Bill of Materials). Hapus resep terlebih dahulu.');
  }

  const [deleted] = await db.delete(products).where(eq(products.id, id)).returning({ id: products.id });
  if (!deleted) throw new Error('Produk tidak ditemukan');
  return deleted;
}

// Voucher validation helper (this is in products service by design - can be moved)
export async function validateVoucher(db: any, code: string, subtotal: number, branchId?: string) {
  // This will be in vouchers.service.ts
  return null;
}
