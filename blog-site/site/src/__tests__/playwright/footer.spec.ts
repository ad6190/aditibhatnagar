import { test, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:5173';
const ROUTES = ['/', '/about', '/bookmarks', '/projects', '/writing'];

test.describe('Footer: copyright year', () => {
  const currentYear = new Date().getFullYear().toString();

  for (const route of ROUTES) {
    test(`footer is visible and shows ${currentYear} on route ${route}`, async ({ page }) => {
      await page.goto(`${BASE_URL}${route}`);

      // Scroll to bottom so footer is in view
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));

      // Footer element exists
      const footer = page.locator('footer');
      await expect(footer).toBeVisible();

      // Copyright text includes current year and owner name
      await expect(footer).toContainText(`© ${currentYear} aditi.`);

      // Tagline is present
      await expect(footer).toContainText('obsidian + react');

      // Take a screenshot of the footer area specifically
      await footer.screenshot({ path: `screenshots/footer-${route.replace('/', '') || 'home'}.png` });
    });
  }
});
