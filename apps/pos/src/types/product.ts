import { OrderType } from './order';

export interface StockBatch {
  id: string;
  qty: number;
  buyPrice: number;
  date: string;
}

export interface BackofficeProduct {
  id: string; 
  name: string; 
  prices: Record<OrderType, number>; 
  purchasePrice: number;
  categoryId: string; 
  image: string; 
  unit: string; 
  isSellable: boolean; 
  isActive: boolean;
  branchActivations?: Record<string, boolean>;
}

export interface POSProduct {
  id: string; 
  name: string; 
  allPrices: Record<OrderType, number>; 
  hpp: number;
  category: string; 
  image: string; 
  unit: string; 
  branchActivations: Record<string, boolean>;
}

export interface BOMLine { 
  materialId: string; 
  materialName: string; 
  qty: number; 
  unit: string; 
}

export interface BranchStockItem {
  materialId: string; 
  materialName: string; 
  satuan: string; 
  stok: number; 
  stokMin: number; 
  harga: number;
  batches?: StockBatch[];
}
