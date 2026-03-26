import { eq, and, sql } from "drizzle-orm";
import { 
  onlineStoreConfig, 
  branches, 
  products, 
  categories,
  onlineOrders, 
  onlineOrderLines, 
  onlineCustomers, 
  onlineOrderStatusLog 
} from "@warung-bujo/database";
import { getStockBalances } from "../utils/stock";
import { registerOrFindCustomer, updateCustomerAddress } from "./online-customer.service";
import { createSnapToken } from "./midtrans.service";

export interface CheckoutInput {
  name: string;
  phone: string;
  email: string;
  fulfillmentType: "pickup" | "delivery";
  deliveryAddress?: string;
  deliveryNotes?: string;
  pickupScheduledAt?: string;
  customerNotes?: string;
  lines: {
    productId: string;
    qty: number;
    notes?: string;
  }[];
}

export async function getStoreBySlug(db: any, slug: string) {
  const [store] = await db
    .select({
      id: onlineStoreConfig.id,
      branchId: onlineStoreConfig.branchId,
      slug: onlineStoreConfig.slug,
      storeName: onlineStoreConfig.storeName,
      description: onlineStoreConfig.description,
      bannerImage: onlineStoreConfig.bannerImage,
      logoImage: onlineStoreConfig.logoImage,
      operatingHours: onlineStoreConfig.operatingHours,
      deliveryEnabled: onlineStoreConfig.deliveryEnabled,
      pickupEnabled: onlineStoreConfig.pickupEnabled,
      deliveryRadius: onlineStoreConfig.deliveryRadius,
      deliveryFee: onlineStoreConfig.deliveryFee,
      minOrderAmount: onlineStoreConfig.minOrderAmount,
      estimatedPrepTime: onlineStoreConfig.estimatedPrepTime,
      whatsappNumber: onlineStoreConfig.whatsappNumber,
      isEnabled: onlineStoreConfig.isEnabled,
    })
    .from(onlineStoreConfig)
    .where(eq(onlineStoreConfig.slug, slug));

  return store;
}

export async function getStoreMenu(db: any, branchId: string, categoryId?: string) {
  // 1. Fetch available products for this branch
  // In this system, products are global but we might want to filter by sellable
  let query = db
    .select({
      id: products.id,
      name: products.name,
      image: products.image,
      price: products.price,
      unit: products.unit,
      categoryId: products.categoryId,
      categoryName: categories.name,
    })
    .from(products)
    .leftJoin(categories, eq(products.categoryId, categories.id))
    .where(eq(products.isSellable, true));

  if (categoryId) {
    query = query.where(eq(products.categoryId, categoryId));
  }

  const dbProducts = await query;

  // 2. Fetch stock balances for these products at this branch
  const productIds = dbProducts.map((p: any) => p.id);
  const stockBalances = await getStockBalances(db, branchId, productIds);

  // 3. Merge stock data
  return dbProducts.map((p: any) => ({
    ...p,
    stock: stockBalances.get(p.id) || 0,
  }));
}

export async function createOnlineOrder(db: any, branchId: string, slug: string, input: any) {
  return await db.transaction(async (tx: any) => {
    // 1. Register or Find Customer (name + phone + email all required)
    if (!input.name || !input.phone || !input.email) {
      throw new Error("Nama, nomor HP, dan email wajib diisi untuk memesan");
    }

    const customer = await registerOrFindCustomer(tx, input.name, input.phone, input.email);
    const customerId = customer.id;

    // 2. Update Customer Address if Delivery
    if (input.fulfillmentType === "delivery") {
      await updateCustomerAddress(tx, customerId, input.deliveryAddress, input.deliveryNotes);
    }

    // 3. Validate Store
    const [config] = await tx
      .select()
      .from(onlineStoreConfig)
      .where(eq(onlineStoreConfig.branchId, branchId));

    if (!config || !config.isEnabled) {
      throw new Error("Toko sedang tutup atau tidak aktif");
    }

    // 4. Validate Products & Stock
    const productIds = input.lines.map((l: any) => l.productId);
    const dbProducts = await tx
      .select()
      .from(products)
      .where(sql`${products.id} IN ${productIds}`);

    const productMap = new Map(dbProducts.map((p: any) => [p.id, p]));
    const stockBalances = await getStockBalances(tx, branchId, productIds);

    let subtotal = 0;
    const orderLinesBatch = [];

    for (const line of input.lines) {
      const product = productMap.get(line.productId) as any;
      if (!product) throw new Error(`Product ${line.productId} not found`);

      const availableStock = stockBalances.get(line.productId) || 0;
      if (availableStock < line.qty) {
        throw new Error(`Stok tidak cukup untuk ${product.name}`);
      }

      const lineSubtotal = Number(product.price) * line.qty;
      subtotal += lineSubtotal;

      orderLinesBatch.push({
        productId: product.id,
        productName: product.name,
        qty: line.qty,
        price: product.price,
        subtotal: lineSubtotal.toString(),
        notes: line.notes,
      });
    }

    // 5. Validate Min Order
    if (subtotal < Number(config.minOrderAmount)) {
      throw new Error(`Minimum order adalah Rp ${config.minOrderAmount}`);
    }

    // 6. Calculate Delivery Fee
    let deliveryFee = 0;
    if (input.fulfillmentType === "delivery") {
      if (!config.deliveryEnabled) throw new Error("Pengiriman tidak tersedia");
      deliveryFee = Number(config.deliveryFee);
    }

    const total = subtotal + deliveryFee;

    // 7. Generate Order Number
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, "");
    const [{ count }] = await tx
      .select({ count: sql`count(*)` })
      .from(onlineOrders)
      .where(sql`DATE(created_at) = CURRENT_DATE`);
    
    const sequence = (Number(count) + 1).toString().padStart(3, "0");
    const orderNumber = `ONL-${dateStr}-${sequence}`;

    // 8. Create Order
    const [order] = await tx
      .insert(onlineOrders)
      .values({
        orderNumber,
        branchId,
        customerId,
        status: "Pending", // Default is Pending
        fulfillmentType: input.fulfillmentType,
        pickupScheduledAt: input.pickupScheduledAt ? new Date(input.pickupScheduledAt) : null,
        deliveryAddress: input.deliveryAddress,
        deliveryLatitude: input.deliveryLatitude,
        deliveryLongitude: input.deliveryLongitude,
        deliveryFee: deliveryFee.toString(),
        deliveryNotes: input.deliveryNotes,
        subtotal: subtotal.toString(),
        total: total.toString(),
        customerNotes: input.customerNotes,
        paymentMethod: "CASH/COD",
        paymentStatus: "unpaid",
      })
      .returning();

    // 9. Create Order Lines
    await tx.insert(onlineOrderLines).values(
      orderLinesBatch.map((line: any) => ({
        ...line,
        orderId: order.id,
      }))
    );

    /* 
    DEPRECATED: Midtrans Snap Flow (By-passed for direct Cash/COD)
    const snapResult = await createSnapToken(...)
    await tx.update(onlineOrders).set({ midtransOrderId: order.orderNumber, paymentMethod: "midtrans_snap" }).where(eq(onlineOrders.id, order.id));
    */

    return {
      orderId: order.id,
      orderNumber: order.orderNumber,
      total: order.total,
      customerId: customer.id,
      // snapToken: snapResult.token,
      // paymentUrl: snapResult.redirectUrl,
    };
  });
}
