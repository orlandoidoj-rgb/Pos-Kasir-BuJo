import { request } from "./api";
import { Customer, CustomerRegisterInput } from "../types/customer";
import { OnlineOrder } from "../types/order";

export async function registerCustomer(input: CustomerRegisterInput): Promise<Customer & { isNew: boolean }> {
  return request<Customer & { isNew: boolean }>(`/api/online/customer/register`, {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function getCustomerProfile(id: string): Promise<Customer> {
  return request<Customer>(`/api/online/customer/${id}`);
}

export async function updateCustomerAddress(id: string, address: string, addressNote?: string): Promise<void> {
  return request<void>(`/api/online/customer/${id}/address`, {
    method: "PUT",
    body: JSON.stringify({ address, addressNote }),
  });
}

export async function getCustomerOrders(id: string): Promise<OnlineOrder[]> {
  return request<OnlineOrder[]>(`/api/online/customer/${id}/orders`);
}
