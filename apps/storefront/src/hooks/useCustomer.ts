import { useState, useEffect } from 'react';
import { Customer, CustomerRegisterInput } from '../types/customer';
import { getCustomerProfile, registerCustomer } from '../services/customer.api';

export function useCustomer() {
  const storageKey = 'warung_bujo_customer_id';
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const customerId = localStorage.getItem(storageKey);
    if (!customerId) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    getCustomerProfile(customerId)
      .then(setCustomer)
      .catch(err => {
        console.error("Failed to fetch customer profile", err);
        localStorage.removeItem(storageKey);
      })
      .finally(() => setIsLoading(false));
  }, []);

  const login = async (input: CustomerRegisterInput) => {
    setIsLoading(true);
    try {
      const result = await registerCustomer(input);
      setCustomer(result);
      localStorage.setItem(storageKey, result.id);
      return result;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem(storageKey);
    setCustomer(null);
  };

  return {
    customer,
    isLoading,
    error,
    login,
    logout,
    isLoggedIn: !!customer
  };
}
