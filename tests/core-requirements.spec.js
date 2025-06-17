const { test, expect } = require('@playwright/test');

test.describe('Core Requirements Tests', () => {
  test('should display "Interactive Map" text - MAIN REQUIREMENT', async ({ page }) => {
    await page.goto('/');
    
    // This is the main requirement from the user
    await expect(page.locator('h1')).toContainText('Interactive Map');
    
    // Verify the complete text
    await expect(page.locator('h1')).toHaveText('Jakarta Interactive Map');
  });

  test('should load page successfully', async ({ page }) => {
    await page.goto('/');
    
    // Basic smoke test - page should load
    await expect(page.locator('body')).toBeVisible();
    await expect(page).toHaveTitle(/Jakarta Map/);
  });

  test('should display main content elements', async ({ page }) => {
    await page.goto('/');
    
    // Check essential elements exist
    await expect(page.locator('.header')).toBeVisible();
    await expect(page.locator('#map')).toBeVisible();
    await expect(page.locator('.info-panel')).toBeVisible();
  });

  test('should contain expected text content', async ({ page }) => {
    await page.goto('/');
    
    // Check for key content
    await expect(page.locator('body')).toContainText('Jakarta');
    await expect(page.locator('body')).toContainText('OpenStreetMap');
    await expect(page.locator('body')).toContainText('Leaflet');
  });

  test('should have valid HTML structure', async ({ page }) => {
    await page.goto('/');
    
    // Check basic HTML structure
    await expect(page.locator('html[lang="en"]')).toBeVisible();
    // Check title exists (but don't check visibility since it's in head)
    await expect(page).toHaveTitle('Jakarta Map - OpenStreetMap');
    await expect(page.locator('meta[charset="UTF-8"]')).toHaveAttribute('charset', 'UTF-8');
  });
});