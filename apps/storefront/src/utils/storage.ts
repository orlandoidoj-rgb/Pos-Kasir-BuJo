export function getItem<T>(key: string, fallback: T): T {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : fallback;
  } catch {
    return fallback;
  }
}

export function setItem<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Storage full or unavailable
  }
}

export function removeItem(key: string): void {
  try {
    localStorage.removeItem(key);
  } catch {
    // Ignore
  }
}

export const CART_KEY = (slug: string) => `warung_bujo_cart_${slug}`;
export const CUSTOMER_KEY = 'warung_bujo_customer';
export const VOUCHER_KEY = (slug: string) => `warung_bujo_voucher_${slug}`;
