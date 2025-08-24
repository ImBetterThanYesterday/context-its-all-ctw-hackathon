#!/bin/bash

# Build optimized E2B template for Rappi Creator
# Run this script to create the optimized E2B template with pre-installed dependencies

echo "🚀 Building optimized E2B template for Rappi Creator..."

# Check if E2B CLI is installed
if ! command -v e2b &> /dev/null; then
    echo "❌ E2B CLI not found. Please install it first:"
    echo "   npm install -g @e2b/cli"
    exit 1
fi

# Check if logged in to E2B
if ! e2b auth whoami &> /dev/null; then
    echo "❌ Not logged in to E2B. Please login first:"
    echo "   e2b auth login"
    exit 1
fi

echo "✅ E2B CLI found and authenticated"

# Build the template with optimized resources
echo "📦 Building E2B template with optimized configuration..."

e2b template build \
    --name "rappi-creator-optimized" \
    --dockerfile "e2b.Dockerfile" \
    --cpu-count 2 \
    --memory-mb 2048 \
    --start-cmd "echo 'Rappi Creator template ready!'" \
    --ready-cmd "curl -s http://localhost:3000 > /dev/null 2>&1 || echo 'Template initialized'" \
    --description "Optimized template for Rappi Creator with pre-installed Next.js, Vite, and dependencies"

if [ $? -eq 0 ]; then
    echo ""
    echo "🎉 Template built successfully!"
    echo ""
    echo "📋 Template Details:"
    echo "   Name: rappi-creator-optimized"
    echo "   CPU: 2 cores"
    echo "   Memory: 2GB"
    echo "   Pre-installed: Next.js, Vite, TypeScript, Tailwind CSS"
    echo ""
    echo "🔧 To use this template, update your server.ts:"
    echo "   const sandbox = await Sandbox.create({"
    echo "     template: 'rappi-creator-optimized',"
    echo "     timeoutMs: 5 * 60 * 1000"
    echo "   })"
    echo ""
    echo "🚀 Your E2B integration is now optimized for maximum performance!"
else
    echo "❌ Template build failed. Please check the error messages above."
    exit 1
fi