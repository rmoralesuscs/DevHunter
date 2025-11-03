# Monorepo Reorganization Guide

## Overview

This guide helps you migrate from the mixed structure (frontend at root) to a clean **frontend/** and **backend/** package structure.

## Before & After

### Before (Mixed Structure)
```
dev-hunter-01/
├── App.tsx                    # Frontend files at root
├── index.tsx
├── components/
├── services/
├── package.json               # Frontend deps
├── backend/                   # Backend separate
│   ├── src/
│   └── pom.xml
└── docker-compose.yml
```

### After (Clean Separation)
```
dev-hunter-01/
├── frontend/                  # Frontend package
│   ├── App.tsx
│   ├── index.tsx
│   ├── components/
│   ├── services/
│   └── package.json
├── backend/                   # Backend package
│   ├── src/
│   └── pom.xml
├── package.json               # Root workspace manager
└── docker-compose.yml
```

## Migration Steps

### Option 1: Automated Script (Recommended)

```bash
# From project root
chmod +x reorganize-monorepo.sh
./reorganize-monorepo.sh
```

The script will:
1. Create `frontend/` directory
2. Move all frontend files into it
3. Clean up root node_modules
4. Display next steps

### Option 2: Manual Migration

#### Step 1: Create Frontend Directory

```bash
cd /Users/rmorales/WebStormProjects/dev-hunter-01
mkdir -p frontend
```

#### Step 2: Move Frontend Files

```bash
# Move TypeScript/React files
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

# Move other files
mv types.ts frontend/
mv constants.tsx frontend/
mv metadata.json frontend/

# Move environment file
mv .env.local frontend/
```

#### Step 3: Clean Up Dependencies

```bash
# Remove root node_modules (will reinstall in workspace)
rm -rf node_modules
rm package-lock.json
```

#### Step 4: Install Dependencies

```bash
# From project root
npm install
```

This will:
- Install root workspace dependencies
- Automatically install frontend dependencies via workspaces

## Post-Migration Steps

### 1. Verify Structure

```bash
ls -la
# Should see: frontend/ backend/ package.json docker-compose.yml

ls -la frontend/
# Should see: App.tsx index.tsx components/ services/ package.json

ls -la backend/
# Should see: src/ pom.xml Dockerfile
```

### 2. Test Frontend

```bash
# From root
npm run dev

# Or from frontend
cd frontend
npm run dev
```

Should start Vite dev server at http://localhost:5173

### 3. Test Backend

```bash
# From root
npm run docker:up

# Check health
curl http://localhost:8080/actuator/health
```

Should return: `{"status":"UP"}`

### 4. Verify Integration

1. Open http://localhost:5173
2. Look for 🟢 "Backend Connected" indicator
3. Test search functionality
4. Check browser console for errors

## Updated Commands

### Before Migration

```bash
# Frontend
npm install              # Root
npm run dev              # Root

# Backend
cd backend
mvn spring-boot:run
```

### After Migration

```bash
# Frontend (from root)
npm run dev              # Uses workspace
npm run build            # Uses workspace

# Frontend (from frontend/)
cd frontend
npm run dev              # Direct

# Backend (from root)
npm run dev:backend      # Maven
npm run docker:up        # Docker

# Backend (from backend/)
cd backend
mvn spring-boot:run
```

## Rollback (If Needed)

If something goes wrong, you can rollback:

```bash
# Move everything back to root
mv frontend/* .
rmdir frontend
npm install
```

## Troubleshooting

### "Cannot find module" errors

**Problem**: Import paths are broken after moving files

**Solution**: The imports should work automatically since files moved together. If not:
```bash
cd frontend
rm -rf node_modules
npm install
```

### "Workspace not found" error

**Problem**: Root package.json not configured for workspaces

**Solution**: Verify root `package.json` has:
```json
{
  "workspaces": ["frontend"]
}
```

### Frontend won't start

**Problem**: Dependencies not installed in frontend/

**Solution**:
```bash
# From root
npm install

# Or directly in frontend
cd frontend
npm install
```

### Backend can't find files

**Problem**: Docker volume paths might be outdated

**Solution**: Backend is unchanged, should work as-is. If issues:
```bash
docker-compose down -v
docker-compose up -d --build
```

## Benefits of New Structure

✅ **Clarity** - Obvious where frontend and backend code lives  
✅ **Standards** - Matches industry-standard monorepo patterns  
✅ **Isolation** - Each package is completely independent  
✅ **Scalability** - Easy to add more packages (mobile, admin, CLI, etc.)  
✅ **IDE Support** - Better language server performance  
✅ **CI/CD** - Easier to build/test packages independently  

## Next Steps After Migration

1. ✅ Update any custom scripts that reference root files
2. ✅ Update CI/CD pipelines if you have them
3. ✅ Update deployment documentation
4. ✅ Commit the new structure:
   ```bash
   git add .
   git commit -m "refactor: reorganize monorepo with frontend/ and backend/ packages"
   ```

## Verification Checklist

- [ ] `frontend/` directory exists with all frontend files
- [ ] `backend/` directory unchanged
- [ ] Root `package.json` has workspaces configuration
- [ ] `npm run dev` starts frontend
- [ ] `npm run docker:up` starts backend
- [ ] Frontend shows "Backend Connected"
- [ ] No console errors in browser
- [ ] Backend health check returns UP

## Support

If you encounter issues during migration:

1. Check this guide's troubleshooting section
2. Review QUICKSTART.md for setup instructions
3. Check README.md for current structure
4. Verify all files moved correctly

---

**Migration completed successfully when you can run `npm run dev` and see the app working! 🎉**

