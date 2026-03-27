import { eq, and, sql } from 'drizzle-orm';
import { vouchers, userVouchers, promosVouchers } from '@warung-bujo/database';

// Legacy vouchers table
export async function getVouchers(db: any) {
  return await db.select().from(vouchers);
}

export async function getActiveVouchers(db: any) {
  const now = new Date();
  return await db
    .select()
    .from(vouchers)
    .where(
      and(
        sql`${vouchers.quota} > 0`,
        sql`(${vouchers.validUntil} IS NULL OR ${vouchers.validUntil} > ${now})`
      )
    );
}

export async function validateVoucherCode(db: any, code: string, subtotal: number, branchId?: string) {
  // Check legacy vouchers first
  const [legacyVoucher] = await db
    .select()
    .from(vouchers)
    .where(eq(vouchers.code, code))
    .limit(1);

  if (legacyVoucher) {
    // Validate
    const now = new Date();
    const isValid = legacyVoucher.quota > 0 && (!legacyVoucher.validUntil || new Date(legacyVoucher.validUntil) > now);

    if (!isValid) {
      return { valid: false, discount: 0, message: 'Voucher tidak valid atau telah kedaluwarsa' };
    }

    let discount = 0;
    const value = Number(legacyVoucher.value);

    if (legacyVoucher.discountType === 'percentage') {
      discount = (subtotal * value) / 100;
    } else if (legacyVoucher.discountType === 'fixed') {
      discount = value;
    }

    return {
      valid: true,
      discount,
      message: `Hemat Rp ${Math.round(discount).toLocaleString('id-ID')}!`,
      voucherCode: code,
      discountType: legacyVoucher.discountType,
    };
  }

  // Check promos_vouchers table
  const [promoVoucher] = await db
    .select()
    .from(promosVouchers)
    .where(eq(promosVouchers.code, code))
    .limit(1);

  if (promoVoucher) {
    const now = new Date();
    const isValid =
      promoVoucher.isActive &&
      (!promoVoucher.validUntil || new Date(promoVoucher.validUntil) > now) &&
      (!promoVoucher.validFrom || new Date(promoVoucher.validFrom) <= now) &&
      (!promoVoucher.usageLimit || promoVoucher.usageCount < promoVoucher.usageLimit);

    if (!isValid) {
      return { valid: false, discount: 0, message: 'Voucher tidak valid atau telah kedaluwarsa' };
    }

    const minOrder = promoVoucher.minOrder ? Number(promoVoucher.minOrder) : 0;
    if (subtotal < minOrder) {
      return {
        valid: false,
        discount: 0,
        message: `Minimum order Rp ${minOrder.toLocaleString('id-ID')} untuk voucher ini`,
      };
    }

    let discount = 0;
    const value = Number(promoVoucher.value);

    if (promoVoucher.discountType === 'percentage') {
      discount = (subtotal * value) / 100;
      const maxDiscount = promoVoucher.maxDiscount ? Number(promoVoucher.maxDiscount) : null;
      if (maxDiscount && discount > maxDiscount) {
        discount = maxDiscount;
      }
    } else if (promoVoucher.discountType === 'fixed') {
      discount = value;
    }

    return {
      valid: true,
      discount,
      message: `Hemat Rp ${Math.round(discount).toLocaleString('id-ID')}!`,
      voucherCode: code,
      discountType: promoVoucher.discountType,
    };
  }

  return { valid: false, discount: 0, message: 'Kode voucher tidak ditemukan' };
}

export async function createVoucher(db: any, input: {
  code: string;
  discountType: string;
  value: string | number;
  quota?: number;
  validUntil?: Date | string;
}) {
  const [created] = await db.insert(vouchers).values({
    code: input.code,
    discountType: input.discountType,
    value: String(input.value),
    quota: input.quota || 0,
    validUntil: input.validUntil ? new Date(input.validUntil) : null,
  }).returning();
  return created;
}

export async function updateVoucher(db: any, id: string, input: {
  code?: string;
  discountType?: string;
  value?: string | number;
  quota?: number;
  validUntil?: Date | string;
}) {
  const updates: any = {};
  if (input.code !== undefined) updates.code = input.code;
  if (input.discountType !== undefined) updates.discountType = input.discountType;
  if (input.value !== undefined) updates.value = String(input.value);
  if (input.quota !== undefined) updates.quota = input.quota;
  if (input.validUntil !== undefined) updates.validUntil = input.validUntil ? new Date(input.validUntil) : null;

  if (Object.keys(updates).length === 0) throw new Error('Tidak ada data yang diupdate');

  const [updated] = await db
    .update(vouchers)
    .set(updates)
    .where(eq(vouchers.id, id))
    .returning();

  if (!updated) throw new Error('Voucher tidak ditemukan');
  return updated;
}

export async function deleteVoucher(db: any, id: string) {
  const [deleted] = await db.delete(vouchers).where(eq(vouchers.id, id)).returning({ id: vouchers.id });
  if (!deleted) throw new Error('Voucher tidak ditemukan');
  return deleted;
}
