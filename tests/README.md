# Jakarta Interactive Map - Test Suite

This directory contains automated tests for the Jakarta Interactive Map project using Playwright.

## Test Structure

### 1. `interactive-map.spec.js`
Core functionality tests including:
- ✅ **"Interactive Map" text verification** - Main requirement from user
- Page title and header validation
- Map container rendering
- Information panel content verification
- Responsive design testing
- Leaflet library loading

### 2. `map-interactions.spec.js`
Interactive features testing:
- Map markers and popups
- Zoom controls functionality
- Landmark markers verification
- User interaction testing (clicking, zooming)
- Console logging verification

### 3. `performance-accessibility.spec.js`
Quality assurance tests:
- Page load performance
- External resource loading
- Semantic HTML structure
- Keyboard accessibility
- Error handling and graceful degradation
- Network resilience testing

## Running Tests Locally

### Prerequisites
```bash
npm install
npx playwright install
```

### Run All Tests
```bash
npm test
```

### Run Specific Test File
```bash
npx playwright test tests/interactive-map.spec.js
```

### Run Tests in Headed Mode (See Browser)
```bash
npm run test:headed
```

### Debug Tests
```bash
npm run test:debug
```

### Run Tests on Specific Browser
```bash
npx playwright test --project=chromium
npx playwright test --project=firefox
npx playwright test --project=webkit
```

## CI/CD Integration

The GitHub Actions workflow (`.github/workflows/ci.yml`) automatically runs these tests on:
- Pull requests to `main` or `master` branches
- Direct pushes to `main` or `master` branches

The CI includes:
- Cross-browser testing (Chrome, Firefox, Safari)
- Performance auditing with Lighthouse
- Test reports and artifacts upload

## Test Reports

After running tests, view the HTML report:
```bash
npx playwright show-report
```

## Key Features Tested

- ✅ **Interactive Map text presence** (main requirement)
- ✅ Map rendering and responsiveness
- ✅ External dependencies (Leaflet, OpenStreetMap)
- ✅ User interactions and accessibility
- ✅ Performance and error handling
- ✅ Cross-browser compatibility