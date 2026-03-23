import { eq, sql } from "drizzle-orm";
import { onlineCustomers } from "@warung-bujo/database";

/**
 * normalizePhone
 * Normalize phone number to 628xxx format.
 */
export function normalizePhone(phone: string): string {
  let clean = phone.replace(/\D/g, "");
  if (clean.startsWith("0")) {
    clean = "62" + clean.slice(1);
  } else if (clean.startsWith("8")) {
    clean = "62" + clean;
  }
  return clean;
}

export async function getCustomerById(db: any, id: string) {
  const [customer] = await db
    .select()
    .from(onlineCustomers)
    .where(eq(onlineCustomers.id, id));
  return customer;
}

export async function getCustomerByPhone(db: any, phone: string) {
  const normalized = normalizePhone(phone);
  const [customer] = await db
    .select()
    .from(onlineCustomers)
    .where(eq(onlineCustomers.phone, normalized));
  return customer;
}

export async function registerOrFindCustomer(
  db: any,
  name: string,
  phone: string,
  email: string
) {
  const normalized = normalizePhone(phone);
  const existing = await getCustomerByPhone(db, normalized);

  if (existing) {
    const [updated] = await db
      .update(onlineCustomers)
      .set({
        name,
        email,
        // updatedAt if we had it, but simplified schema doesn't have it explicitly now (only createdAt)
      })
      .where(eq(onlineCustomers.id, existing.id))
      .returning();
    return { ...updated, isNew: false };
  }

  const [inserted] = await db
    .insert(onlineCustomers)
    .values({
      name,
      phone: normalized,
      email,
    })
    .returning();
  return { ...inserted, isNew: true };
}

export async function updateCustomerAddress(
  db: any,
  customerId: string,
  address: string,
  addressNote?: string
) {
  await db
    .update(onlineCustomers)
    .set({
      address,
      addressNote,
    })
    .where(eq(onlineCustomers.id, customerId));
}

export async function incrementCustomerStats(
  db: any,
  customerId: string,
  orderTotal: number
) {
  await db
    .update(onlineCustomers)
    .set({
      totalOrders: sql`${onlineCustomers.totalOrders} + 1`,
      totalSpent: sql`${onlineCustomers.totalSpent} + ${orderTotal}`,
      lastOrderAt: new Date(),
    })
    .where(eq(onlineCustomers.id, customerId));
}
