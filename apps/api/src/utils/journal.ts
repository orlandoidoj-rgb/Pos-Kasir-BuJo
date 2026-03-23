import { inArray } from "drizzle-orm";
import { accounts, journalEntries, journalItems } from "@warung-bujo/database/src/schema/accounting.schema";

export interface JournalLine {
  accountCode: string;
  debit: number;
  credit: number;
}

export async function createJournalEntry(
  tx: any,
  reference: string,
  description: string,
  lines: JournalLine[]
): Promise<string> {
  // Validasi double-entry
  const totalDebit = lines.reduce((sum, l) => sum + l.debit, 0);
  const totalCredit = lines.reduce((sum, l) => sum + l.credit, 0);
  if (Math.abs(totalDebit - totalCredit) > 0.01) {
    throw new Error(`Journal not balanced: debit=${totalDebit}, credit=${totalCredit}`);
  }

  // Fetch account IDs
  const codes = [...new Set(lines.map(l => l.accountCode))];
  const dbAccounts = await tx
    .select()
    .from(accounts)
    .where(inArray(accounts.code, codes));

  const accountMap = new Map(dbAccounts.map((a: any) => [a.code, a.id]));

  for (const code of codes) {
    if (!accountMap.has(code)) {
      throw new Error(`Account ${code} not found in chart of accounts`);
    }
  }

  // Insert Header
  const [entry] = await tx
    .insert(journalEntries)
    .values({ reference, description })
    .returning();

  // Insert Items
  const itemsToInsert = lines
    .filter(l => l.debit > 0 || l.credit > 0)
    .map(l => ({
      journalEntryId: entry.id,
      accountId: accountMap.get(l.accountCode)!,
      debit: String(l.debit),
      credit: String(l.credit),
    }));

  if (itemsToInsert.length > 0) {
    await tx.insert(journalItems).values(itemsToInsert);
  }

  return entry.id;
}
