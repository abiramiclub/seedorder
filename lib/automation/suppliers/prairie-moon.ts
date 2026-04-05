import type { Page } from 'playwright';
import type { CartItem } from '@/types/order';

export const SUPPLIER_ID = 'prairie-moon';
export const SUPPLIER_NAME = 'Prairie Moon Nursery';
export const SUPPLIER_URL = 'https://www.prairiemoon.com';
export const SHIPS_TO: 'contiguous-us' = 'contiguous-us';

export async function addToCart(page: Page, item: CartItem): Promise<boolean> {
  try {
    await page.goto(item.productUrl, { waitUntil: 'domcontentloaded' });

    const qtyInput = page.locator('input[name="Quantity"], input[name="qty"]').first();
    if (await qtyInput.isVisible()) {
      await qtyInput.fill(String(item.quantity));
    }

    const addBtn = page.locator('button:has-text("Add to Cart"), input[value="Add to Cart"]').first();
    await addBtn.click();

    await page.waitForSelector('.cart-count, #cart-count', { timeout: 5000 });
    return true;
  } catch {
    return false;
  }
}

export async function searchProduct(page: Page, plantName: string): Promise<string | null> {
  const searchUrl = `${SUPPLIER_URL}/catalogsearch/result/?q=${encodeURIComponent(plantName)}`;
  await page.goto(searchUrl, { waitUntil: 'domcontentloaded' });

  const firstResult = page.locator('.product-item a, .product-name a').first();
  if (!(await firstResult.isVisible())) return null;

  return await firstResult.getAttribute('href');
}
