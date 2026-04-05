import type { SeedOrder, SupplierCart, CartItem, Supplier } from '@/types/order';
import type { PlantRecommendation } from '@/types/plants';
import * as americanMeadows from './suppliers/american-meadows';
import * as prairieMoon from './suppliers/prairie-moon';

// All supported suppliers — add new suppliers here
const SUPPLIERS = [
  {
    meta: {
      id: americanMeadows.SUPPLIER_ID,
      name: americanMeadows.SUPPLIER_NAME,
      baseUrl: americanMeadows.SUPPLIER_URL,
      shipsToZips: americanMeadows.SHIPS_TO,
    } satisfies Supplier,
    searchProduct: americanMeadows.searchProduct,
    addToCart: americanMeadows.addToCart,
  },
  {
    meta: {
      id: prairieMoon.SUPPLIER_ID,
      name: prairieMoon.SUPPLIER_NAME,
      baseUrl: prairieMoon.SUPPLIER_URL,
      shipsToZips: prairieMoon.SHIPS_TO,
    } satisfies Supplier,
    searchProduct: prairieMoon.searchProduct,
    addToCart: prairieMoon.addToCart,
  },
];

export async function fillCarts(
  confirmedPlants: PlantRecommendation[],
  budget: number,
  zipCode: string,
  gardenPlanId: string
): Promise<SeedOrder> {
  // Dynamically import playwright — server-side only
  const { chromium } = await import('playwright');
  const browser = await chromium.launch({ headless: true });

  const carts: SupplierCart[] = [];
  let totalEstimated = 0;
  let remainingBudget = budget;

  for (const supplier of SUPPLIERS) {
    if (remainingBudget <= 0) break;

    const page = await browser.newPage();
    const items: CartItem[] = [];

    for (const plant of confirmedPlants) {
      if (remainingBudget <= 0) break;

      try {
        const productPath = await supplier.searchProduct(page, plant.commonName);
        if (!productPath) continue;

        const productUrl = productPath.startsWith('http')
          ? productPath
          : `${supplier.meta.baseUrl}${productPath}`;

        const item: CartItem = {
          supplierId: supplier.meta.id,
          plantId: plant.id,
          productName: plant.commonName,
          productUrl,
          pricePerUnit: 0,   // updated after page load
          quantity: 1,
          unit: 'packet',
          inStock: true,
        };

        const added = await supplier.addToCart(page, item);
        if (added) {
          items.push(item);
          remainingBudget -= item.pricePerUnit;
          totalEstimated += item.pricePerUnit;
        }
      } catch {
        // Skip failed items — do not throw
      }
    }

    carts.push({
      supplier: supplier.meta,
      items,
      subtotal: items.reduce((sum, i) => sum + i.pricePerUnit * i.quantity, 0),
      cartUrl: `${supplier.meta.baseUrl}/cart`,
      status: items.length > 0 ? 'filled' : 'failed',
    });

    await page.close();
  }

  await browser.close();

  return {
    id: crypto.randomUUID(),
    zipCode,
    gardenPlanId,
    budget,
    confirmedPlantIds: confirmedPlants.map((p) => p.id),
    carts,
    totalEstimated,
    createdAt: new Date().toISOString(),
  };
}
