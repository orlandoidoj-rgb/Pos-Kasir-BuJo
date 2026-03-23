import React from 'react';
import { UtensilsCrossed, ShoppingBag, Package, Car, Bike } from 'lucide-react';
import { OrderType } from '../types';

export interface OrderTypeConfig {
  type: OrderType; 
  label: string; 
  sublabel: string;
  activeColor: string; 
  activeShadow: string; 
  icon: React.FC<any>;
}

export const ORDER_TYPE_CONFIG: OrderTypeConfig[] = [
  { type: 'Dine-in',   label: 'Dine-in',  sublabel: 'Makan di tempat', activeColor: 'bg-[#224ceb]',  activeShadow: 'shadow-[#224ceb]/25', icon: UtensilsCrossed },
  { type: 'Take-away', label: 'Take Away', sublabel: 'Bawa pulang',     activeColor: 'bg-amber-500',  activeShadow: 'shadow-amber-500/25',  icon: ShoppingBag     },
  { type: 'Shopee',    label: 'Shopee',    sublabel: 'Via Shopee Food', activeColor: 'bg-orange-500', activeShadow: 'shadow-orange-500/25', icon: Package         },
  { type: 'Grab',      label: 'Grab',      sublabel: 'Via GrabFood',    activeColor: 'bg-emerald-600',activeShadow: 'shadow-emerald-500/25',icon: Car             },
  { type: 'Gofood',    label: 'GoFood',    sublabel: 'Via GoFood',      activeColor: 'bg-red-600',    activeShadow: 'shadow-red-500/25',    icon: Bike            },
];
