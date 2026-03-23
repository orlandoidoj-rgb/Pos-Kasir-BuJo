export interface CheckoutLineInput {
  productId: string;
  qty: number;
}

export interface CheckoutInput {
  branchId: string;
  userId: string;
  partnerId?: string;
  orderType: "Dine-in" | "Take-away" | "Shopee" | "Gofood" | "Grab" | "Pesanan";
  paymentMethod: "Cash" | "Transfer" | "Qris" | "Debit";
  lines: CheckoutLineInput[];
  discount?: number;
}
