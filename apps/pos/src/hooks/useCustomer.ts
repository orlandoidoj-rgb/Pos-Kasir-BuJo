import { useState } from 'react';
import { Customer } from '../types';
import { normalizePhone, findCustomerByPhone } from '../utils';

export function useCustomer(setOrderSetup: any) {
  const [customerPhone, setCustomerPhone] = useState('');
  
  const handlePhoneChange = (raw: string) => {
    const p = normalizePhone(raw);
    setCustomerPhone(p);
    const existing = findCustomerByPhone(p);
    if (existing) {
      setOrderSetup((prev: any) => ({ ...prev, customerPhone: p, customerName: existing.name, loyaltyCustomer: existing }));
    } else {
      setOrderSetup((prev: any) => ({ ...prev, customerPhone: p, loyaltyCustomer: null }));
    }
  };

  return {
    customerPhone,
    setCustomerPhone,
    handlePhoneChange
  };
}
