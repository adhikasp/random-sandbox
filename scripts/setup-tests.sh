#!/bin/bash

# Setup script for Jakarta Interactive Map tests

set -e

echo "🚀 Setting up Jakarta Interactive Map test environment..."

# Install npm dependencies
echo "📦 Installing npm dependencies..."
npm install

# Install Playwright browsers
echo "🌐 Installing Playwright browsers..."
npx playwright install chromium

# Try to install system dependencies (if on Linux)
if [[ "$OSTYPE" == "linux-gnu"* ]]; then
    echo "🐧 Installing system dependencies for Linux..."
    sudo apt-get update && sudo apt-get install -y \
        libnss3 \
        libnspr4 \
        libatk-bridge2.0-0 \
        libdrm2 \
        libxkbcommon0 \
        libxcomposite1 \
        libxdamage1 \
        libxrandr2 \
        libgbm1 \
        libxss1 \
        libasound2 || echo "⚠️  Some system dependencies may not be available"
fi

echo "✅ Setup complete!"
echo ""
echo "🧪 Available test commands:"
echo "  npm test                    # Run all tests"
echo "  npm run test:chromium       # Run tests on Chromium only"
echo "  npm run test:headed         # Run tests with visible browser"
echo "  npm run test:debug          # Debug tests"
echo "  npm run test:report         # View test report"
echo ""
echo "🌍 To start local server:"
echo "  python3 -m http.server 3000"
echo ""
echo "Happy testing! 🎉"