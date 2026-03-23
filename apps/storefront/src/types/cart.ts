import { MenuItem } from "./product";

export interface CartItem extends MenuItem {
  qty: number;
  notes?: string;
}
