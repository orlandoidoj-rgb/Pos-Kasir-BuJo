import crypto from "crypto";
import { eq } from "drizzle-orm";
import { 
  onlineOrders, 
  onlineOrderStatusLog 
} from "@warung-bujo/database";
import { midtransConfig } from "../config/midtrans";

export interface MidtransNotification {
  transaction_time: string;
  transaction_status: string;
  transaction_id: string;
  status_message: string;
  status_code: string;
  signature_key: string;
  payment_type: string;
  order_id: string;
  merchant_id: string;
  gross_amount: string;
  fraud_status?: string;
  currency: string;
}

export function validateSignature(notification: MidtransNotification): boolean {
  const { order_id, status_code, gross_amount, signature_key } = notification;
  const serverKey = midtransConfig.serverKey;

  const payload = order_id + status_code + gross_amount + serverKey;
  const expectedSignature = crypto
    .createHash("sha512")
    .update(payload)
    .digest("hex");

  return expectedSignature === signature_key;
}

export async function handleMidtransNotification(db: any, notification: MidtransNotification) {
  return await db.transaction(async (tx: any) => {
    // 1. Validate signature
    if (!validateSignature(notification)) {
      throw new Error("Invalid Midtrans signature");
    }

    // 2. Find order by order_id (which is our orderNumber)
    const [order] = await tx
      .select()
      .from(onlineOrders)
      .where(eq(onlineOrders.orderNumber, notification.order_id));

    if (!order) {
      throw new Error(`Order not found for notification: ${notification.order_id}`);
    }

    const { transaction_status, fraud_status } = notification;

    // 3. Status mapping logic
    if (
      transaction_status === "settlement" ||
      (transaction_status === "capture" && fraud_status === "accept")
    ) {
      // ✅ SUCCESS
      if (order.paymentStatus === "paid") return; // Idempotent check

      await tx
        .update(onlineOrders)
        .set({
          paymentStatus: "paid",
          status: "Paid",
          paidAt: new Date(),
          midtransTransactionId: notification.transaction_id,
          paymentMethod: notification.payment_type,
        })
        .where(eq(onlineOrders.id, order.id));

      await tx.insert(onlineOrderStatusLog).values({
        orderId: order.id,
        fromStatus: order.status,
        toStatus: "Paid",
        changedBy: "system:midtrans",
        notes: `Payment successful via ${notification.payment_type}`,
      });

    } else if (transaction_status === "pending") {
      // ⏳ PENDING
      await tx
        .update(onlineOrders)
        .set({
          paymentStatus: "pending",
          paymentMethod: notification.payment_type,
        })
        .where(eq(onlineOrders.id, order.id));

    } else if (["deny", "cancel", "expire"].includes(transaction_status)) {
      // ❌ FAILED / CANCELLED / EXPIRED
      if (order.status === "Cancelled") return; // Idempotent

      await tx
        .update(onlineOrders)
        .set({
          paymentStatus: "failed",
          status: "Cancelled",
          cancelledAt: new Date(),
          cancelReason: `Payment ${transaction_status}`,
        })
        .where(eq(onlineOrders.id, order.id));

      await tx.insert(onlineOrderStatusLog).values({
        orderId: order.id,
        fromStatus: order.status,
        toStatus: "Cancelled",
        changedBy: "system:midtrans",
        notes: `Payment state: ${transaction_status}`,
      });
    }

    return { orderId: order.id, status: transaction_status };
  });
}
