import { pgTable, uuid, varchar, boolean, numeric, text, timestamp, index } from "drizzle-orm/pg-core";

export const categories = pgTable("categories", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 100 }).notNull(),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const products = pgTable("products", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 255 }).notNull(),
  image: text("image"),
  unit: varchar("unit", { length: 50 }).notNull().default("pcs"),
  price: numeric("price", { precision: 12, scale: 2 }).notNull().default("0"),
  purchasePrice: numeric("purchase_price", { precision: 12, scale: 2 }).notNull().default("0"),
  categoryId: uuid("category_id").references(() => categories.id),
  isSellable: boolean("is_sellable").default(true).notNull(),
  isRawMaterial: boolean("is_raw_material").default(false).notNull(),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  categoryIdx: index("idx_products_category").on(table.categoryId),
}));

export const boms = pgTable("boms", {
  id: uuid("id").primaryKey().defaultRandom(),
  productId: uuid("product_id").references(() => products.id),
  rawMaterialId: uuid("raw_material_id").references(() => products.id),
  qtyRequired: numeric("qty_required", { precision: 12, scale: 4 }).notNull(),
}, (table) => ({
  productIdx: index("idx_boms_product").on(table.productId),
  rawMaterialIdx: index("idx_boms_raw_material").on(table.rawMaterialId),
}));
