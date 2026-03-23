export interface MockTransaction {
  id: string;             // Nomor Struk/Invoice
  branchName: string;     // Nama Cabang
  date: string;           // Tanggal & Jam (ISO format)
  cashierName: string;    // Nama Kasir
  items: Array<{
    name: string;
    qty: number;
    price: number;
    subtotal: number;
  }>;
  discount: number;       // Value of discount/voucher
  paymentMethod: 'QRIS' | 'CASH' | 'DEBIT' | 'CREDIT';
  grandTotal: number;
}

export const MOCK_TRANSACTIONS: MockTransaction[] = [
  {
    id: "INV-20260320-001",
    branchName: "Malang Pusat",
    date: "2026-03-20T10:30:00Z",
    cashierName: "Darmawan",
    items: [
      { name: "Ayam Penyet Lalapan", qty: 2, price: 25000, subtotal: 50000 },
      { name: "Es Teh Manis Jumbo", qty: 2, price: 5000, subtotal: 10000 }
    ],
    discount: 5000,
    paymentMethod: "QRIS",
    grandTotal: 55000
  },
  {
    id: "INV-20260320-002",
    branchName: "Malang Pusat",
    date: "2026-03-20T11:15:00Z",
    cashierName: "Darmawan",
    items: [
      { name: "Bebek Bakar Madu", qty: 1, price: 35000, subtotal: 35000 },
      { name: "Es Jeruk Nipis", qty: 1, price: 7000, subtotal: 7000 }
    ],
    discount: 0,
    paymentMethod: "CASH",
    grandTotal: 42000
  },
  {
    id: "INV-20260320-003",
    branchName: "Malang Pusat",
    date: "2026-03-20T12:45:00Z",
    cashierName: "Siti",
    items: [
      { name: "Nasi Goreng Spesial", qty: 3, price: 22000, subtotal: 66000 },
      { name: "Es Teh Manis Jumbo", qty: 3, price: 5000, subtotal: 15000 }
    ],
    discount: 10000,
    paymentMethod: "DEBIT",
    grandTotal: 71000
  }
];
