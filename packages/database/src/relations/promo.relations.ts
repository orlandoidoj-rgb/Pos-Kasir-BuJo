import { relations } from "drizzle-orm";
import { promosVouchers, userVouchers } from "../schema/promo.schema";
import { users } from "../schema/auth.schema";

export const promosVouchersRelations = relations(promosVouchers, ({ many }) => ({
  userVouchers: many(userVouchers),
}));

export const userVouchersRelations = relations(userVouchers, ({ one }) => ({
  user: one(users, { fields: [userVouchers.userId], references: [users.id] }),
  promoVoucher: one(promosVouchers, { fields: [userVouchers.promoVoucherId], references: [promosVouchers.id] }),
}));
