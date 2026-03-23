import { pgEnum } from "drizzle-orm/pg-core";

export const purchaseStatusEnum = pgEnum("purchase_status", ["Draft", "Confirmed", "Received"]);
export const transferStatusEnum = pgEnum("transfer_status", ["Draft", "In Transit", "Received"]);
