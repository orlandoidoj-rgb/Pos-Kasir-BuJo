import {
  pgTable,
  uuid,
  text,
  varchar,
  boolean,
  numeric,
  timestamp,
  pgEnum,
  integer,
  index,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// -----------------------------------------------------------------------------
// Enums
// -----------------------------------------------------------------------------

export const userRoleEnum = pgEnum("user_role", ["master", "admin", "cashier", "customer", "driver"]);

export const orderTypeEnum = pgEnum("order_type", [
  "Dine-in",
  "Take-away",
  "Shopee",
  "Gofood",
  "Grab",
  "Pesanan",
]);

export const orderStatusEnum = pgEnum("order_status", [
  "Pending",
  "Paid",
  "Cancelled",
]);

export const paymentMethodEnum = pgEnum("payment_method", [
  "Cash",
  "Transfer",
  "Qris",
  "Debit",
]);

export const stockReferenceTypeEnum = pgEnum("stock_reference_type", [
  "pos_sale",
  "manual_in",
  "manual_out",
  "adjustment",
  "purchase",      // Belanja bahan baku dari supplier
  "transfer_in",   // Terima stok dari cabang lain
  "transfer_out",  // Kirim stok ke cabang lain
]);

export const accountTypeEnum = pgEnum("account_type", [
  "asset",
  "liability",
  "equity",
  "revenue",
  "expense",
]);

export const purchaseStatusEnum = pgEnum("purchase_status", [
  "Draft",
  "Confirmed",
  "Received",
]);

export const transferStatusEnum = pgEnum("transfer_status", [
  "Draft",
  "In Transit",
  "Received",
]);

// -----------------------------------------------------------------------------
// Auth & Config
// -----------------------------------------------------------------------------

export const branches = pgTable("branches", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 255 }).notNull(),
  address: text("address"),
  phone: varchar("phone", { length: 50 }),
  isHq: boolean("is_hq").default(false).notNull(), // apakah ini Pusat/HQ
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  role: userRoleEnum("role").notNull(),
  phoneNumber: varchar("phone_number", { length: 20 }),
  email: varchar("email", { length: 255 }),
  passwordHash: text("password_hash"),
  googleId: varchar("google_id", { length: 255 }),
  fullName: varchar("full_name", { length: 255 }).notNull().default(""),
  points: integer("points").default(0).notNull(),
  branchId: uuid("branch_id").references(() => branches.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  phoneIdx: uniqueIndex("idx_users_phone").on(table.phoneNumber),
  emailIdx: uniqueIndex("idx_users_email").on(table.email),
  googleIdx: uniqueIndex("idx_users_google_id").on(table.googleId),
}));

// -----------------------------------------------------------------------------
// CRM
// -----------------------------------------------------------------------------

export const partners = pgTable("partners", {
  id: uuid("id").primaryKey().defaultRandom(),
  uniqueId: varchar("unique_id", { length: 50 }).notNull().unique(),
  name: varchar("name", { length: 255 }).notNull(),
  phone: varchar("phone", { length: 50 }),
  isCustomer: boolean("is_customer").default(false).notNull(),
  isSupplier: boolean("is_supplier").default(false).notNull(),
});

// -----------------------------------------------------------------------------
// Catalog & BOM
// -----------------------------------------------------------------------------

export const categories = pgTable("categories", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 100 }).notNull(),
});

export const products = pgTable("products", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 255 }).notNull(),
  image: text("image"),
  unit: varchar("unit", { length: 50 }).notNull().default("pcs"), // satuan: Kg, Liter, Pcs, dll
  price: numeric("price", { precision: 12, scale: 2 }).notNull().default("0"),
  purchasePrice: numeric("purchase_price", { precision: 12, scale: 2 }).notNull().default("0"),
  categoryId: uuid("category_id").references(() => categories.id),
  isSellable: boolean("is_sellable").default(true).notNull(),
  isRawMaterial: boolean("is_raw_material").default(false).notNull(),
});

export const boms = pgTable("boms", {
  id: uuid("id").primaryKey().defaultRandom(),
  productId: uuid("product_id").references(() => products.id),       // Produk jadi
  rawMaterialId: uuid("raw_material_id").references(() => products.id), // Bahan Mentah
  qtyRequired: numeric("qty_required", { precision: 12, scale: 4 }).notNull(),
});

// -----------------------------------------------------------------------------
// POS Transactions
// -----------------------------------------------------------------------------

