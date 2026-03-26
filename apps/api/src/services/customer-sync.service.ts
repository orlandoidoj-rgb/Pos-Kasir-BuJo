import { eq, and } from 'drizzle-orm';
import { users, promosVouchers, userVouchers } from '@warung-bujo/database';

/**
 * Get full sync data for a customer: profile, points, active vouchers/promos
 */
export async function getCustomerSyncData(db: any, userId: string) {
  // Get user profile
  const [user] = await db
    .select({
      id: users.id,
      role: users.role,
      phoneNumber: users.phoneNumber,
      email: users.email,
      fullName: users.fullName,
      points: users.points,
      createdAt: users.createdAt,
    })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  if (!user) throw new Error('User tidak ditemukan');

  // Get user's vouchers with promo details
  const vouchers = await db
    .select({
      id: userVouchers.id,
      isUsed: userVouchers.isUsed,
      usedAt: userVouchers.usedAt,
      claimedAt: userVouchers.claimedAt,
      promo: {
        id: promosVouchers.id,
        code: promosVouchers.code,
        title: promosVouchers.title,
        description: promosVouchers.description,
        discountType: promosVouchers.discountType,
        value: promosVouchers.value,
        minOrder: promosVouchers.minOrder,
        maxDiscount: promosVouchers.maxDiscount,
        validFrom: promosVouchers.validFrom,
        validUntil: promosVouchers.validUntil,
        isActive: promosVouchers.isActive,
      },
    })
    .from(userVouchers)
    .innerJoin(promosVouchers, eq(userVouchers.promoVoucherId, promosVouchers.id))
    .where(
      and(
        eq(userVouchers.userId, userId),
        eq(userVouchers.isUsed, false),
        eq(promosVouchers.isActive, true),
      )
    );

  // Filter out expired vouchers
  const now = new Date();
  const activeVouchers = vouchers.filter((v: any) => {
    if (v.promo.validUntil && new Date(v.promo.validUntil) < now) return false;
    return true;
  });

  return {
    profile: user,
    points: user.points,
    vouchers: activeVouchers,
  };
}
