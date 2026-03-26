import { eq, and, desc, sql } from 'drizzle-orm';
import { drivers, onlineOrders, onlineOrderLines, onlineOrderStatusLog, onlineCustomers } from '@warung-bujo/database';

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function getDriversByBranch(db: any, branchId: string) {
  if (!branchId || !UUID_REGEX.test(branchId)) return [];
  return db.select().from(drivers).where(eq(drivers.branchId, branchId)).orderBy(drivers.name);
}

export async function getDriverById(db: any, driverId: string) {
  const [driver] = await db.select().from(drivers).where(eq(drivers.id, driverId));
  return driver || null;
}

export async function createDriver(db: any, data: {
  name: string; phone: string; email?: string; branchId: string;
}) {
  const [driver] = await db.insert(drivers).values({
    name: data.name,
    phone: data.phone,
    email: data.email,
    branchId: data.branchId,
    status: 'offline',
  }).returning();
  return driver;
}

export async function updateDriver(db: any, driverId: string, data: {
  name?: string; phone?: string; email?: string; status?: 'available' | 'busy' | 'offline';
}) {
  const [driver] = await db
    .update(drivers)
    .set(data)
    .where(eq(drivers.id, driverId))
    .returning();
  return driver;
}

export async function deleteDriver(db: any, driverId: string) {
  await db.delete(drivers).where(eq(drivers.id, driverId));
}

export async function loginDriver(db: any, phone: string) {
  // Normalize phone: strip non-digits, ensure starts with 62
  let normalized = phone.replace(/\D/g, '');
  if (normalized.startsWith('0')) normalized = '62' + normalized.slice(1);
  if (!normalized.startsWith('62')) normalized = '62' + normalized;

  const [driver] = await db
    .select()
    .from(drivers)
    .where(eq(drivers.phone, normalized));

  return driver || null;
}

export async function getDriverOrders(db: any, driverId: string) {
  const orders = await db
    .select()
    .from(onlineOrders)
    .where(
      and(
        eq(onlineOrders.driverId, driverId),
        eq(onlineOrders.status, 'Out for Delivery')
      )
    )
    .orderBy(desc(onlineOrders.createdAt));

  const result = [];
  for (const order of orders) {
    const lines = await db
      .select()
      .from(onlineOrderLines)
      .where(eq(onlineOrderLines.orderId, order.id));

    const [customer] = await db
      .select()
      .from(onlineCustomers)
      .where(eq(onlineCustomers.id, order.customerId));

    result.push({ ...order, items: lines, customer });
  }
  return result;
}

export async function getDriverOrderHistory(db: any, driverId: string, limit = 10) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const orders = await db
    .select()
    .from(onlineOrders)
    .where(
      and(
        eq(onlineOrders.driverId, driverId),
        eq(onlineOrders.status, 'Completed'),
        sql`DATE(${onlineOrders.completedAt}) = CURRENT_DATE`
      )
    )
    .orderBy(desc(onlineOrders.completedAt))
    .limit(limit);

  return orders;
}

export async function setDriverStatus(db: any, driverId: string, status: 'available' | 'busy' | 'offline') {
  const [driver] = await db
    .update(drivers)
    .set({ status })
    .where(eq(drivers.id, driverId))
    .returning();
  return driver;
}

export async function completeDriverDelivery(db: any, driverId: string, orderId: string) {
  return await db.transaction(async (tx: any) => {
    const [order] = await tx
      .select()
      .from(onlineOrders)
      .where(and(eq(onlineOrders.id, orderId), eq(onlineOrders.driverId, driverId)));

    if (!order) throw new Error('Order tidak ditemukan atau bukan milik driver ini');
    if (order.status !== 'Out for Delivery') throw new Error('Order tidak dalam status pengiriman');

    // Update order to completed
    await tx.update(onlineOrders)
      .set({ status: 'Completed', completedAt: new Date() })
      .where(eq(onlineOrders.id, orderId));

    // Log status change
    await tx.insert(onlineOrderStatusLog).values({
      orderId,
      fromStatus: 'Out for Delivery',
      toStatus: 'Completed',
      changedBy: `driver:${driverId}`,
      notes: 'Pesanan berhasil diantar',
    });

    // Free driver
    await tx.update(drivers)
      .set({ status: 'available', currentOrderId: null })
      .where(eq(drivers.id, driverId));

    return { success: true };
  });
}

export async function assignDriverToOrder(db: any, orderId: string, driverId: string) {
  return await db.transaction(async (tx: any) => {
    const [order] = await tx.select().from(onlineOrders).where(eq(onlineOrders.id, orderId));
    if (!order) throw new Error('Order tidak ditemukan');

    const [driver] = await tx.select().from(drivers).where(eq(drivers.id, driverId));
    if (!driver) throw new Error('Driver tidak ditemukan');
    if (driver.status === 'busy') throw new Error('Driver sedang sibuk');

    await tx.update(onlineOrders).set({
      driverId,
      driverName: driver.name,
      driverPhone: driver.phone,
      status: 'Out for Delivery',
    }).where(eq(onlineOrders.id, orderId));

    await tx.update(drivers).set({
      status: 'busy',
      currentOrderId: orderId,
    }).where(eq(drivers.id, driverId));

    await tx.insert(onlineOrderStatusLog).values({
      orderId,
      fromStatus: order.status,
      toStatus: 'Out for Delivery',
      changedBy: 'admin',
      notes: `Driver assigned: ${driver.name} (${driver.phone})`,
    });

    return { success: true, driver: { name: driver.name, phone: driver.phone } };
  });
}
