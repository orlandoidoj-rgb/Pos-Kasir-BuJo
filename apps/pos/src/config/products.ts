import { POSProduct } from '../types';

export const DEFAULT_PRODUCTS: POSProduct[] = [
  { 
    id: 'PRD-001', 
    name: 'Nasi Goreng BuJo', 
    category: '1', 
    hpp: 10000, 
    unit: 'Porsi',
    allPrices: {'Dine-in':25000,'Take-away':25000,'Shopee':27000,'Grab':27000,'Gofood':27000},
    image: 'https://images.unsplash.com/photo-1562802378-063ec186a863?q=80&w=800&auto=format&fit=crop',
    branchActivations: {'CBG-001':true} 
  },
];
