import { API_BASE_URL } from '../config/api';

export async function loginWithGoogle(credential: string) {
  const res = await fetch(`${API_BASE_URL}/online/auth/google`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ credential }),
  });
  const data = await res.json();
  if (!data.success) throw new Error(data.error?.message || 'Login gagal');
  return data.data as {
    token: string;
    customerId: string;
    name: string;
    email: string;
    avatarUrl: string | null;
    needsProfile: boolean;
  };
}

export async function updateCustomerProfile(customerId: string, data: {
  name?: string;
  phone?: string;
  address?: string;
  addressNote?: string;
}, token: string) {
  const res = await fetch(`${API_BASE_URL}/online/customer/${customerId}/address`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
  const result = await res.json();
  if (!result.success) throw new Error(result.error?.message || 'Update gagal');
  return result.data;
}
