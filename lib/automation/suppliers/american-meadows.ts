import type { Page } from 'playwright';
import type { CartItem } from '@/types/order';

export const SUPPLIER_ID = 'american-meadows';
export const SUPPLIER_NAME = 'American Meadows';
export const SUPPLIER_URL = 'https://www.americanmeadows.com';
export const SHIPS_TO: 'all-us' = 'all-us';

export async function addToCart(page: Page, item: CartItem): Promise<boolean> {
  try {
    await page.goto(item.productUrl, { waitUntil: 'domcontentloaded' });

    // Select quantity if input exists
    const qtyInput = page.locator('input[name="quantity"], input[id*="quantity"]').first();
    if (await qtyInput.isVisible()) {
      await qtyInput.fill(String(item.quantity));
    }

    // Click add to cart
    const addBtn = page.locator('button:has-text("Add to Cart"), button[id*="add-to-cart"]').first();
    await addBtn.click();

    // Wait for cart confirmation
    await page.waitForSelector('[class*="cart"], [id*="cart"]', { timeout: 5000 });
    return true;
  } catch {
    return false;
  }
}

export async function searchProduct(page: Page, plantName: string): Promise<string | null> {
  const searchUrl = `${SUPPLIER_URL}/search?q=${encodeURIComponent(plantName)}&native=true`;
  await page.goto(searchUrl, { waitUntil: 'domcontentloaded' });

  const firstResult = page.locator('a[class*="product"], .product-card a').first();
  if (!(await firstResult.isVisible())) return null;

  return await firstResult.getAttribute('href');
}
