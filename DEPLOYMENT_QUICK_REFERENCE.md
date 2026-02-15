# Quick Deployment Reference

## Prerequisites Checklist

- [ ] GitHub account with repository
- [ ] MongoDB Atlas account (free tier available)
- [ ] Vercel account (https://vercel.com)
- [ ] Render account (https://render.com)
- [ ] Node.js 18+ installed locally
- [ ] Git configured with GitHub

---

## Environment Setup (5 minutes)

### 1. Get MongoDB Connection String

```bash
# 1. Go to https://mongodb.com/cloud/atlas
# 2. Create free cluster
# 3. Create database user
# 4. Get connection string:
# mongodb+srv://username:password@cluster.mongodb.net/inventory
```

### 2. Generate JWT Secret

```bash
# Generate a strong random string
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 3. Update .env.production

```bash
# Copy example and fill in your values
cp .env.production.example .env.production

# Edit .env.production with your actual values:
# - MONGODB_URI
# - JWT_SECRET
# - FRONTEND_URL (after Vercel deployment)
```

### 4. Local Testing

```bash
# Install dependencies
npm install

# Test frontend build
npm run build

# Test server locally (requires .env configuration)
npm run dev:server
```

---

## Deployment Methods

### Method 1: Render Backend + Vercel Frontend (RECOMMENDED)

#### Deploy Backend to Render

**Option A: Automatic (Using render.yaml)**

```bash
# 1. Push code to GitHub
git add .
git commit -m "Deploy configuration"
git push origin main

# 2. Go to https://render.com/dashboard
# 3. Click "New +" → "Blueprint"
# 4. Select your GitHub repository
# 5. Click "Apply"
# 6. Configure environment variables in dashboard
```

**Option B: Manual**

```bash
# 1. Visit https://render.com/dashboard
# 2. New → Web Service
# 3. Connect GitHub repo
# 4. Configure:
#    Name: inventory-api
#    Runtime: Node
#    Build Command: cd server && npm install
#    Start Command: npm start --workspace=server
# 5. Add Environment Variables:
#    - MONGODB_URI
#    - JWT_SECRET
#    - FRONTEND_URL
#    - NODE_ENV=production
# 6. Deploy
#
# Note: Free tier spins down after 15 minutes of inactivity
```

#### Deploy Frontend to Vercel

```bash
# 1. Install Vercel CLI
npm install -g vercel

# 2. Login to Vercel
vercel login

# 3. Deploy
vercel --prod

# 4. Follow prompts and set environment variables:
#    VITE_API_URL=https://inventory-api.onrender.com/api
```

**Or via Dashboard:**

```
1. Visit https://vercel.com/dashboard
2. Import Project → Select GitHub Repo
3. Framework: Vite
4. Root Directory: ./src
5. Environment Variables:
   VITE_API_URL = https://inventory-api.onrender.com/api
6. Deploy
```

---

### Method 2: Full Stack on Vercel

```bash
# 1. Install Vercel CLI
npm install -g vercel

# 2. Deploy everything to Vercel
vercel --prod

# 3. Set environment variables in Vercel dashboard:
#    - MONGODB_URI
#    - JWT_SECRET
#    - FRONTEND_URL
#    - NODE_ENV=production
```

---

## Post-Deployment

### 1. Test API Health

```bash
# Test the health endpoint
curl https://your-api-domain/api/health

# Should return: {"status":"OK","message":"API is running"}
```

### 2. Test Frontend

```bash
# Open in browser
https://your-frontend-domain

# Try to login with:
# Email: admin@inventory.com
# (Password is generated during first seed)
```

### 3. Verify Database Connection

```bash
# Check server logs for connection message
# "✓ Database connected in background"
```

### 4. Create Admin Account (if needed)

```bash
# Locally or in Render shell:
npm run seed-admin --workspace=server
```

---

## Troubleshooting

### Database Connection Failed

```bash
# Check 1: Verify connection string
echo $MONGODB_URI

# Check 2: Add deployment IP to MongoDB Atlas
# Go to: MongoDB Atlas → VPC Access or Network Access
# Add: 0.0.0.0/0 (or specific IP)

# Check 3: Restart service
# Render: Dashboard → Service → Redeploy
# Vercel: Redeploy from dashboard
```

### CORS Errors

```bash
# Check .env variables:
# FRONTEND_URL should match your actual frontend domain
# No trailing slashes

# Restart services after updating env vars
```

### 500 API Errors

```bash
# 1. Check recent logs
# Render: Dashboard → Logs
# Vercel: Deployments → Logs

# 2. Common issues:
#    - Missing environment variables
#    - Database connection failed
#    - Invalid JWT_SECRET format

# 3. Redeploy after fixes
```

### Frontend Can't Reach API

```bash
# Check 1: Verify VITE_API_URL is correct
# Should be: https://your-api-domain/api

# Check 2: Verify backend is running
curl https://your-api-domain/api/health

# Check 3: Check CORS configuration
# server/index.js → cors configuration
```

---

## Monitoring

### Render Logs

```bash
# Via Dashboard → Service → Logs
# Or use Render CLI

# Watch logs in real-time
render logs --service inventory-api
```

### Vercel Logs

```bash
# Via Dashboard → Deployments → Logs
# Or use Vercel CLI

vercel logs
```

### MongoDB Atlas

```bash
# Monitor at: MongoDB Atlas → Metrics
# Check connection count
# Monitor query performance
# Review failed operations
```

---

## Updating Production

### After Code Changes

```bash
# 1. Commit and push
git add .
git commit -m "your message"
git push origin main

# 2. Automatic redeploy
# Both Render and Vercel redeploy automatically on push
# Watch deployment progress in dashboards

# 3. Verify deployment
# Check logs for errors
# Test relevant endpoints
```

---

## Cost Considerations

| Service | Free Tier | Paid | Notes |
|---------|-----------|------|-------|
| Render | Backend (spins down after 15min inactivity) | From $7/mo | Great for testing |
| Vercel | Frontend + Serverless API | Scales as used | Excellent for full-stack |
| MongoDB | 512MB free cluster | From free-$29/mo | Enough for learning |
| GitHub | Unlimited public/private repos | Free for most uses | Required for both |

---

## Useful Links

- Render Docs: https://render.com/docs
- Vercel Docs: https://vercel.com/docs
- MongoDB Atlas: https://www.mongodb.com/cloud/atlas
- Express.js: https://expressjs.com/
- React: https://react.dev/
- Vite: https://vitejs.dev/

---

## Commands Quick Reference

```bash
# Local Development
npm install              # Install all dependencies
npm run dev             # Run both frontend and backend
npm run dev:server      # Run backend only
npm run dev:client      # Run frontend only

# Building
npm run build           # Build frontend for production

# Deployment
npm run deploy:vercel   # Deploy to Vercel via CLI
npm run pre-deploy      # Prepare for deployment

# Testing
npm run dev             # Test locally before deployment
curl http://localhost:3001/api/health  # Test local API
```

---

**Last Updated**: February 2026
**Environment**: Production-ready
