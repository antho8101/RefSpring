#!/bin/bash

echo "🔧 Building and deploying Firebase functions..."

# Build the functions
echo "Building TypeScript..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Build failed!"
    exit 1
fi

echo "✅ Build successful!"

# Deploy functions
echo "🚀 Deploying functions..."
npx firebase deploy --only functions

if [ $? -ne 0 ]; then
    echo "❌ Deploy failed!"
    exit 1
fi

echo "✅ Functions deployed successfully!"