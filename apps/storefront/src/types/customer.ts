export interface Customer {
  id: string;
  name: string;
  phone: string;
  email: string;
  address?: string;
  addressNote?: string;
  totalOrders: number;
  totalSpent: string;
}

export interface CustomerRegisterInput {
  name: string;
  phone: string;
  email: string;
}
