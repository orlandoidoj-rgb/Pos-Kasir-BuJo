import { request } from "./api";
import { StoreInfo } from "../types/store";
import { MenuItem, Category } from "../types/product";

export async function getStore(slug: string): Promise<StoreInfo> {
  return request<StoreInfo>(`/api/online/${slug}`);
}

export async function getMenu(slug: string, categoryId?: string): Promise<MenuItem[]> {
  const query = categoryId ? `?categoryId=${categoryId}` : "";
  return request<MenuItem[]>(`/api/online/${slug}/menu${query}`);
}

export async function getCategories(slug: string): Promise<Category[]> {
  // In our backend, categories come with products, or we can fetch separately if we had an endpoint.
  // For now, let's assume we fetch all products and extract unique categories on client if needed,
  // or use a dedicated endpoint if we add one.
  const menu = await getMenu(slug);
  const categoriesMap = new Map<string, string>();
  menu.forEach(item => {
    if (item.categoryId && item.categoryName) {
      categoriesMap.set(item.categoryId, item.categoryName);
    }
  });
  return Array.from(categoriesMap.entries()).map(([id, name]) => ({ id, name }));
}
