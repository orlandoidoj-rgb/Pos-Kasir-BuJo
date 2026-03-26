import { OnlineOrder, OnlineOrderStatus } from '../types/online-order';

const API_BASE_URL = import.meta.env.VITE_API_URL || '';

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'API request failed');
  }

  const result = await response.json();
  return result.data; // Assuming standard response { success: true, data: ... }
}

export const onlineApi = {
  /**
   * List orders for a branch with optional filters
   */
  getOrders: (branchId: string, status?: OnlineOrderStatus) => {
    let url = `/api/admin/online/orders?branchId=${branchId}`;
    if (status) url += `&status=${status}`;
    return request<OnlineOrder[]>(url);
  },

  /**
   * Update order status
   */
  updateStatus: (orderId: string, status: OnlineOrderStatus, notes?: string) => {
    return request<{ success: true }>(`/api/admin/online/orders/${orderId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status, notes, changedBy: 'pos' }),
    });
  },

  /**
   * Assign driver to order by driverId
   */
  assignDriver: (orderId: string, driverName: string, driverPhone: string, driverId?: string) => {
    return request<{ success: true }>(`/api/admin/online/orders/${orderId}/assign-driver`, {
      method: 'PUT',
      body: JSON.stringify(driverId ? { driverId } : { driverName, driverPhone }),
    });
  },

  /**
   * List available drivers for a branch
   */
  getDrivers: (branchId: string) => {
    return request<{ id: string; name: string; phone: string; status: string }[]>(`/api/admin/online/drivers?branchId=${branchId}`);
  },
};
