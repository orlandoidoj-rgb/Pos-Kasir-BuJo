import { pgTable, uuid, varchar, numeric, text, timestamp } from "drizzle-orm/pg-core";
import { branches } from "../schema/auth.schema";
import { partners } from "../schema/crm.schema";
import { products } from "../schema/catalog.schema";
import { purchaseStatusEnum, transferStatusEnum } from "../enums/procurement.enums";

export const purchaseOrders = pgTable("purchase_orders", {
  id: uuid("id").primaryKey().defaultRandom(),
  poNumber: varchar("po_number", { length: 50 }).notNull().unique(),
  supplierId: uuid("supplier_id").references(() => partners.id),
  branchId: uuid("branch_id").references(() => branches.id).notNull(),
  status: purchaseStatusEnum("status").notNull().default("Draft"),
  totalAmount: numeric("total_amount", { precision: 12, scale: 2 }).notNull().default("0"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  receivedAt: timestamp("received_at"),
});

export const purchaseOrderLines = pgTable("purchase_order_lines", {
  id: uuid("id").primaryKey().defaultRandom(),
  purchaseOrderId: uuid("purchase_order_id").references(() => purchaseOrders.id).notNull(),
  productId: uuid("product_id").references(() => products.id).notNull(),
  qty: numeric("qty", { precision: 12, scale: 4 }).notNull(),
  unitPrice: numeric("unit_price", { precision: 12, scale: 2 }).notNull(),
  subtotal: numeric("subtotal", { precision: 12, scale: 2 }).notNull(),
});

export const stockTransfers = pgTable("stock_transfers", {
  id: uuid("id").primaryKey().defaultRandom(),
  transferNumber: varchar("transfer_number", { length: 50 }).notNull().unique(),
  fromBranchId: uuid("from_branch_id").references(() => branches.id).notNull(),
  toBranchId: uuid("to_branch_id").references(() => branches.id).notNull(),
  status: transferStatusEnum("status").notNull().default("Draft"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  receivedAt: timestamp("received_at"),
});

export const stockTransferLines = pgTable("stock_transfer_lines", {
  id: uuid("id").primaryKey().defaultRandom(),
  transferId: uuid("transfer_id").references(() => stockTransfers.id).notNull(),
  productId: uuid("product_id").references(() => products.id).notNull(),
  qty: numeric("qty", { precision: 12, scale: 4 }).notNull(),
});
