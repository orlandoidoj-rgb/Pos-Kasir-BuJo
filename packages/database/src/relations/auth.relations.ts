import { relations } from "drizzle-orm";
import { branches, users } from "../schema/auth.schema";
import { posOrders } from "../schema/pos.schema";
import { stockMoves, stockMinLevels } from "../schema/inventory.schema";
import { purchaseOrders, stockTransfers } from "../schema/procurement.schema";
import { userVouchers } from "../schema/promo.schema";

export const branchRelations = relations(branches, ({ many }) => ({
  users: many(users),
  posOrders: many(posOrders),
  stockMoves: many(stockMoves),
  stockMinLevels: many(stockMinLevels),
  purchaseOrders: many(purchaseOrders),
  transfersFrom: many(stockTransfers, { relationName: "fromBranch" }),
  transfersTo: many(stockTransfers, { relationName: "toBranch" }),
}));

export const userRelations = relations(users, ({ one, many }) => ({
  branch: one(branches, { fields: [users.branchId], references: [branches.id] }),
  posOrders: many(posOrders),
  userVouchers: many(userVouchers),
}));
