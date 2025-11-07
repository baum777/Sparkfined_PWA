import { Page } from '@playwright/test';

export async function awaitStableUI(page: Page) {
  await page.waitForLoadState('domcontentloaded');
  await page.waitForLoadState('networkidle');
  await page.waitForSelector('main, [role="main"], #root, #app', { state: 'visible' });
}
