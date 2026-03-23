import { relations } from "drizzle-orm";
import { stockMoves, stockMinLevels, productStocks } from "../schema/inventory.schema";
import { branches } from "../schema/auth.schema";
import { products } from "../schema/catalog.schema";

export const stockMoveRelations = relations(stockMoves, ({ one }) => ({
  branch: one(branches, { fields: [stockMoves.branchId], references: [branches.id] }),
  product: one(products, { fields: [stockMoves.productId], references: [products.id] }),
}));

export const stockMinLevelRelations = relations(stockMinLevels, ({ one }) => ({
  branch: one(branches, { fields: [stockMinLevels.branchId], references: [branches.id] }),
  product: one(products, { fields: [stockMinLevels.productId], references: [products.id] }),
}));

export const productStocksRelations = relations(productStocks, ({ one }) => ({
  branch: one(branches, { fields: [productStocks.branchId], references: [branches.id] }),
  product: one(products, { fields: [productStocks.productId], references: [products.id] }),
}));
