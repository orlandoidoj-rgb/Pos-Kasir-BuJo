import { eq, desc, and, inArray, sql } from "drizzle-orm";
import { 
  onlineOrders, 
  onlineOrderLines, 
  onlineOrderStatusLog,
  onlineCustomers
} from "@warung-bujo/database";

export async function getCustomerOrders(db: any, customerId: string) {
  return await db
    .select()
    .from(onlineOrders)
    .where(eq(onlineOrders.customerId, customerId))
    .orderBy(desc(onlineOrders.createdAt));
}

export async function getOrderDetails(db: any, orderId: string) {
  const [order] = await db
    .select()
    .from(onlineOrders)
    .where(eq(onlineOrders.id, orderId));

  if (!order) return null;

  const lines = await db
    .select()
    .from(onlineOrderLines)
    .where(eq(onlineOrderLines.orderId, orderId));

  const logs = await db
    .select()
    .from(onlineOrderStatusLog)
    .where(eq(onlineOrderStatusLog.orderId, orderId))
    .orderBy(desc(onlineOrderStatusLog.createdAt));

  return {
    ...order,
    lines,
    statusLogs: logs,
  };
}

import { insertStockMoves } from "../utils/stock";
import { createJournalEntry, JournalLine } from "../utils/journal";
import { incrementCustomerStats } from "./online-customer.service";
import { products } from "@warung-bujo/database";

const VALID_TRANSITIONS: Record<string, string[]> = {
  "Pending":          ["Cancelled"],
  "Paid":             ["Confirmed", "Cancelled"],
  "Confirmed":        ["Preparing", "Cancelled"],
  "Preparing":        ["Ready", "Cancelled"],
  "Ready":            ["Out for Delivery", "Completed", "Cancelled"],
  "Out for Delivery": ["Completed", "Cancelled"],
  "Completed":        [],
  "Cancelled":        [],
};

export async function updateOrderStatus(
  db: any, 
  orderId: string, 
  toStatus: string, 
  changedBy: string, 
  notes?: string
) {
  return await db.transaction(async (tx: any) => {
    // 1. Fetch Order & Lines
    const [order] = await tx
      .select()
      .from(onlineOrders)
      .where(eq(onlineOrders.id, orderId));

    if (!order) throw new Error("Order not found");

    const fromStatus = order.status;

    // 2. Validate Transition
    if (!VALID_TRANSITIONS[fromStatus]?.includes(toStatus)) {
      throw new Error(`Invalid status transition: ${fromStatus} -> ${toStatus}`);
    }

    const orderLinesData = await tx
      .select()
      .from(onlineOrderLines)
      .where(eq(onlineOrderLines.orderId, orderId));

    // 3. FASE: Confirmed -> Deduct Stock
    if (toStatus === "Confirmed") {
      const stockMoveInputs = orderLinesData.map(l => ({
        branchId: order.branchId,
        productId: l.productId,
        qty: -l.qty, // Deduct
        referenceType: "pos_sale" as const, // Treat online as POS sale for inventory purposes
        referenceId: order.id,
        notes: `Online Order ${order.orderNumber} confirmed`,
      }));
      await insertStockMoves(tx, stockMoveInputs);
    }

    // 4. FASE: Completed -> Journal & Stats
    if (toStatus === "Completed") {
      // Create Journal Entry
      // We need COGS (HPP)
      const productIds = orderLinesData.map(l => l.productId);
      const dbProducts = await tx
        .select()
        .from(products)
        .where(inArray(products.id, productIds));
      
      const productMap = new Map(dbProducts.map((p: any) => [p.id, p]));
      
      let totalCOGS = 0;
      for (const line of orderLinesData) {
        const product = productMap.get(line.productId) as any;
        if (product) {
          totalCOGS += Number(product.purchasePrice) * line.qty;
        }
      }

      const total = Number(order.total);
      
      const journalLines: JournalLine[] = [
        { accountCode: "1101", debit: total, credit: 0 },      // Kas/Bank
        { accountCode: "4101", debit: 0, credit: total },     // Pendapatan
        { accountCode: "5101", debit: totalCOGS, credit: 0 },  // HPP
        { accountCode: "1401", debit: 0, credit: totalCOGS }, // Persediaan
      ];

      await createJournalEntry(tx, order.id, `Online Order ${order.orderNumber} completed`, journalLines);
      
      // Update Customer Stats
      await incrementCustomerStats(tx, order.customerId, total);
    }

    // 5. FASE: Cancelled -> Rollback Stock (if confirmed+)
    if (toStatus === "Cancelled" && ["Confirmed", "Preparing", "Ready", "Out for Delivery"].includes(fromStatus)) {
      const stockMoveInputs = orderLinesData.map(l => ({
        branchId: order.branchId,
        productId: l.productId,
        qty: l.qty, // Add back
        referenceType: "adjustment" as const,
        referenceId: order.id,
        notes: `Online Order ${order.orderNumber} cancelled - stock rollback`,
      }));
      await insertStockMoves(tx, stockMoveInputs);
    }

    // 6. Update Order
    const updateData: any = { status: toStatus };
    if (toStatus === "Confirmed") updateData.confirmedAt = new Date();
    if (toStatus === "Preparing") updateData.preparedAt = new Date();
    if (toStatus === "Ready") updateData.readyAt = new Date();
    if (toStatus === "Completed") updateData.completedAt = new Date();
    if (toStatus === "Cancelled") updateData.cancelledAt = new Date();

    if (toStatus === "Cancelled" && notes) {
      updateData.cancelReason = notes;
    }

    await tx
      .update(onlineOrders)
      .set(updateData)
      .where(eq(onlineOrders.id, orderId));

    // 7. Log Status Change
    await tx.insert(onlineOrderStatusLog).values({
      orderId,
      fromStatus,
      toStatus,
      changedBy,
      notes,
    });

    return { success: true, fromStatus, toStatus };
  });
}

export async function assignOrderDriver(db: any, orderId: string, driverName: string, driverPhone: string) {
  return await db.transaction(async (tx: any) => {
    // 1. Fetch Order
    const [order] = await tx
      .select()
      .from(onlineOrders)
      .where(eq(onlineOrders.id, orderId));

    if (!order) throw new Error("Order not found");

    // 2. Update Order
    await tx
      .update(onlineOrders)
      .set({
        driverName,
        driverPhone,
        status: "Out for Delivery",
        // No readyAt here because assign driver happens after Ready
      })
      .where(eq(onlineOrders.id, orderId));

    // 3. Log
    await tx.insert(onlineOrderStatusLog).values({
      orderId,
      fromStatus: order.status,
      toStatus: "Out for Delivery",
      changedBy: "admin",
      notes: `Driver assigned: ${driverName} (${driverPhone})`,
    });

    return { success: true };
  });
}

export async function getAdminOrders(db: any, filters: { branchId?: string; status?: string; date?: string }) {
  let query = db.select().from(onlineOrders).orderBy(desc(onlineOrders.createdAt));
  
  const conditions = [];
  if (filters.branchId) {
    conditions.push(eq(onlineOrders.branchId, filters.branchId));
  }
  if (filters.status) {
    conditions.push(eq(onlineOrders.status, filters.status));
  }
  if (filters.date) {
    conditions.push(sql`DATE(${onlineOrders.createdAt}) = ${filters.date}`);
  }

  if (conditions.length > 0) {
    query = query.where(and(...conditions));
  }

  return await query;
}
