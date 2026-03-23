export interface CustomerReceiptData {
  // Header
  storeName: string;
  branchName: string;
  branchAddress?: string;
  branchPhone?: string;

  // Transaction
  txId: string;
  date: Date;
  cashierName: string;
  orderType: string;

  // Items
  items: {
    name: string;
    qty: number;
    price: number;
    subtotal: number;
  }[];

  // Totals
  subtotal: number;
  discount: number;
  tax: number;
  total: number;

  // Payment
  paymentMethod: string;
  amountPaid: number;
  change: number;

  // Customer (optional)
  customerName?: string;
  customerPhone?: string;
  pointsEarned?: number;
  totalPoints?: number;

  // Voucher (optional)
  voucherCode?: string;
  voucherDiscount?: number;
}

export interface KitchenTicketData {
  txId: string;
  date: Date;
  orderType: string;
  cashierName: string;
  customerName?: string;
  items: {
    name: string;
    qty: number;
    notes?: string;
  }[];
  totalItems: number;
}
