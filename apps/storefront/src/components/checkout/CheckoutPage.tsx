import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCart } from '../../hooks/useCart';
import { useCustomer } from '../../hooks/useCustomer';
import { useCheckout } from '../../hooks/useCheckout';
import { useStore } from '../../hooks/useStore';
import { ChevronLeft } from 'lucide-react';
import { Button } from '../ui/Button';
import { CustomerForm } from './CustomerForm';
import { FulfillmentToggle } from './FulfillmentToggle';
import { DeliveryForm } from './DeliveryForm';
import { OrderSummary } from './OrderSummary';

export const CheckoutPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { store } = useStore(slug || '');
  const { items, subtotal, clearCart } = useCart(slug || '');
  const { customer, login } = useCustomer();
  const { processCheckout, isLoading } = useCheckout(slug || '');

  // Form State
  const [customerData, setCustomerData] = useState({
    name: '',
    phone: '',
    email: ''
  });
  const [fulfillment, setFulfillment] = useState<"pickup" | "delivery">("pickup");
  const [deliveryData, setDeliveryData] = useState({
    address: '',
    notes: ''
  });

  useEffect(() => {
    if (customer) {
      setCustomerData({
        name: customer.name,
        phone: customer.phone,
        email: customer.email
      });
      setDeliveryData(prev => ({
        ...prev,
        address: customer.address || prev.address,
        notes: customer.addressNote || prev.notes
      }));
    }
  }, [customer]);

  const handleCheckout = async () => {
    try {
      // 1. Ensure customer is registered/found
      await login(customerData);

      // 2. Process Order
      const result = await processCheckout(
        customerData,
        { 
          type: fulfillment, 
          address: deliveryData.address, 
          addressNote: deliveryData.notes 
        },
        items
      );

      // 3. Clear Cart & Redirect
      clearCart();
      navigate(`/${slug}/orders/${result.orderId}`, { replace: true });
    } catch (err: any) {
      alert(err.message);
    }
  };

  const deliveryFee = fulfillment === 'delivery' ? Number(store?.deliveryFee || 0) : 0;

  return (
    <div className="bg-white min-h-screen pb-12">
      <div className="px-4 py-5 flex items-center gap-4 sticky top-0 bg-white z-10 border-b border-gray-100">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-gray-900">
          <ChevronLeft size={24} strokeWidth={3} />
        </button>
        <h2 className="text-xl font-black tracking-tight">Checkout</h2>
      </div>

      <div className="p-4 flex flex-col gap-8">
        <CustomerForm data={customerData} onChange={setCustomerData} disabled={!!customer} />
        
        <FulfillmentToggle 
          active={fulfillment} 
          onChange={setFulfillment} 
          deliveryEnabled={!!store?.deliveryEnabled}
          pickupEnabled={!!store?.pickupEnabled}
        />

        {fulfillment === 'delivery' && (
          <DeliveryForm data={deliveryData} onChange={setDeliveryData} />
        )}

        <OrderSummary 
          items={items} 
          subtotal={subtotal} 
          deliveryFee={deliveryFee} 
        />

        <Button 
          isLoading={isLoading}
          onClick={handleCheckout} 
          className="w-full py-5 text-xl font-black shadow-2xl shadow-primary/30"
        >
          Bayar Sekarang
        </Button>
      </div>
    </div>
  );
};
