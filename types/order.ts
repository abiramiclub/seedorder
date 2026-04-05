export interface Supplier {
  id: string;
  name: string;
  baseUrl: string;
  shipsToZips: 'all-us' | 'contiguous-us';  // shipping coverage
  logoUrl?: string;
}

export interface CartItem {
  supplierId: string;
  plantId: string;
  productName: string;
  productUrl: string;
  pricePerUnit: number;
  quantity: number;
  unit: 'packet' | 'oz' | 'lb' | 'each';
  inStock: boolean;
}

export interface SeedOrder {
  id: string;
  zipCode: string;
  gardenPlanId: string;
  budget: number;
  confirmedPlantIds: string[];
  carts: SupplierCart[];
  totalEstimated: number;
  createdAt: string;
}

export interface SupplierCart {
  supplier: Supplier;
  items: CartItem[];
  subtotal: number;
  cartUrl: string;
  status: 'pending' | 'filled' | 'failed';
  errorMessage?: string;
}
