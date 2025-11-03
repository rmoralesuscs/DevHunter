#!/bin/bash
# Script to reorganize monorepo: move frontend files to frontend/ directory

set -e

echo "🔄 Reorganizing Dev Hunter Monorepo..."
echo ""

# Create frontend directory if it doesn't exist
mkdir -p frontend

# Files and directories to move to frontend/
FRONTEND_FILES=(
    "App.tsx"
    "index.tsx"
    "index.html"
    "index.css"
    "vite.config.ts"
    "tsconfig.json"
    "tailwind.config.js"
    "postcss.config.cjs"
    "postcss.config.js"
    "vite-env.d.ts"
    "types.ts"
    "constants.tsx"
    "metadata.json"
    "components"
    "services"
    "utils"
    ".env.local"
)

echo "📦 Moving frontend files to frontend/ directory..."
for item in "${FRONTEND_FILES[@]}"; do
    if [ -e "$item" ] && [ "$item" != "frontend" ]; then
        echo "  Moving: $item"
        mv "$item" frontend/ 2>/dev/null || true
    fi
done

# Copy node_modules and package-lock.json if they exist (don't move, will reinstall)
echo ""
echo "📦 Handling node_modules..."
if [ -d "node_modules" ]; then
    echo "  Removing root node_modules (will reinstall in frontend/)"
    rm -rf node_modules
fi
if [ -f "package-lock.json" ]; then
    echo "  Removing root package-lock.json"
    rm -f package-lock.json
fi

echo ""
echo "✅ Reorganization complete!"
echo ""
echo "📁 New structure:"
echo "   dev-hunter-01/"
echo "   ├── frontend/          ← React/TypeScript/Vite"
echo "   ├── backend/           ← Java/Spring Boot"
echo "   ├── package.json       ← Root workspace manager"
echo "   └── docker-compose.yml"
echo ""
echo "🚀 Next steps:"
echo "   1. cd /Users/rmorales/WebStormProjects/dev-hunter-01"
echo "   2. npm install"
echo "   3. npm run dev"
echo ""

