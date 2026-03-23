import { sql } from "drizzle-orm";
import { pgTable, uuid, numeric, timestamp, varchar, integer, index } from "drizzle-orm/pg-core";
import { branches, users } from "../schema/auth.schema";
import { partners } from "../schema/crm.schema";
import { products } from "../schema/catalog.schema";
import { orderTypeEnum, orderStatusEnum, paymentMethodEnum } from "../enums/pos.enums";

export const posOrders = pgTable("pos_orders", {
  id: uuid("id").primaryKey().defaultRandom(),
  branchId: uuid("branch_id").references(() => branches.id).notNull(),
  userId: uuid("user_id").references(() => users.id).notNull(),
  partnerId: uuid("partner_id").references(() => partners.id),
  orderType: orderTypeEnum("order_type").notNull(),
  status: orderStatusEnum("status").notNull().default("Pending"),
  total: numeric("total", { precision: 12, scale: 2 }).notNull().default("0"),
  discount: numeric("discount", { precision: 12, scale: 2 }).notNull().default("0"),
  paymentMethod: paymentMethodEnum("payment_method"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  branchDateIdx: index("idx_pos_orders_branch_date").on(table.branchId, table.createdAt),
  statusTypeIdx: index("idx_pos_orders_status_type").on(table.status, table.orderType),
  incompleteIdx: index("idx_pos_orders_incomplete").on(table.branchId).where(sql`${table.status} != 'Paid'`),
}));

export const posOrderLines = pgTable("pos_order_lines", {
  id: uuid("id").primaryKey().defaultRandom(),
  orderId: uuid("order_id").references(() => posOrders.id).notNull(),
  productId: uuid("product_id").references(() => products.id).notNull(),
  qty: numeric("qty", { precision: 12, scale: 4 }).notNull(),
  price: numeric("price", { precision: 12, scale: 2 }).notNull(),
  subtotal: numeric("subtotal", { precision: 12, scale: 2 }).notNull(),
}, (table) => ({
  orderIdx: index("idx_pos_order_lines_order").on(table.orderId),
}));

export const vouchers = pgTable("vouchers", {
  id: uuid("id").primaryKey().defaultRandom(),
  code: varchar("code", { length: 50 }).notNull().unique(),
  discountType: varchar("discount_type", { length: 20 }).notNull(),
  value: numeric("value", { precision: 12, scale: 2 }).notNull(),
  quota: integer("quota").notNull().default(0),
  validUntil: timestamp("valid_until"),
});
