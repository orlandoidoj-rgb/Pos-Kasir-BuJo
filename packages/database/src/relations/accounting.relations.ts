import { relations } from "drizzle-orm";
import { accounts, journalEntries, journalItems } from "../schema/accounting.schema";

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
