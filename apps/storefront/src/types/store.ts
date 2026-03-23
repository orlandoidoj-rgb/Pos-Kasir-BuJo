export interface StoreInfo {
  id: string;
  branchId: string;
  slug: string;
  storeName: string;
  description?: string;
  bannerImage?: string;
  logoImage?: string;
  operatingHours?: Record<string, { open: string; close: string }>;
  deliveryEnabled: boolean;
  pickupEnabled: boolean;
  deliveryRadius?: number;
  deliveryFee?: number;
  minOrderAmount?: number;
  estimatedPrepTime?: number;
  whatsappNumber?: string;
  isEnabled: boolean;
}
