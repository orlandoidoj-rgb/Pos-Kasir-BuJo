import { relations } from "drizzle-orm";
import { posOrders, posOrderLines } from "../schema/pos.schema";
import { branches, users } from "../schema/auth.schema";
import { partners } from "../schema/crm.schema";
import { products } from "../schema/catalog.schema";

export const orderRelations = relations(posOrders, ({ one, many }) => ({
  branch: one(branches, { fields: [posOrders.branchId], references: [branches.id] }),
  user: one(users, { fields: [posOrders.userId], references: [users.id] }),
  partner: one(partners, { fields: [posOrders.partnerId], references: [partners.id] }),
  lines: many(posOrderLines),
}));

export const orderLineRelations = relations(posOrderLines, ({ one }) => ({
  order: one(posOrders, { fields: [posOrderLines.orderId], references: [posOrders.id] }),
  product: one(products, { fields: [posOrderLines.productId], references: [products.id] }),
}));