export const posOrders = pgTable("pos_orders", {
  id: uuid("id").primaryKey().defaultRandom(),
  branchId: uuid("branch_id").references(() => branches.id).notNull(),
  userId: uuid("user_id").references(() => users.id).notNull(),
  partnerId: uuid("partner_id").references(() => partners.id),
  orderType: orderTypeEnum("order_type").notNull(),
  status: orderStatusEnum("status").notNull().default("Pending"),
  total: numeric("total", { precision: 12, scale: 2 }).notNull().default("0"),
  discount: numeric("discount", { precision: 12, scale: 2 }).notNull().default("0"),
  paymentMethod: paymentMethodEnum("payment_method"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const posOrderLines = pgTable("pos_order_lines", {
  id: uuid("id").primaryKey().defaultRandom(),
  orderId: uuid("order_id").references(() => posOrders.id).notNull(),
  productId: uuid("product_id").references(() => products.id).notNull(),
  qty: numeric("qty", { precision: 12, scale: 4 }).notNull(),
  price: numeric("price", { precision: 12, scale: 2 }).notNull(),
  subtotal: numeric("subtotal", { precision: 12, scale: 2 }).notNull(),
});

export const vouchers = pgTable("vouchers", {
  id: uuid("id").primaryKey().defaultRandom(),
  code: varchar("code", { length: 50 }).notNull().unique(),
  discountType: varchar("discount_type", { length: 20 }).notNull(),
  value: numeric("value", { precision: 12, scale: 2 }).notNull(),
  quota: integer("quota").notNull().default(0),
  validUntil: timestamp("valid_until"),
});

// ─── Promos & Vouchers (IAM/CRM) ─────────────────────────────────────────────

export const promosVouchers = pgTable("promos_vouchers", {
  id: uuid("id").primaryKey().defaultRandom(),
  code: varchar("code", { length: 50 }).notNull().unique(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  discountType: varchar("discount_type", { length: 20 }).notNull(),
  value: numeric("value", { precision: 12, scale: 2 }).notNull(),
  minOrder: numeric("min_order", { precision: 12, scale: 2 }).default("0"),
  maxDiscount: numeric("max_discount", { precision: 12, scale: 2 }).default("0"),
  usageLimit: integer("usage_limit").default(0).notNull(),
  usageCount: integer("usage_count").default(0).notNull(),
  validFrom: timestamp("valid_from"),
  validUntil: timestamp("valid_until"),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const userVouchers = pgTable("user_vouchers", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => users.id).notNull(),
  promoVoucherId: uuid("promo_voucher_id").references(() => promosVouchers.id).notNull(),
  isUsed: boolean("is_used").default(false).notNull(),
  usedAt: timestamp("used_at"),
  claimedAt: timestamp("claimed_at").defaultNow().notNull(),
}, (table) => ({
  userIdx: index("idx_user_vouchers_user").on(table.userId),
  promoIdx: index("idx_user_vouchers_promo").on(table.promoVoucherId),
}));

// -----------------------------------------------------------------------------
// Inventory
// -----------------------------------------------------------------------------

export const stockMoves = pgTable("stock_moves", {
  id: uuid("id").primaryKey().defaultRandom(),
  branchId: uuid("branch_id").references(() => branches.id).notNull(),
  productId: uuid("product_id").references(() => products.id).notNull(),
  qty: numeric("qty", { precision: 12, scale: 4 }).notNull(), // + masuk, - keluar
  referenceType: stockReferenceTypeEnum("reference_type").notNull(),
  referenceId: uuid("reference_id"), // FK ke pos_orders, purchase_orders, atau stock_transfers
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Ambang batas minimum stok per produk per cabang
export const stockMinLevels = pgTable("stock_min_levels", {
  id: uuid("id").primaryKey().defaultRandom(),
  branchId: uuid("branch_id").references(() => branches.id).notNull(),
  productId: uuid("product_id").references(() => products.id).notNull(),
  minQty: numeric("min_qty", { precision: 12, scale: 4 }).notNull().default("0"),
});

// -----------------------------------------------------------------------------
// Pengadaan / Supply Chain
// -----------------------------------------------------------------------------

// Purchase Order: Belanja bahan baku dari supplier
export const purchaseOrders = pgTable("purchase_orders", {
  id: uuid("id").primaryKey().defaultRandom(),
  poNumber: varchar("po_number", { length: 50 }).notNull().unique(), // PO-2026-001
  supplierId: uuid("supplier_id").references(() => partners.id),
  branchId: uuid("branch_id").references(() => branches.id).notNull(), // cabang penerima (biasanya HQ)
  status: purchaseStatusEnum("status").notNull().default("Draft"),
  totalAmount: numeric("total_amount", { precision: 12, scale: 2 }).notNull().default("0"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  receivedAt: timestamp("received_at"),
});

export const purchaseOrderLines = pgTable("purchase_order_lines", {
  id: uuid("id").primaryKey().defaultRandom(),
  purchaseOrderId: uuid("purchase_order_id").references(() => purchaseOrders.id).notNull(),
  productId: uuid("product_id").references(() => products.id).notNull(),
  qty: numeric("qty", { precision: 12, scale: 4 }).notNull(),
  unitPrice: numeric("unit_price", { precision: 12, scale: 2 }).notNull(),
  subtotal: numeric("subtotal", { precision: 12, scale: 2 }).notNull(),
});

// Stock Transfer: Distribusi bahan baku dari HQ ke Cabang
export const stockTransfers = pgTable("stock_transfers", {
  id: uuid("id").primaryKey().defaultRandom(),
  transferNumber: varchar("transfer_number", { length: 50 }).notNull().unique(), // STR-2026-001
  fromBranchId: uuid("from_branch_id").references(() => branches.id).notNull(),
  toBranchId: uuid("to_branch_id").references(() => branches.id).notNull(),
  status: transferStatusEnum("status").notNull().default("Draft"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  receivedAt: timestamp("received_at"),
});

export const stockTransferLines = pgTable("stock_transfer_lines", {
  id: uuid("id").primaryKey().defaultRandom(),
  transferId: uuid("transfer_id").references(() => stockTransfers.id).notNull(),
  productId: uuid("product_id").references(() => products.id).notNull(),
  qty: numeric("qty", { precision: 12, scale: 4 }).notNull(),
});

// -----------------------------------------------------------------------------
// Accounting (SAK Indonesia)
// -----------------------------------------------------------------------------

export const accounts = pgTable("accounts", {
  id: uuid("id").primaryKey().defaultRandom(),
  code: varchar("code", { length: 20 }).notNull().unique(),
  name: varchar("name", { length: 255 }).notNull(),
  type: accountTypeEnum("type").notNull(),
});

export const journalEntries = pgTable("journal_entries", {
  id: uuid("id").primaryKey().defaultRandom(),
  date: timestamp("date").defaultNow().notNull(),
  reference: varchar("reference", { length: 100 }),
  description: text("description"),
});

export const journalItems = pgTable("journal_items", {
  id: uuid("id").primaryKey().defaultRandom(),
  journalEntryId: uuid("journal_entry_id").references(() => journalEntries.id).notNull(),
  accountId: uuid("account_id").references(() => accounts.id).notNull(),
  debit: numeric("debit", { precision: 12, scale: 2 }).notNull().default("0"),
  credit: numeric("credit", { precision: 12, scale: 2 }).notNull().default("0"),
});

// -----------------------------------------------------------------------------
// Drizzle Relations
// -----------------------------------------------------------------------------

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

export const partnerRelations = relations(partners, ({ many }) => ({
  posOrders: many(posOrders),
  purchaseOrders: many(purchaseOrders),
}));

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

export const orderRelations = relations(posOrders, ({ one, many }) => ({
  branch: one(branches, { fields: [posOrders.branchId], references: [branches.id] }),
  user: one(users, { fields: [posOrders.userId], references: [users.id] }),
  partner: one(partners, { fields: [posOrders.partnerId], references: [partners.id] }),
  lines: many(posOrderLines),
}));

export const orderLineRelations = relations(posOrderLines, ({ one }) => ({
  order: one(posOrders, { fields: [posOrderLines.orderId], references: [posOrders.id] }),
  product: one(products, { fields: [posOrderLines.productId], references: [products.id] }),
}));

export const stockMoveRelations = relations(stockMoves, ({ one }) => ({
  branch: one(branches, { fields: [stockMoves.branchId], references: [branches.id] }),
  product: one(products, { fields: [stockMoves.productId], references: [products.id] }),
}));

export const stockMinLevelRelations = relations(stockMinLevels, ({ one }) => ({
  branch: one(branches, { fields: [stockMinLevels.branchId], references: [branches.id] }),
  product: one(products, { fields: [stockMinLevels.productId], references: [products.id] }),
}));

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

export const accountRelations = relations(accounts, ({ many }) => ({
  journalItems: many(journalItems),
}));

export const journalEntryRelations = relations(journalEntries, ({ many }) => ({
  items: many(journalItems),
}));

export const journalItemRelations = relations(journalItems, ({ one }) => ({
  entry: one(journalEntries, { fields: [journalItems.journalEntryId], references: [journalEntries.id] }),
  account: one(accounts, { fields: [journalItems.accountId], references: [accounts.id] }),
}));

// ─── Promo & Voucher Relations ───────────────────────────────────────────────

export const promosVouchersRelations = relations(promosVouchers, ({ many }) => ({
  userVouchers: many(userVouchers),
}));

export const userVouchersRelations = relations(userVouchers, ({ one }) => ({
  user: one(users, { fields: [userVouchers.userId], references: [users.id] }),
  promoVoucher: one(promosVouchers, { fields: [userVouchers.promoVoucherId], references: [promosVouchers.id] }),
}));
