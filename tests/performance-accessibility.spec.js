const { test, expect } = require('@playwright/test');

test.describe('Performance and Accessibility Tests', () => {
  test('should load page within reasonable time', async ({ page }) => {
    const startTime = Date.now();
    
    await page.goto('/');
    
    // Wait for essential elements to be visible
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.locator('#map')).toBeVisible();
    
    const loadTime = Date.now() - startTime;
    
    // Page should load within 5 seconds
    expect(loadTime).toBeLessThan(5000);
  });

  test('should load external resources successfully', async ({ page }) => {
    const failedRequests = [];
    
    page.on('requestfailed', request => {
      failedRequests.push({
        url: request.url(),
        failureText: request.failure()?.errorText
      });
    });
    
    await page.goto('/');
    await page.waitForTimeout(3000); // Wait for all resources to load
    
    // Check that critical external resources loaded successfully
    const criticalResourcesFailed = failedRequests.filter(req => 
      req.url.includes('leaflet') || 
      req.url.includes('tile.openstreetmap.org')
    );
    
    expect(criticalResourcesFailed.length).toBe(0);
  });

  test('should have proper semantic HTML structure', async ({ page }) => {
    await page.goto('/');
    
    // Check for proper heading hierarchy
    const h1Count = await page.locator('h1').count();
    expect(h1Count).toBe(1);
    
    // Check for proper meta tags
    await expect(page.locator('meta[charset]')).toHaveAttribute('charset', 'UTF-8');
    await expect(page.locator('meta[name="viewport"]')).toHaveAttribute('content', 'width=device-width, initial-scale=1.0');
    
    // Check for title
    await expect(page).toHaveTitle(/Jakarta Map/);
  });

  test('should be keyboard accessible', async ({ page }) => {
    await page.goto('/');
    
    // Tab through the page and ensure focus is visible
    await page.keyboard.press('Tab');
    
    // Check that zoom controls can be focused
    const zoomInButton = page.locator('.leaflet-control-zoom-in');
    await zoomInButton.focus();
    
    const isFocused = await zoomInButton.evaluate(el => {
      return document.activeElement === el;
    });
    
    expect(isFocused).toBeTruthy();
  });

  test('should handle network errors gracefully', async ({ page }) => {
    // Block tile requests to simulate network issues
    await page.route('**/*tile.openstreetmap.org*', route => route.abort());
    
    await page.goto('/');
    
    // Map container should still be visible even if tiles fail to load
    await expect(page.locator('#map')).toBeVisible();
    await expect(page.locator('h1')).toContainText('Interactive Map');
  });

  test('should not have console errors', async ({ page }) => {
    const consoleErrors = [];
    
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });
    
    await page.goto('/');
    await page.waitForTimeout(3000);
    
    // Filter out expected/acceptable errors (like network errors for blocked resources)
    const criticalErrors = consoleErrors.filter(error => 
      !error.includes('net::ERR_') && // Network errors
      !error.includes('Failed to load resource') && // Resource loading errors
      !error.toLowerCase().includes('cors') // CORS errors
    );
    
    expect(criticalErrors.length).toBe(0);
  });

  test('should have proper CSS styling loaded', async ({ page }) => {
    await page.goto('/');
    
    // Check that custom styles are applied
    const headerBgColor = await page.locator('.header').evaluate(el => {
      return window.getComputedStyle(el).backgroundColor;
    });
    
    // Should not be transparent/default color
    expect(headerBgColor).not.toBe('rgba(0, 0, 0, 0)');
    expect(headerBgColor).not.toBe('transparent');
    
    // Check map container has proper styling
    const mapHeight = await page.locator('#map').evaluate(el => {
      return window.getComputedStyle(el).height;
    });
    
    expect(mapHeight).toBe('600px');
  });

  test('should work without JavaScript (graceful degradation)', async ({ browser }) => {
    // Create a new context with JavaScript disabled
    const context = await browser.newContext({
      javaScriptEnabled: false
    });
    const page = await context.newPage();
    
    await page.goto('/');
    
    // Basic content should still be visible
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.locator('.info-panel')).toBeVisible();
    
    // Check that static content is accessible
    await expect(page.locator('.info-panel')).toContainText('Jakarta, Indonesia');
    
    await context.close();
  });
});