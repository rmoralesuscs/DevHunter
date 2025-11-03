# Dev Hunter - Startup Checklist

## ✅ Before You Start

### 1. Check Docker Desktop is Running

**Action**: Open Docker Desktop application
- Location: `/Applications/Docker.app`
- Or: Press `Cmd+Space`, type "Docker", press Enter

**Wait for**:
- Whale icon appears in menu bar (top-right)
- Status shows "Docker Desktop is running"

**Verify**:
 bash
docker ps
 
Should show a table (even if empty), not an error.

---

### 2. Start Backend Services

**Once Docker is running**:
 bash
cd /Users/rmorales/WebStormProjects/dev-hunter-01
docker-compose up -d
 

**Expected output**:
 
Creating network "dev-hunter-01_default" with the default driver
Creating devhunter-postgres ... done
Creating devhunter-backend  ... done
 

**Verify**:
 bash
# Check services are running
docker-compose ps

# Should show both services as "Up"

# Check backend health
curl http://localhost:8080/actuator/health

# Should return: {"status":"UP"}
 

---

### 3. Start Frontend

**In a new terminal**:
 bash
cd /Users/rmorales/WebStormProjects/dev-hunter-01

# First time only
npm install

# Every time
npm run dev
 

**Expected output**:
 
VITE v6.x.x  ready in XXX ms
➜  Local:   http://localhost:5173/
 

---

## 🌐 Access Applications

Once all services are running:

- **Frontend**: http://localhost:5173
  - Look for 🟢 "Backend Connected" in top-right
  
- **Backend API**: http://localhost:8080
  
- **Swagger UI**: http://localhost:8080/swagger-ui.html

---

## ❌ Common Errors & Fixes

### "Cannot connect to the Docker daemon"

**Problem**: Docker Desktop is not running

**Fix**:
1. Open Docker Desktop app
2. Wait for whale icon in menu bar
3. Try command again

---

### "Port is already allocated"

**Problem**: Port 8080 or 5432 is already in use

**Fix**:
 bash
# Find what's using port 8080
lsof -i :8080

# Find what's using port 5432
lsof -i :5432

# Kill the process (replace PID with actual number)
kill -9 <PID>

# Or stop all Docker containers
docker-compose down
 

---

### Frontend shows "Offline Mode"

**Problem**: Backend is not responding

**Check**:
 bash
# Are services running?
docker-compose ps

# View backend logs
docker-compose logs backend

# Check health endpoint
curl http://localhost:8080/actuator/health
 

**Fix**:
 bash
# Restart backend
docker-compose restart backend

# Or restart everything
docker-compose down
docker-compose up -d
 

---

### "WARN: AZURE_STORAGE_CONNECTION_STRING variable is not set"

**Problem**: Missing environment variable (safe to ignore for local dev)

**Fix**: Already fixed - `backend/.env` file created with placeholders

---

## 🛑 Stopping Services

 bash
# Stop backend services (keeps data)
docker-compose down

# Stop backend and delete all data
docker-compose down -v

# Stop frontend
# Press Ctrl+C in the terminal running npm run dev
 

---

## 📋 Quick Reference

### Daily Workflow

 bash
# Morning
cd /Users/rmorales/WebStormProjects/dev-hunter-01

# Start Docker Desktop first! (from Applications)
# Then:
docker-compose up -d
npm run dev

# Work on frontend (auto-reloads)

# Evening
docker-compose down
# Ctrl+C in frontend terminal
 

### Helpful Commands

 bash
# View all logs
docker-compose logs -f

# View backend logs only
docker-compose logs -f backend

# View database logs only
docker-compose logs -f postgres

# Restart backend
docker-compose restart backend

# Check what's running
docker-compose ps

# Access database
docker exec -it devhunter-postgres psql -U devhunter -d devhunter
 

---

## ✅ Success Checklist

Before reporting issues, verify:

- [ ] Docker Desktop is running (whale icon in menu bar)
- [ ] `docker ps` works without error
- [ ] `docker-compose ps` shows both services as "Up"
- [ ] `curl http://localhost:8080/actuator/health` returns `{"status":"UP"}`
- [ ] Frontend at http://localhost:5173 shows 🟢 "Backend Connected"

If all checks pass, the system is working correctly! 🎉

