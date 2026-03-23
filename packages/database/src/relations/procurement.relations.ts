import { relations } from "drizzle-orm";
import { purchaseOrders, purchaseOrderLines, stockTransfers, stockTransferLines } from "../schema/procurement.schema";
import { branches } from "../schema/auth.schema";
import { partners } from "../schema/crm.schema";
import { products } from "../schema/catalog.schema";

export const purchaseOrderRelations = relations(purchaseOrders, ({ one, many }) => ({
  supplier: one(partners, { fields: [purchaseOrders.supplierId], references: [partners.id] }),
  branch: one(branches, { fields: [purchaseOrders.branchId], references: [branches.id] }),
  lines: many(purchaseOrderLines),
}));

export const purchaseOrderLineRelations = relations(purchaseOrderLines, ({ one }) => ({
  purchaseOrder: one(purchaseOrders, { fields: [purchaseOrderLines.purchaseOrderId], references: [purchaseOrders.id] }),
  product: one(products, { fields: [purchaseOrderLines.productId], references: [products.id] }),
}));

export const stockTransferRelations = relations(stockTransfers, ({ one, many }) => ({
  fromBranch: one(branches, { fields: [stockTransfers.fromBranchId], references: [branches.id], relationName: "fromBranch" }),
  toBranch: one(branches, { fields: [stockTransfers.toBranchId], references: [branches.id], relationName: "toBranch" }),
  lines: many(stockTransferLines),
}));

export const stockTransferLineRelations = relations(stockTransferLines, ({ one }) => ({
  transfer: one(stockTransfers, { fields: [stockTransferLines.transferId], references: [stockTransfers.id] }),
  product: one(products, { fields: [stockTransferLines.productId], references: [products.id] }),
}));
