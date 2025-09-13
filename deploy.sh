#!/bin/bash

# Simple GitHub Pages deployment script
echo "🚀 Deploying to GitHub Pages..."

# Deploy Convex backend and build frontend
echo "📦 Building with Convex..."
npx convex deploy --cmd 'npm run build'

# Copy built files to docs folder for GitHub Pages
echo "📁 Copying build to docs folder..."
rm -rf docs
cp -r dist docs

# Add CNAME file for custom domain
echo "🌐 Adding CNAME for custom domain..."
echo "e2ee-test.paraflux.ca" > docs/CNAME

# Commit and push
echo "📤 Committing and pushing..."
git add docs
git commit -m "Deploy to GitHub Pages

🤖 Generated with [Claude Code](https://claude.ai/code)

Co-Authored-By: Claude <noreply@anthropic.com>"
git push origin main

echo "✅ Deployment complete! Your site will be live at https://e2ee-test.paraflux.ca"