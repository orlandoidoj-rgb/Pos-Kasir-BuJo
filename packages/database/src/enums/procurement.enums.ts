import { pgEnum } from "drizzle-orm/pg-core";

export const purchaseStatusEnum = pgEnum("purchase_status", ["Draft", "Confirmed", "In Transit", "Received", "Completed", "Cancelled"]);
export const transferStatusEnum = pgEnum("transfer_status", ["Draft", "In Transit", "Received"]);
