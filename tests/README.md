# Jakarta Interactive Map - Test Suite

This directory contains automated tests for the Jakarta Interactive Map project using Playwright.

## 🎯 Main Requirement

✅ **The primary test verifies that "Interactive Map" text is present on the page** - this is specifically checked in `core-requirements.spec.js`.

## Test Structure

### 1. `core-requirements.spec.js` ⭐
**Essential tests that must pass:**
- ✅ **"Interactive Map" text verification** - Main requirement from user
- Page loading and basic functionality
- Essential HTML structure
- Basic content validation

### 2. `interactive-map.spec.js`
Comprehensive functionality tests:
- Page title and header validation
- Map container rendering
- Information panel content verification
- Responsive design testing
- Leaflet library loading
- External resource verification

### 3. `map-interactions.spec.js`
Interactive features testing:
- Map markers and popups
- Zoom controls functionality
- Landmark markers verification
- User interaction testing (clicking, zooming)
- Console logging verification

### 4. `performance-accessibility.spec.js`
Quality assurance tests:
- Page load performance
- External resource loading
- Semantic HTML structure
- Keyboard accessibility
- Error handling and graceful degradation
- Network resilience testing

## 🚀 Quick Setup

### Option 1: Use Setup Script (Recommended)
```bash
chmod +x scripts/setup-tests.sh
./scripts/setup-tests.sh
```

### Option 2: Manual Setup
```bash
npm install
npx playwright install chromium
```

## Running Tests

### Core Tests (Recommended for CI)
```bash
npx playwright test tests/core-requirements.spec.js
```

### All Tests
```bash
npm test
```

### Specific Browsers
```bash
npm run test:chromium
npm run test:firefox
npm run test:webkit
```

### Development Mode
```bash
npm run test:headed    # See browser window
npm run test:debug     # Debug mode
```

### View Reports
```bash
npm run test:report
```

## 🔧 Troubleshooting

### Common Issues

1. **System Dependencies Missing**
   ```bash
   sudo apt-get update && sudo apt-get install -y \
     libnss3 libnspr4 libatk-bridge2.0-0 libdrm2 \
     libxkbcommon0 libxcomposite1 libxdamage1 \
     libxrandr2 libgbm1 libxss1 libasound2
   ```

2. **Server Not Running**
   ```bash
   # Start server manually
   python3 -m http.server 3000 &
   ```

3. **Port Conflicts**
   - Stop any running servers on port 3000
   - Or update `playwright.config.js` to use different port

4. **Browser Download Issues**
   ```bash
   # Clear cache and reinstall
   rm -rf ~/.cache/ms-playwright/
   npx playwright install chromium
   ```

## GitHub CI Integration

The CI workflow runs in 3 stages:

1. **Core Tests** - Essential functionality (fast, reliable)
2. **Comprehensive Tests** - Full test suite on Chromium
3. **Multi-Browser Tests** - Core tests on Firefox & WebKit

### CI Status Checks

- ✅ Core requirements must pass for PR merge
- ⚠️ Comprehensive tests provide additional validation
- 📊 Multi-browser tests ensure compatibility

## Local Development

### Start Development Server
```bash
python3 -m http.server 3000
```

### Run Tests Against Local Server
```bash
npm test
```

### Debug Specific Test
```bash
npx playwright test tests/core-requirements.spec.js --debug
```

## Key Features Tested

- ✅ **Interactive Map text presence** (main requirement)
- ✅ Map rendering and responsiveness
- ✅ External dependencies (Leaflet, OpenStreetMap)
- ✅ User interactions and accessibility
- ✅ Performance and error handling
- ✅ Cross-browser compatibility

## Test Configuration

- **Headless mode** in CI for performance
- **Chrome flags** for CI stability (`--no-sandbox`, `--disable-dev-shm-usage`)
- **Retry logic** for flaky tests
- **Screenshot and video** capture on failures
- **Parallel execution** where possible