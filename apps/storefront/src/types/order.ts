export type OrderStatus = 
  | "Pending" 
  | "Paid" 
  | "Confirmed" 
  | "Preparing" 
  | "Ready" 
  | "Out for Delivery" 
  | "Completed" 
  | "Cancelled";

export interface OnlineOrder {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  fulfillmentType: "pickup" | "delivery";
  total: string;
  subtotal: string;
  deliveryFee: string;
  discount: string;
  createdAt: string;
  deliveryAddress?: string;
  deliveryNotes?: string;
  pickupScheduledAt?: string;
  items?: OnlineOrderItem[];
}

export interface OnlineOrderItem {
  id: string;
  productName: string;
  qty: number;
  price: string;
  subtotal: string;
  notes?: string;
}

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
