import { pgTable, uuid, numeric, text, timestamp, index, uniqueIndex } from "drizzle-orm/pg-core";
import { branches } from "../schema/auth.schema";
import { products } from "../schema/catalog.schema";
import { stockReferenceTypeEnum } from "../enums/inventory.enums";

export const stockMoves = pgTable("stock_moves", {
  id: uuid("id").primaryKey().defaultRandom(),
  branchId: uuid("branch_id").references(() => branches.id).notNull(),
  productId: uuid("product_id").references(() => products.id).notNull(),
  qty: numeric("qty", { precision: 12, scale: 4 }).notNull(),
  referenceType: stockReferenceTypeEnum("reference_type").notNull(),
  referenceId: uuid("reference_id"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  branchProductIdx: index("idx_stock_moves_branch_product").on(table.branchId, table.productId),
  referenceIdx: index("idx_stock_moves_reference").on(table.referenceType, table.referenceId),
  dateIdx: index("idx_stock_moves_date").on(table.createdAt),
}));

export const stockMinLevels = pgTable("stock_min_levels", {
  id: uuid("id").primaryKey().defaultRandom(),
  branchId: uuid("branch_id").references(() => branches.id).notNull(),
  productId: uuid("product_id").references(() => products.id).notNull(),
  minQty: numeric("min_qty", { precision: 12, scale: 4 }).notNull().default("0"),
});

export const productStocks = pgTable("product_stocks", {
  id: uuid("id").primaryKey().defaultRandom(),
  branchId: uuid("branch_id").references(() => branches.id).notNull(),
  productId: uuid("product_id").references(() => products.id).notNull(),
  currentQty: numeric("current_qty", { precision: 12, scale: 4 }).notNull().default("0"),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  branchProductIdx: uniqueIndex("idx_product_stocks_branch_product").on(table.branchId, table.productId),
  branchIdx: index("idx_product_stocks_branch").on(table.branchId),
  qtyIdx: index("idx_product_stocks_qty").on(table.branchId, table.currentQty),
}));
