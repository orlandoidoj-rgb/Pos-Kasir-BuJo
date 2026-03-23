export interface MenuItem {
  id: string;
  name: string;
  image?: string;
  price: string;
  unit: string;
  categoryId?: string;
  categoryName?: string;
  stock: number;
}

export interface Category {
  id: string;
  name: string;
}
