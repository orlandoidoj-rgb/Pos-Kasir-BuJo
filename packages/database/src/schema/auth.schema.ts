import { pgTable, uuid, varchar, boolean, timestamp, text, integer, uniqueIndex } from "drizzle-orm/pg-core";
import { userRoleEnum } from "../enums/auth.enums";

export const branches = pgTable("branches", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 255 }).notNull(),
  address: text("address"),
  phone: varchar("phone", { length: 50 }),
  isHq: boolean("is_hq").default(false).notNull(), // apakah ini Pusat/HQ
  createdAt: timestamp("created_at").defaultNow().notNull(),
  // updatedAt: timestamp("updated_at").defaultNow().notNull(), // Commented out to match existing DB schema
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
  isActive: boolean("is_active").default(true).notNull(),
  emailVerified: boolean("email_verified").default(false).notNull(),
  photoUrl: text("photo_url"),
  address: text("address"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  phoneIdx: uniqueIndex("idx_users_phone").on(table.phoneNumber),
  emailIdx: uniqueIndex("idx_users_email").on(table.email),
  googleIdx: uniqueIndex("idx_users_google_id").on(table.googleId),
}));
