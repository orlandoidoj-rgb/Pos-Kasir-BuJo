import { pgTable, uuid, varchar, boolean, text, jsonb, numeric, integer, timestamp, index, uniqueIndex } from "drizzle-orm/pg-core";
import { branches } from "./auth.schema";
import { products } from "./catalog.schema";
import { posOrders, vouchers } from "./pos.schema";
import { onlineOrderStatusEnum, onlineFulfillmentEnum } from "../enums/online.enums";

export const onlineStoreConfig = pgTable("online_store_config", {
  id: uuid("id").primaryKey().defaultRandom(),
  branchId: uuid("branch_id").references(() => branches.id).notNull().unique(),
  isEnabled: boolean("is_enabled").default(false).notNull(),
  slug: varchar("slug", { length: 100 }).notNull().unique(),
  storeName: varchar("store_name", { length: 255 }).notNull(),
  description: text("description"),
  bannerImage: text("banner_image"),
  logoImage: text("logo_image"),
  operatingHours: jsonb("operating_hours"), // { mon: { open: "08:00", close: "21:00" }, ... }
  deliveryEnabled: boolean("delivery_enabled").default(false).notNull(),
  pickupEnabled: boolean("pickup_enabled").default(true).notNull(),
  deliveryRadius: numeric("delivery_radius", { precision: 5, scale: 1 }), // km
  deliveryFee: numeric("delivery_fee", { precision: 12, scale: 2 }),
  minOrderAmount: numeric("min_order_amount", { precision: 12, scale: 2 }).default("0"),
  estimatedPrepTime: integer("estimated_prep_time").default(15), // menit
  whatsappNumber: varchar("whatsapp_number", { length: 20 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const onlineCustomers = pgTable("online_customers", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 255 }).notNull(),
  phone: varchar("phone", { length: 20 }).notNull(), // Format: 628xxxxx, UNIQUE identifier
  email: varchar("email", { length: 255 }).notNull(), // WAJIB — Untuk Midtrans invoice

  // Alamat delivery (diisi saat checkout, bukan saat register)
  address: text("address"),
  addressNote: text("address_note"), // Patokan

  // Stats
  totalOrders: integer("total_orders").default(0).notNull(),
  totalSpent: numeric("total_spent", { precision: 12, scale: 2 }).default("0"),

  createdAt: timestamp("created_at").defaultNow().notNull(),
  lastOrderAt: timestamp("last_order_at"),
}, (table) => ({
  phoneIdx: uniqueIndex("idx_online_customers_phone").on(table.phone),
  emailIdx: index("idx_online_customers_email").on(table.email),
}));

export const onlineOrders = pgTable("online_orders", {
  id: uuid("id").primaryKey().defaultRandom(),
  orderNumber: varchar("order_number", { length: 50 }).notNull().unique(),
  branchId: uuid("branch_id").references(() => branches.id).notNull(),
  customerId: uuid("customer_id").references(() => onlineCustomers.id).notNull(),

  // Status & Fulfillment
  status: onlineOrderStatusEnum("status").notNull().default("Pending"),
  fulfillmentType: onlineFulfillmentEnum("fulfillment_type").notNull(),

  // Pickup
  pickupScheduledAt: timestamp("pickup_scheduled_at"),

  // Delivery
  deliveryAddress: text("delivery_address"),
  deliveryLatitude: numeric("delivery_latitude", { precision: 10, scale: 7 }),
  deliveryLongitude: numeric("delivery_longitude", { precision: 10, scale: 7 }),
  deliveryFee: numeric("delivery_fee", { precision: 12, scale: 2 }).default("0"),
  deliveryNotes: text("delivery_notes"),
  driverName: varchar("driver_name", { length: 255 }),
  driverPhone: varchar("driver_phone", { length: 20 }),

  // Amounts
  subtotal: numeric("subtotal", { precision: 12, scale: 2 }).notNull(),
  discount: numeric("discount", { precision: 12, scale: 2 }).default("0"),
  total: numeric("total", { precision: 12, scale: 2 }).notNull(),

  // Payment
  paymentMethod: varchar("payment_method", { length: 50 }),
  paymentStatus: varchar("payment_status", { length: 20 }).default("unpaid"),
  midtransOrderId: varchar("midtrans_order_id", { length: 100 }),
  midtransTransactionId: varchar("midtrans_transaction_id", { length: 100 }),
  paidAt: timestamp("paid_at"),

  // Voucher
  voucherId: uuid("voucher_id").references(() => vouchers.id),
  voucherCode: varchar("voucher_code", { length: 50 }),

  // Notes
  customerNotes: text("customer_notes"),

  // Timestamps
  createdAt: timestamp("created_at").defaultNow().notNull(),
  confirmedAt: timestamp("confirmed_at"),
  preparedAt: timestamp("prepared_at"),
  readyAt: timestamp("ready_at"),
  completedAt: timestamp("completed_at"),
  cancelledAt: timestamp("cancelled_at"),
  cancelReason: text("cancel_reason"),

  // Link ke POS order
  posOrderId: uuid("pos_order_id").references(() => posOrders.id),
}, (table) => ({
  branchDateIdx: index("idx_online_orders_branch_date").on(table.branchId, table.createdAt),
  customerIdx: index("idx_online_orders_customer").on(table.customerId),
  statusIdx: index("idx_online_orders_status").on(table.status),
  orderNumberIdx: uniqueIndex("idx_online_orders_number").on(table.orderNumber),
  paymentStatusIdx: index("idx_online_orders_payment").on(table.paymentStatus),
}));

export const onlineOrderLines = pgTable("online_order_lines", {
  id: uuid("id").primaryKey().defaultRandom(),
  orderId: uuid("order_id").references(() => onlineOrders.id).notNull(),
  productId: uuid("product_id").references(() => products.id).notNull(),
  productName: varchar("product_name", { length: 255 }).notNull(),
  qty: integer("qty").notNull(),
  price: numeric("price", { precision: 12, scale: 2 }).notNull(),
  subtotal: numeric("subtotal", { precision: 12, scale: 2 }).notNull(),
  notes: text("notes"),
}, (table) => ({
  orderIdx: index("idx_online_order_lines_order").on(table.orderId),
}));

export const onlineOrderStatusLog = pgTable("online_order_status_log", {
  id: uuid("id").primaryKey().defaultRandom(),
  orderId: uuid("order_id").references(() => onlineOrders.id).notNull(),
  fromStatus: onlineOrderStatusEnum("from_status"),
  toStatus: onlineOrderStatusEnum("to_status").notNull(),
  changedBy: varchar("changed_by", { length: 255 }),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  orderIdx: index("idx_online_status_log_order").on(table.orderId),
  dateIdx: index("idx_online_status_log_date").on(table.createdAt),
}));
