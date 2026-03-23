import React from 'react';
import { Banknote, QrCode, CreditCard, Package, Car, Bike } from 'lucide-react';
import { PaymentMethod, OrderType } from '../types';

export interface PaymentConfig {
  method: PaymentMethod; 
  label: string; 
  sublabel: string;
  icon: React.FC<any>; 
  forTypes: OrderType[];
}

export const PAYMENT_CONFIGS: PaymentConfig[] = [
  { method: 'tunai',       label: 'Tunai',       sublabel: 'Uang tunai',     icon: Banknote,   forTypes: ['Dine-in','Take-away'] },
  { method: 'qris',        label: 'QRIS',        sublabel: 'GoPay/OVO/Dana', icon: QrCode,     forTypes: ['Dine-in','Take-away','Shopee','Grab','Gofood'] },
  { method: 'kartu_debit', label: 'Kartu Debit', sublabel: 'Debit/Kredit',   icon: CreditCard, forTypes: ['Dine-in','Take-away'] },
  { method: 'shopee_pay',  label: 'ShopeePay',   sublabel: 'Via Shopee',     icon: Package,    forTypes: ['Shopee'] },
  { method: 'grab_pay',    label: 'GrabPay',     sublabel: 'Via Grab',       icon: Car,        forTypes: ['Grab'] },
  { method: 'gofood_pay',  label: 'GoFood Pay',  sublabel: 'Via GoFood',     icon: Bike,       forTypes: ['Gofood'] },
];

export const DEFAULT_PAYMENT: Record<OrderType, PaymentMethod> = {
  'Dine-in': 'tunai', 'Take-away': 'tunai',
  'Shopee': 'shopee_pay', 'Grab': 'grab_pay', 'Gofood': 'gofood_pay',
};
