import { relations } from "drizzle-orm";
import { partners } from "../schema/crm.schema";
import { posOrders } from "../schema/pos.schema";
import { purchaseOrders } from "../schema/procurement.schema";

export const partnerRelations = relations(partners, ({ many }) => ({
  posOrders: many(posOrders),
  purchaseOrders: many(purchaseOrders),
}));
