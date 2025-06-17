const { test, expect } = require('@playwright/test');

test.describe('Jakarta Interactive Map Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Wait for page to be fully loaded
    await page.waitForLoadState('networkidle');
  });

  test('should display "Interactive Map" text', async ({ page }) => {
    // Check for the "Interactive Map" text in the header
    await expect(page.locator('h1')).toContainText('Interactive Map');
    
    // Also verify the full title
    await expect(page.locator('h1')).toContainText('Jakarta Interactive Map');
  });

  test('should have correct page title', async ({ page }) => {
    await expect(page).toHaveTitle('Jakarta Map - OpenStreetMap');
  });

  test('should display header with map information', async ({ page }) => {
    // Check header elements
    await expect(page.locator('.header h1')).toBeVisible();
    await expect(page.locator('.header p')).toContainText('Powered by OpenStreetMap & Leaflet.js');
  });

  test('should render the map container', async ({ page }) => {
    // Wait for the map to be visible
    await expect(page.locator('#map')).toBeVisible();
    
    // Check that the map container has expected styling
    const mapContainer = page.locator('#map');
    await expect(mapContainer).toHaveCSS('height', '600px');
  });

  test('should display map information panel', async ({ page }) => {
    const infoPanel = page.locator('.info-panel');
    await expect(infoPanel).toBeVisible();
    
    // Check specific information
    await expect(infoPanel).toContainText('Location: Jakarta, Indonesia');
    await expect(infoPanel).toContainText('Map Source: OpenStreetMap contributors');
    await expect(infoPanel).toContainText('Interactive zooming, panning, and marker placement');
    
    // Check coordinates
    await expect(infoPanel).toContainText('Latitude: -6.2088°');
    await expect(infoPanel).toContainText('Longitude: 106.8456°');
  });

  test('should load Leaflet map library', async ({ page }) => {
    // Wait for Leaflet to be loaded
    await page.waitForFunction(() => typeof window.L !== 'undefined', {
      timeout: 10000
    });
    
    // Check that map is initialized
    const mapExists = await page.evaluate(() => {
      return window.L && window.L.map;
    });
    expect(mapExists).toBeTruthy();
  });

  test('should have responsive design on mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Reload to apply mobile styles
    await page.reload();
    await page.waitForLoadState('networkidle');
    
    // Check that elements are still visible and properly sized
    await expect(page.locator('.header')).toBeVisible();
    await expect(page.locator('#map')).toBeVisible();
    
    // On mobile, map height should be 400px
    await expect(page.locator('#map')).toHaveCSS('height', '400px');
  });

  test('should have proper meta tags', async ({ page }) => {
    // Check for proper meta tags
    await expect(page.locator('meta[charset]')).toHaveAttribute('charset', 'UTF-8');
    await expect(page.locator('meta[name="viewport"]')).toHaveAttribute('content', 'width=device-width, initial-scale=1.0');
  });

  test('should load external Leaflet resources', async ({ page }) => {
    // Check that Leaflet CSS is loaded
    const leafletCssLoaded = await page.evaluate(() => {
      const links = Array.from(document.querySelectorAll('link[rel="stylesheet"]'));
      return links.some(link => link.href.includes('leaflet'));
    });
    expect(leafletCssLoaded).toBeTruthy();

    // Check that Leaflet JS is loaded
    const leafletJsLoaded = await page.evaluate(() => {
      const scripts = Array.from(document.querySelectorAll('script[src]'));
      return scripts.some(script => script.src.includes('leaflet'));
    });
    expect(leafletJsLoaded).toBeTruthy();
  });
});