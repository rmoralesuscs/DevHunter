#!/bin/bash
# Execute this script to move all frontend files to frontend/ directory

set -e

cd /Users/rmorales/WebStormProjects/dev-hunter-01

echo "Moving frontend files to frontend/ directory..."

# Move React/TypeScript source files
mv App.tsx frontend/
mv index.tsx frontend/
mv index.html frontend/
mv index.css frontend/

# Move configuration files
mv vite.config.ts frontend/
mv tsconfig.json frontend/
mv tailwind.config.js frontend/
mv postcss.config.cjs frontend/
mv postcss.config.js frontend/
mv vite-env.d.ts frontend/

# Move source directories
mv components frontend/
mv services frontend/
mv utils frontend/

# Move type definitions and constants
mv types.ts frontend/
mv constants.tsx frontend/
mv metadata.json frontend/

# Move environment file
mv .env.local frontend/ 2>/dev/null || echo ".env.local already moved or doesn't exist"

# Clean up old dependencies
rm -rf node_modules
rm -f package-lock.json

echo "✅ All frontend files moved to frontend/"
echo ""
echo "Next steps:"
echo "  1. npm install"
echo "  2. npm run dev"

