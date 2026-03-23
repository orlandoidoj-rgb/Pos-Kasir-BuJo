import { pgEnum } from "drizzle-orm/pg-core";

export const stockReferenceTypeEnum = pgEnum("stock_reference_type", [
  "pos_sale",
  "manual_in",
  "manual_out",
  "adjustment",
  "purchase",
  "transfer_in",
  "transfer_out",
]);
