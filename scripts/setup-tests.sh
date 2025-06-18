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
    
    # Detect Ubuntu version and use appropriate package names
    LIBASOUND_PACKAGE="libasound2t64"  # Default to new package name
    
    if command -v lsb_release &> /dev/null; then
        UBUNTU_VERSION=$(lsb_release -rs | cut -d. -f1)
        echo "Detected Ubuntu version: $(lsb_release -rs)"
        
        # For Ubuntu versions older than 24, use the old package name
        if [[ $UBUNTU_VERSION -lt 24 ]]; then
            LIBASOUND_PACKAGE="libasound2"
        fi
    fi
    
    echo "Using audio package: $LIBASOUND_PACKAGE"
    
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
        $LIBASOUND_PACKAGE || echo "⚠️  Some system dependencies may not be available"
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