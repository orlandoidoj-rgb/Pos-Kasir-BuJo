import { pgTable, uuid, varchar, numeric, timestamp, text, index } from "drizzle-orm/pg-core";
import { accountTypeEnum } from "../enums/accounting.enums";

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
}, (table) => ({
  dateIdx: index("idx_journal_entries_date").on(table.date),
  refIdx: index("idx_journal_entries_reference").on(table.reference),
}));

export const journalItems = pgTable("journal_items", {
  id: uuid("id").primaryKey().defaultRandom(),
  journalEntryId: uuid("journal_entry_id").references(() => journalEntries.id).notNull(),
  accountId: uuid("account_id").references(() => accounts.id).notNull(),
  debit: numeric("debit", { precision: 12, scale: 2 }).notNull().default("0"),
  credit: numeric("credit", { precision: 12, scale: 2 }).notNull().default("0"),
}, (table) => ({
  entryIdx: index("idx_journal_items_entry").on(table.journalEntryId),
  accountIdx: index("idx_journal_items_account").on(table.accountId),
}));
