import { relations } from "drizzle-orm";
import { branches } from "../schema/auth.schema";
import { products } from "../schema/catalog.schema";
import { posOrders, vouchers } from "../schema/pos.schema";
import {
  onlineStoreConfig,
  onlineCustomers,
  onlineOrders,
  onlineOrderLines,
  onlineOrderStatusLog,
} from "../schema/online.schema";

export const onlineStoreConfigRelations = relations(onlineStoreConfig, ({ one }) => ({
  branch: one(branches, {
    fields: [onlineStoreConfig.branchId],
    references: [branches.id],
  }),
}));

export const onlineCustomersRelations = relations(onlineCustomers, ({ many }) => ({
  orders: many(onlineOrders),
}));

export const onlineOrdersRelations = relations(onlineOrders, ({ one, many }) => ({
  branch: one(branches, {
    fields: [onlineOrders.branchId],
    references: [branches.id],
  }),
  customer: one(onlineCustomers, {
    fields: [onlineOrders.customerId],
    references: [onlineCustomers.id],
  }),
  voucher: one(vouchers, {
    fields: [onlineOrders.voucherId],
    references: [vouchers.id],
  }),
  posOrder: one(posOrders, {
    fields: [onlineOrders.posOrderId],
    references: [posOrders.id],
  }),
  lines: many(onlineOrderLines),
  statusLogs: many(onlineOrderStatusLog),
}));

export const onlineOrderLinesRelations = relations(onlineOrderLines, ({ one }) => ({
  order: one(onlineOrders, {
    fields: [onlineOrderLines.orderId],
    references: [onlineOrders.id],
  }),
  product: one(products, {
    fields: [onlineOrderLines.productId],
    references: [products.id],
  }),
}));

export const onlineOrderStatusLogRelations = relations(onlineOrderStatusLog, ({ one }) => ({
  order: one(onlineOrders, {
    fields: [onlineOrderStatusLog.orderId],
    references: [onlineOrders.id],
  }),
}));
