import React, { useEffect, useState } from 'react';
import CustomerReceipt from './CustomerReceipt';
import KitchenTicket from './KitchenTicket';
import { currentCustomerData, currentKitchenData, subscribeToPrint } from '../../utils/print';

export default function PrintContainer() {
  const [, setTick] = useState(0);

  useEffect(() => {
    // Re-render when notifyPrintListeners is called from util
    const unsubscribe = subscribeToPrint(() => setTick(t => t + 1));
    return unsubscribe;
  }, []);

  if (!currentCustomerData && !currentKitchenData) return null;

  return (
    <div id="print-area">
      {currentCustomerData && <CustomerReceipt data={currentCustomerData} />}
      {currentKitchenData && <KitchenTicket data={currentKitchenData} />}
    </div>
  );
}
