import { pgTable, uuid, varchar, boolean } from "drizzle-orm/pg-core";

export const partners = pgTable("partners", {
  id: uuid("id").primaryKey().defaultRandom(),
  uniqueId: varchar("unique_id", { length: 50 }).notNull().unique(),
  name: varchar("name", { length: 255 }).notNull(),
  phone: varchar("phone", { length: 50 }),
  isCustomer: boolean("is_customer").default(false).notNull(),
  isSupplier: boolean("is_supplier").default(false).notNull(),
});
