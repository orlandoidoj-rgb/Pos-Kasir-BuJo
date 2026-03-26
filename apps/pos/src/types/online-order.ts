export type OnlineOrderStatus = 
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
  branchId?: string;
  status: OnlineOrderStatus;
  paymentStatus: string;
  fulfillmentType: "pickup" | "delivery";
  total: number;
  subtotal: number;
  deliveryFee: number;
  discount: number;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  deliveryAddress?: string;
  deliveryNotes?: string;
  pickupScheduledAt?: string;
  customerNotes?: string;
  driverName?: string;
  driverPhone?: string;
  cancelReason?: string;
  createdAt: string;
  items: OnlineOrderItem[];
}

export interface OnlineOrderItem {
  id: string;
  productName: string;
  qty: number;
  price: number;
  subtotal: number;
  notes?: string;
}

export interface ActionButton {
  label: string;
  icon: string;
  action: string;
  variant: 'primary' | 'secondary' | 'danger' | 'ghost';
}

export interface StatusConfig {
  color: string;
  textColor: string;
  label: string;
  icon: string;
  actions: ActionButton[];
}

export const ONLINE_STATUS_CONFIG: Record<OnlineOrderStatus, StatusConfig> = {
  "Pending": {
    color: "bg-gray-100", textColor: "text-gray-500",
    label: "Menunggu Pembayaran", icon: "⏳",
    actions: [],
  },
  "Paid": {
    color: "bg-blue-100", textColor: "text-blue-700",
    label: "Baru — Perlu Konfirmasi", icon: "🔵",
    actions: [
      { label: "Konfirmasi", icon: "✅", action: "confirm", variant: "primary" },
      { label: "Tolak", icon: "❌", action: "cancel", variant: "danger" },
    ],
  },
  "Confirmed": {
    color: "bg-indigo-100", textColor: "text-indigo-700",
    label: "Dikonfirmasi — Siap Masak", icon: "🟣",
    actions: [
      { label: "Mulai Masak", icon: "🍳", action: "prepare", variant: "primary" },
    ],
  },
  "Preparing": {
    color: "bg-amber-100", textColor: "text-amber-700",
    label: "Sedang Dimasak", icon: "🟡",
    actions: [
      { label: "Selesai Masak", icon: "✅", action: "ready", variant: "primary" },
    ],
  },
  "Ready": {
    color: "bg-emerald-100", textColor: "text-emerald-700",
    label: "Siap", icon: "🟢",
    actions: [
      // Actions will be dynamic based on fulfillmentType
    ],
  },
  "Out for Delivery": {
    color: "bg-purple-100", textColor: "text-purple-700",
    label: "Sedang Diantar", icon: "🛵",
    actions: [
      { label: "Sudah Sampai", icon: "✅", action: "complete", variant: "primary" },
      { label: "Hubungi Kurir", icon: "💬", action: "chat_driver", variant: "secondary" },
    ],
  },
  "Completed": {
    color: "bg-green-100", textColor: "text-green-700",
    label: "Selesai", icon: "✅",
    actions: [],
  },
  "Cancelled": {
    color: "bg-red-100", textColor: "text-red-700",
    label: "Dibatalkan", icon: "❌",
    actions: [],
  },
};
