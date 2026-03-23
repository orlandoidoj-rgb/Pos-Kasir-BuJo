import { request } from "./api";
import { CheckoutInput, OnlineOrder } from "../types/order";

export async function checkout(slug: string, input: CheckoutInput): Promise<{
  orderId: string;
  orderNumber: string;
  total: string;
  customerId: string;
  snapToken: string;
  paymentUrl: string;
}> {
  return request(`/api/online/${slug}/checkout`, {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function getOrder(orderId: string): Promise<OnlineOrder> {
  return request<OnlineOrder>(`/api/online/customer/orders/${orderId}`);
}
