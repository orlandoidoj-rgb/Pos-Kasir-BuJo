import { useState } from 'react';
import { PaymentMethod, CartItem, OrderSetup } from '../types';
import { saveTransaction, deductBOMStock, incrementVoucherUsageLocal, findCustomerByPhone, saveOrUpdateCustomer } from '../utils';
import { printBoth } from '../utils/print';

export function useCheckout(
  cart: CartItem[], 
  orderSetup: OrderSetup, 
  setOrderSetup: any,
  selectedBranchId: string, 
  selectedBranch: any,
  cashierName: string,
  subtotal: number, 
  tax: number, 
  discount: number, 
  total: number,
  setCart: any,
  setScreen: any,
  recentTx: any[],
  setRecentTx: any,
  voucherApplied?: any
) {
  const [showPayment, setShowPayment] = useState(false);
  const [txSuccess, setTxSuccess] = useState<{id: string; change: number; pointsEarned: number; customerName?: string} | null>(null);

  const handleConfirmPayment = async (method: PaymentMethod, paid: number) => {
    const txId = `TX-${Date.now()}`;
    const now = new Date().toISOString();
    
    // API Call
    const checkoutData = {
      branchId: selectedBranchId,
      userId: 'USER-001',
      partnerId: orderSetup.loyaltyCustomer?.id || null,
      orderType: orderSetup.orderType,
      paymentMethod: method,
      discount,
      lines: cart.map(i => ({ productId: i.id, qty: i.qty }))
    };

    try {
      const response = await fetch('http://localhost:4000/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(checkoutData),
      });

      if (!response.ok) {
        const err = await response.json();
        alert(`Error: ${err.error || 'Gagal memproses transaksi'}`);
        return;
      }

      const result = await response.json();
      const txData: any = {
        id: result.orderId || txId, 
        date: now, 
        orderType: orderSetup.orderType,
        branchId: selectedBranchId, branchName: selectedBranch?.nama,
        cashierName, paymentMethod: method,
        items: cart.map(i => ({ productName: i.name, qty: i.qty, price: i.price, subtotal: i.price*i.qty })),
        subtotal, tax, discount, total,
      };

      saveTransaction(txData);
      deductBOMStock(selectedBranchId, cart);
      
      if (voucherApplied?.discount) incrementVoucherUsageLocal(voucherApplied.code);
      
      if (orderSetup.customerPhone) {
          const existing = findCustomerByPhone(orderSetup.customerPhone);
          const earned = Math.floor(total / 10000);
          saveOrUpdateCustomer(existing ? 
              {...existing, points: existing.points + earned, totalSpent: existing.totalSpent + total, totalOrders: existing.totalOrders + 1, lastVisit: now.slice(0,10)} :
              {id:`CUS-${Date.now()}`, name: orderSetup.customerName || 'Pelanggan', phone: orderSetup.customerPhone, points: earned, totalOrders: 1, totalSpent: total, joinedAt: now.slice(0,10), lastVisit: now.slice(0,10)}
          );
      }

      setRecentTx([txData, ...recentTx]);
      setShowPayment(false);
      setTxSuccess({ id: txData.id, change: Math.max(0, paid-total), pointsEarned: Math.floor(total/10000), customerName: orderSetup.customerName });
      
      // Print receipts
      printBoth(
        {
          storeName: 'Warung BuJo',
          branchName: selectedBranch?.nama || selectedBranchId,
          txId: txData.id,
          date: new Date(),
          cashierName: cashierName,
          orderType: orderSetup.orderType,
          items: cart.map(i => ({
            name: i.name, qty: i.qty, price: i.price, subtotal: i.price * i.qty
          })),
          subtotal: subtotal,
          discount: discount,
          tax: tax,
          total: total,
          paymentMethod: method,
          amountPaid: paid,
          change: Math.max(0, paid - total),
          customerName: orderSetup.customerName,
          customerPhone: orderSetup.customerPhone,
          pointsEarned: Math.floor(total / 10000),
        },
        {
          txId: txData.id,
          date: new Date(),
          orderType: orderSetup.orderType,
          cashierName: cashierName,
          customerName: orderSetup.customerName,
          items: cart.map(i => ({ name: i.name, qty: i.qty })),
          totalItems: cart.reduce((s, i) => s + i.qty, 0),
        }
      ).catch(err => {
        console.error("Print failed:", err);
      });

      setCart([]); 
      setOrderSetup({...orderSetup, customerName:'', customerPhone:'', loyaltyCustomer:null});
      setScreen('setup');
      setTimeout(() => setTxSuccess(null), 3000);
    } catch (error) {
      console.error('Checkout failed:', error);
      alert('Koneksi ke server gagal. Pastikan API menyala.');
    }
  };

  return {
    showPayment, setShowPayment,
    txSuccess, setTxSuccess,
    handleConfirmPayment
  };
}
