import { relations } from "drizzle-orm";
import { categories, products, boms } from "../schema/catalog.schema";
import { stockMoves, stockMinLevels } from "../schema/inventory.schema";
import { posOrderLines } from "../schema/pos.schema";
import { purchaseOrderLines, stockTransferLines } from "../schema/procurement.schema";

export const categoryRelations = relations(categories, ({ many }) => ({
  products: many(products),
}));

export const productRelations = relations(products, ({ one, many }) => ({
  category: one(categories, { fields: [products.categoryId], references: [categories.id] }),
  boms: many(boms, { relationName: "productBom" }),
  usedInBoms: many(boms, { relationName: "rawMaterialBom" }),
  stockMoves: many(stockMoves),
  orderLines: many(posOrderLines),
  purchaseLines: many(purchaseOrderLines),
  transferLines: many(stockTransferLines),
  stockMinLevels: many(stockMinLevels),
}));

export const bomRelations = relations(boms, ({ one }) => ({
  product: one(products, { fields: [boms.productId], references: [products.id], relationName: "productBom" }),
  rawMaterial: one(products, { fields: [boms.rawMaterialId], references: [products.id], relationName: "rawMaterialBom" }),
}));
