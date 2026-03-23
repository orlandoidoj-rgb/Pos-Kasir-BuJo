import { midtransConfig } from "../config/midtrans";

export async function createSnapToken(
  order: {
    orderId: string;
    orderNumber: string;
    total: number;
    items: { productId: string; name: string; qty: number; price: number }[];
  },
  customer: {
    name: string;
    email: string;
    phone: string;
  },
  slug: string
): Promise<{ token: string; redirectUrl: string }> {
  const payload = {
    transaction_details: {
      order_id: order.orderNumber,
      gross_amount: order.total,
    },
    item_details: order.items.map(item => ({
      id: item.productId,
      name: item.name,
      quantity: item.qty,
      price: item.price,
    })),
    customer_details: {
      first_name: customer.name,
      email: customer.email,
      phone: customer.phone,
    },
    callbacks: {
      finish: `${midtransConfig.storefrontUrl}/${slug}/orders/${order.orderId}`,
      error: `${midtransConfig.storefrontUrl}/${slug}/orders/${order.orderId}`,
      pending: `${midtransConfig.storefrontUrl}/${slug}/orders/${order.orderId}`,
    },
    enabled_payments: [
      "gopay", "shopeepay", "dana", "ovo", "linkaja",
      "qris",
      "bank_transfer",
      "credit_card", "cimb_clicks", "bca_klikpay",
      "indomaret", "alfamart",
    ],
  };

  const authHeader = Buffer.from(`${midtransConfig.serverKey}:`).toString('base64');

  const response = await fetch(midtransConfig.snapUrl, {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'Authorization': `Basic ${authHeader}`
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const errData = await response.json();
    console.error("Midtrans Snap Error:", errData);
    throw new Error(errData.error_messages?.join(", ") || "Failed to create payment token");
  }

  const result = await response.json();
  return {
    token: result.token,
    redirectUrl: result.redirect_url
  };
}
