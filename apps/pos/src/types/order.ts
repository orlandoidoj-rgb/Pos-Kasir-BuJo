import { Customer } from './customer';
import { POSProduct } from './product';

export type OrderType = 'Dine-in' | 'Take-away' | 'Shopee' | 'Grab' | 'Gofood';

export type PaymentMethod = 'tunai' | 'qris' | 'kartu_debit' | 'shopee_pay' | 'grab_pay' | 'gofood_pay';

export type Screen = 'login' | 'setup' | 'ordering' | 'online_orders';

export interface CartItem extends POSProduct { 
  qty: number; 
  price: number; 
}

export interface OrderSetup {
  orderType: OrderType; 
  customerName: string;
  customerPhone: string; 
  loyaltyCustomer: Customer | null;
  discount: number;
}

export interface TxRaw {
  id: string; 
  date: string; 
  orderType: string; 
  branchId?: string;
  branchName?: string; 
  cashierName?: string; 
  paymentMethod?: string;
  customerName?: string; 
  total: number;
  items: { 
    productName: string; 
    qty: number; 
    price: number; 
    subtotal: number; 
  }[];
  subtotal: number; 
  tax: number; 
  discount: number;
}
