import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckoutInput } from '../types/order';
import { checkout } from '../services/order.api';
import { CartItem } from '../types/cart';
import { Customer } from '../types/customer';
import { loadSnapScript, openSnapPopup } from '../utils/midtrans';
import { MIDTRANS_CLIENT_KEY, MIDTRANS_IS_PRODUCTION } from '../config/midtrans';

export function useCheckout(slug: string) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const processCheckout = async (
    customer: Customer | { name: string; phone: string; email: string },
    fulfillment: { type: "pickup" | "delivery"; address?: string; addressNote?: string; time?: string },
    cartItems: CartItem[]
  ) => {
    if (cartItems.length === 0) throw new Error("Keranjang kosong");

    setIsLoading(true);
    setError(null);

    try {
      // 1. Load Midtrans Script
      await loadSnapScript(MIDTRANS_CLIENT_KEY, MIDTRANS_IS_PRODUCTION);

      // 2. Create Order in Backend
      const input: CheckoutInput = {
        name: customer.name,
        phone: customer.phone,
        email: customer.email,
        fulfillmentType: fulfillment.type,
        deliveryAddress: fulfillment.address,
        deliveryNotes: fulfillment.addressNote,
        pickupScheduledAt: fulfillment.time,
        lines: cartItems.map(item => ({
          productId: item.id,
          qty: item.qty,
          notes: item.notes
        }))
      };

      const result = await checkout(slug, input);

      // 3. Open Midtrans Snap Popup
      openSnapPopup(result.snapToken, {
        onSuccess: () => {
          navigate(`/${slug}/orders/${result.orderId}`);
        },
        onPending: () => {
          navigate(`/${slug}/orders/${result.orderId}`);
        },
        onError: () => {
          setError("Pembayaran gagal. Silakan coba lagi dari halaman detail pesanan.");
          navigate(`/${slug}/orders/${result.orderId}`);
        },
        onClose: () => {
          // Customer closed the popup
          navigate(`/${slug}/orders/${result.orderId}`);
        },
      });

      return result;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    processCheckout,
    isLoading,
    error
  };
}
