import { Customer } from '../types';
import { CUSTOMERS_KEY } from '../config';

export function getCustomers(): Customer[] {
  try { return JSON.parse(localStorage.getItem(CUSTOMERS_KEY) ?? '[]'); } catch { return []; }
}

export function findCustomerByPhone(phone: string): Customer | null {
  if (!phone || phone.length < 8) return null;
  return getCustomers().find(c => c.phone === phone) ?? null;
}

export function saveOrUpdateCustomer(c: Customer) {
  try {
    const all = getCustomers();
    const idx = all.findIndex(x => x.id === c.id);
    if (idx >= 0) all[idx] = c; else all.push(c);
    localStorage.setItem(CUSTOMERS_KEY, JSON.stringify(all));
  } catch { /* ignore */ }
}
