import { pgEnum } from "drizzle-orm/pg-core";

export const orderTypeEnum = pgEnum("order_type", ["Dine-in", "Take-away", "Shopee", "Gofood", "Grab", "Pesanan"]);
export const orderStatusEnum = pgEnum("order_status", ["Pending", "Paid", "Cancelled"]);
export const paymentMethodEnum = pgEnum("payment_method", ["Cash", "Transfer", "Qris", "Debit"]);
