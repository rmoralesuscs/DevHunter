# EXECUTE THESE COMMANDS NOW

## Your current situation:
- Frontend files are at PROJECT ROOT
- They NEED to be in `frontend/` directory
- The `frontend/` directory exists but is mostly empty

## Run ONE of these options:

### Option 1: Automated Script (Easiest)
```bash
cd /Users/rmorales/WebStormProjects/dev-hunter-01
chmod +x move-frontend-files.sh
./move-frontend-files.sh
```

### Option 2: All-in-One Command (Fast)
```bash
cd /Users/rmorales/WebStormProjects/dev-hunter-01 && \
mv App.tsx index.tsx index.html index.css frontend/ && \
mv vite.config.ts tsconfig.json tailwind.config.js postcss.config.cjs postcss.config.js vite-env.d.ts frontend/ && \
mv components services utils frontend/ && \
mv types.ts constants.tsx metadata.json frontend/ && \
mv .env.local frontend/ 2>/dev/null || true && \
rm -rf node_modules package-lock.json && \
npm install && \
echo "✅ Done! Files moved to frontend/"
```

### Option 3: Step-by-Step (Safe)
```bash
cd /Users/rmorales/WebStormProjects/dev-hunter-01

# 1. Move React/TS files
mv App.tsx frontend/
mv index.tsx frontend/
mv index.html frontend/
mv index.css frontend/

# 2. Move config files
mv vite.config.ts frontend/
mv tsconfig.json frontend/
mv tailwind.config.js frontend/
mv postcss.config.cjs frontend/
mv postcss.config.js frontend/
mv vite-env.d.ts frontend/

# 3. Move directories
mv components frontend/
mv services frontend/
mv utils frontend/

# 4. Move other files
mv types.ts frontend/
mv constants.tsx frontend/
mv metadata.json frontend/
mv .env.local frontend/

# 5. Clean up
rm -rf node_modules
rm package-lock.json

# 6. Install
npm install
```

## Verify it worked:
```bash
# Should show all frontend files
ls frontend/

# Should show: App.tsx, index.tsx, components/, services/, package.json, etc.
```

## After moving files:
```bash
# Start frontend
npm run dev

# Start backend (in another terminal)
npm run docker:up
```

## DO THIS NOW:
1. Open your terminal
2. Copy ONE of the options above
3. Paste and run it
4. Verify files moved with `ls frontend/`

---

