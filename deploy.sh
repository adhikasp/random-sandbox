#!/bin/bash

# SuperMap Deployment Script
# Helps deploy SuperMap to GitHub Pages or other static hosting

echo "🚀 SuperMap Deployment Helper"
echo "=============================="

# Check if we're in a git repository
if [ ! -d ".git" ]; then
    echo "❌ Error: Not in a git repository"
    echo "   Please run 'git init' first or run this script from a git repository"
    exit 1
fi

# Function to deploy to GitHub Pages
deploy_github_pages() {
    echo "📦 Preparing for GitHub Pages deployment..."
    
    # Check if gh-pages branch exists
    if git show-ref --quiet refs/heads/gh-pages; then
        echo "✅ gh-pages branch exists"
    else
        echo "🆕 Creating gh-pages branch..."
        git checkout --orphan gh-pages
        git reset --hard
        git commit --allow-empty -m "Initial gh-pages commit"
        git checkout main 2>/dev/null || git checkout master
    fi
    
    # Build and deploy
    echo "🏗️  Building SuperMap..."
    
    # Copy files to temporary directory
    temp_dir=$(mktemp -d)
    cp index.html "$temp_dir/"
    cp app.js "$temp_dir/"
    cp manifest.json "$temp_dir/"
    cp sw.js "$temp_dir/"
    cp README.md "$temp_dir/"
    
    # Check if demo.html exists and copy it
    if [ -f "demo.html" ]; then
        cp demo.html "$temp_dir/"
        echo "📄 Demo page included"
    fi
    
    # Switch to gh-pages branch
    git checkout gh-pages
    
    # Clear existing files (except .git)
    find . -maxdepth 1 -not -name '.git' -not -name '.' -exec rm -rf {} +
    
    # Copy new files
    cp -r "$temp_dir/"* .
    
    # Add and commit
    git add .
    git commit -m "Deploy SuperMap $(date '+%Y-%m-%d %H:%M:%S')"
    
    # Push to GitHub
    echo "🚀 Pushing to GitHub Pages..."
    git push origin gh-pages
    
    # Switch back to main branch
    git checkout main 2>/dev/null || git checkout master
    
    # Clean up
    rm -rf "$temp_dir"
    
    echo "✅ Deployment complete!"
    echo "🌐 Your SuperMap will be available at:"
    echo "   https://$(git config user.name).github.io/$(basename $(git rev-parse --show-toplevel))"
    echo ""
    echo "⏱️  Note: It may take a few minutes for GitHub Pages to update"
}

# Function to build for static hosting
build_static() {
    echo "📦 Building SuperMap for static hosting..."
    
    # Create build directory
    build_dir="dist"
    rm -rf "$build_dir"
    mkdir -p "$build_dir"
    
    # Copy files
    cp index.html "$build_dir/"
    cp app.js "$build_dir/"
    cp manifest.json "$build_dir/"
    cp sw.js "$build_dir/"
    cp README.md "$build_dir/"
    
    # Copy demo if it exists
    if [ -f "demo.html" ]; then
        cp demo.html "$build_dir/"
    fi
    
    echo "✅ Build complete!"
    echo "📁 Files ready in '$build_dir' directory"
    echo "🌐 Upload the contents of '$build_dir' to your web server"
}

# Function to run local server
run_local() {
    echo "🖥️  Starting local development server..."
    
    # Check if Python is available
    if command -v python3 &> /dev/null; then
        echo "🐍 Using Python 3"
        echo "🌐 SuperMap will be available at: http://localhost:8000"
        echo "🛑 Press Ctrl+C to stop the server"
        echo ""
        python3 -m http.server 8000
    elif command -v python &> /dev/null; then
        echo "🐍 Using Python 2"
        echo "🌐 SuperMap will be available at: http://localhost:8000"
        echo "🛑 Press Ctrl+C to stop the server"
        echo ""
        python -m SimpleHTTPServer 8000
    elif command -v node &> /dev/null; then
        echo "📦 Using Node.js http-server"
        if ! command -v http-server &> /dev/null; then
            echo "📥 Installing http-server..."
            npm install -g http-server
        fi
        echo "🌐 SuperMap will be available at: http://localhost:8000"
        echo "🛑 Press Ctrl+C to stop the server"
        echo ""
        http-server -p 8000
    else
        echo "❌ No suitable server found"
        echo "   Please install Python or Node.js to run a local server"
        echo "   Or simply open index.html in your web browser"
    fi
}

# Function to check project status
check_status() {
    echo "🔍 SuperMap Project Status"
    echo "========================="
    
    # Check required files
    required_files=("index.html" "app.js" "manifest.json" "sw.js")
    missing_files=()
    
    for file in "${required_files[@]}"; do
        if [ -f "$file" ]; then
            echo "✅ $file"
        else
            echo "❌ $file (missing)"
            missing_files+=("$file")
        fi
    done
    
    # Check optional files
    optional_files=("demo.html" "README.md")
    for file in "${optional_files[@]}"; do
        if [ -f "$file" ]; then
            echo "📄 $file (optional)"
        fi
    done
    
    echo ""
    
    if [ ${#missing_files[@]} -eq 0 ]; then
        echo "🎉 All required files present!"
        echo "✅ SuperMap is ready for deployment"
    else
        echo "⚠️  Missing files: ${missing_files[*]}"
        echo "❌ Please ensure all required files are present"
    fi
    
    # Check git status
    if [ -d ".git" ]; then
        echo ""
        echo "📊 Git Status:"
        git status --porcelain | head -5
        
        if [ -n "$(git status --porcelain)" ]; then
            echo "📝 You have uncommitted changes"
        else
            echo "✅ Working directory clean"
        fi
    fi
}

# Main menu
case "$1" in
    "github")
        deploy_github_pages
        ;;
    "build")
        build_static
        ;;
    "serve")
        run_local
        ;;
    "status")
        check_status
        ;;
    *)
        echo "Usage: $0 {github|build|serve|status}"
        echo ""
        echo "Commands:"
        echo "  github  - Deploy to GitHub Pages"
        echo "  build   - Build for static hosting"
        echo "  serve   - Run local development server"
        echo "  status  - Check project status"
        echo ""
        echo "Examples:"
        echo "  $0 serve    # Start local server"
        echo "  $0 github   # Deploy to GitHub Pages"
        echo "  $0 build    # Build for production"
        echo "  $0 status   # Check project files"
        ;;
esac