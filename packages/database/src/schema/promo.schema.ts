import { pgTable, uuid, varchar, text, numeric, integer, timestamp, boolean, index } from "drizzle-orm/pg-core";
import { users } from "./auth.schema";

// ─── Promos & Vouchers ─────────────────────────────────────────────────────────

export const promosVouchers = pgTable("promos_vouchers", {
  id: uuid("id").primaryKey().defaultRandom(),
  code: varchar("code", { length: 50 }).notNull().unique(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  discountType: varchar("discount_type", { length: 20 }).notNull(), // 'percentage' | 'fixed'
  value: numeric("value", { precision: 12, scale: 2 }).notNull(),
  minOrder: numeric("min_order", { precision: 12, scale: 2 }).default("0"),
  maxDiscount: numeric("max_discount", { precision: 12, scale: 2 }).default("0"),
  usageLimit: integer("usage_limit").default(0).notNull(), // 0 = unlimited
  usageCount: integer("usage_count").default(0).notNull(),
  validFrom: timestamp("valid_from"),
  validUntil: timestamp("valid_until"),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ─── User ↔ Voucher Junction ────────────────────────────────────────────────────

export const userVouchers = pgTable("user_vouchers", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => users.id).notNull(),
  promoVoucherId: uuid("promo_voucher_id").references(() => promosVouchers.id).notNull(),
  isUsed: boolean("is_used").default(false).notNull(),
  usedAt: timestamp("used_at"),
  claimedAt: timestamp("claimed_at").defaultNow().notNull(),
}, (table) => ({
  userIdx: index("idx_user_vouchers_user").on(table.userId),
  promoIdx: index("idx_user_vouchers_promo").on(table.promoVoucherId),
}));
