export interface TransactionItem {
  id: string;
  name: string;
  qty: number;
  price: number;
  subtotal: number;
}

export interface Transaction {
  id: string;
  invoiceNumber: string;
  timestamp: string;
  cashierName: string;
  branchName: string;
  items: TransactionItem[];
  subtotal: number;
  discount: number;
  tax: number;
  grandTotal: number;
  paymentMethod: 'Cash' | 'QRIS' | 'Debit' | 'Credit';
}

export const MOCK_TRANSACTIONS: Transaction[] = [
  {
    id: 't1',
    invoiceNumber: 'INV-20260320-001',
    timestamp: '2026-03-20T10:15:00',
    cashierName: 'Budi Santoso',
    branchName: 'Warung BuJo - Pusat',
    items: [
      { id: 'p1', name: 'Nasi Goreng BuJo', qty: 1, price: 25000, subtotal: 25000 },
    ],
    subtotal: 25000,
    discount: 0,
    tax: 0,
    grandTotal: 25000,
    paymentMethod: 'Cash',
  },
];
