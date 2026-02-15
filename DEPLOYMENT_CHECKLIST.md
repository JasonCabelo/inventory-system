# Enterprise Inventory System - Deployment Checklist

## Phase 1: Pre-Deployment (Local)

### Code & Repository Setup
- [ ] All code committed to Git
- [ ] No uncommitted changes (`git status` shows clean)
- [ ] Repository pushed to GitHub
- [ ] Branch is `main` or `master`

### Dependencies & Building
- [ ] Node.js 18+ installed (`node --version`)
- [ ] npm installed (`npm --version`)
- [ ] `npm install` completed without errors
- [ ] `npm run build` completes successfully
- [ ] Build output exists in `src/dist/`

### Local Testing
- [ ] `npm run dev:server` works without errors
- [ ] `npm run dev:client` works without errors
- [ ] Can login locally with test credentials
- [ ] Can perform CRUD operations locally
- [ ] API endpoints respond to requests

---

## Phase 2: Environment & Credentials

### MongoDB Setup
- [ ] MongoDB Atlas account created (https://mongodb.com/cloud/atlas)
- [ ] New project created in MongoDB Atlas
- [ ] Free cluster deployed
- [ ] Database user created with strong password
- [ ] Connection string copied: `mongodb+srv://username:password@...`

### Security Credentials
- [ ] JWT_SECRET generated
  ```bash
  node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
  ```
- [ ] JWT_SECRET is at least 32 characters
- [ ] JWT_SECRET is recorded securely
- [ ] No credentials committed to Git

### Environment Files
- [ ] `.env.production.example` file exists
- [ ] `.env.production` file created
- [ ] `MONGODB_URI` filled in correctly
- [ ] `JWT_SECRET` filled in correctly
- [ ] `JWT_EXPIRES_IN` set to `30d`
- [ ] `.env.production` is in `.gitignore`

---

## Phase 3: Render Backend Deployment

### Account & Project Setup
- [ ] Render account created (https://render.com)
- [ ] GitHub connected to Render account
- [ ] Repository accessible from Render

### Deployment Method: Render Blueprint (Automatic)

#### Using render.yaml:
- [ ] `render.yaml` exists in project root
- [ ] `render.yaml` is valid YAML syntax
- [ ] Go to https://render.com/dashboard
- [ ] Click "New +" → "Blueprint"
- [ ] Select GitHub repository
- [ ] Select `main` branch
- [ ] Click "Apply"

#### During Deployment:
- [ ] Build completes without errors
- [ ] Service gets a URL (e.g., `https://inventory-api.onrender.com`)
- [ ] Record the backend URL
- [ ] API health check responds: `curl https://your-backend/api/health`

#### Environment Variables Set in Render:
- [ ] `MONGODB_URI` = Your MongoDB connection string
- [ ] `JWT_SECRET` = Your generated JWT secret
- [ ] `FRONTEND_URL` = Leave empty for now (update after Vercel)
- [ ] `NODE_ENV` = `production`
- [ ] `JWT_EXPIRES_IN` = `30d`

### Alternative: Manual Render Setup

If Render Blueprint doesn't work:
- [ ] Click "New +" → "Web Service"
- [ ] Connect GitHub repository
- [ ] Configuration:
  - [ ] Name: `inventory-api`
  - [ ] runtime: `Node`
  - [ ] Build Command: `cd server && npm install`
  - [ ] Start Command: `npm start --workspace=server`
  - [ ] Plan: Free
- [ ] Add all environment variables
- [ ] Deploy

### Post-Render Deployment:
- [ ] Deployment shows "Live" status
- [ ] Logs show: "✓ Database connected in background"
- [ ] Health endpoint returns 200 status
- [ ] Service URL recorded

---

## Phase 4: Vercel Frontend Deployment

### Account & Project Setup
- [ ] Vercel account created (https://vercel.com)
- [ ] GitHub connected to Vercel
- [ ] Vercel CLI installed: `npm install -g vercel`

### Deployment Option A: Via CLI (Recommended)

```bash
# 1. Login
vercel login

# 2. Deploy
vercel --prod

# 3. When prompted:
#    - Project name: enterprise-inventory-system
#    - Framework: Vite
#    - Root directory: ./src
#    - Enable Source Maps: No
```

- [ ] CLI deployment succeeds
- [ ] Deployment URL provided (e.g., `https://project.vercel.app`)
- [ ] Record the frontend URL

### Deployment Option B: Via Dashboard

- [ ] Go to https://vercel.com/dashboard
- [ ] Click "Add New" → "Project"
- [ ] Import GitHub repository
- [ ] Configuration:
  - [ ] Framework: Vite
  - [ ] Root Directory: ./src
  - [ ] Node version: 18.x
- [ ] Environment Variables section:
  - [ ] Add `VITE_API_URL` = `https://your-render-backend/api`
- [ ] Click "Deploy"

### Environment Variables in Vercel:
- [ ] `VITE_API_URL` set to your Render backend URL with `/api` suffix
- [ ] Format: `https://inventory-api.onrender.com/api`
- [ ] No trailing slash after `/api`

### Post-Vercel Deployment:
- [ ] Deployment shows success
- [ ] Deployment URL is live
- [ ] Frontend loads without errors in browser
- [ ] No console errors in browser DevTools
- [ ] API calls are being made to correct endpoint

---

## Phase 5: Final Configuration & Testing

### Update Backend FRONTEND_URL

- [ ] Go back to Render dashboard
- [ ] Select `inventory-api` service
- [ ] Go to Settings → Environment
- [ ] Update `FRONTEND_URL` to your Vercel URL:
  - [ ] Value: `https://your-project.vercel.app`
  - [ ] NO trailing slash
- [ ] Click "Save"
- [ ] Service auto-redeploys
- [ ] Wait for redeployment to complete

### Database Initialization

- [ ] Check if admin account exists
- [ ] If not, run seed script (check Render logs for initial password)

### Functionality Testing

#### Authentication Flow:
- [ ] Can visit frontend without errors
- [ ] Can see login form
- [ ] Can enter credentials
- [ ] Can click "Sign In"
- [ ] Login request goes to backend (check Network tab)
- [ ] Receive valid JWT token
- [ ] Redirected to dashboard after login

#### Dashboard:
- [ ] Dashboard loads successfully
- [ ] All menu items visible
- [ ] No 401/403 errors in Network tab

#### CRUD Operations:
- [ ] Can create a product
- [ ] Can view list of products
- [ ] Can edit a product
- [ ] Can delete a product
- [ ] Can create a category
- [ ] Can create a supplier
- [ ] Can create a user (admin only)

#### Audit Logs:
- [ ] Audit log page loads
- [ ] Can see recent operations
- [ ] Each action is logged
- [ ] Log entries have correct timestamps

### Security Testing:
- [ ] HTTPS is enabled (URL shows https://)
- [ ] No sensitive data in Network requests
- [ ] JWT token is httpOnly (check cookies)
- [ ] Can logout successfully
- [ ] Cannot access protected pages without login

---

## Phase 6: Production Verification

### Performance:
- [ ] Frontend loads in <3 seconds
- [ ] API responses in <1 second
- [ ] No 5xx errors in logs

### Monitoring:
- [ ] Render logs are accessible
- [ ] Vercel logs are accessible
- [ ] Can see deployment history
- [ ] Can view current environment variables

### Scalability:
- [ ] Multiple simultaneous users work
- [ ] Database queries are indexed
- [ ] No N+1 query problems in logs

### Backups:
- [ ] MongoDB Atlas automatic backups enabled
- [ ] GitHub repository is backed up
- [ ] Can restore from backup if needed

---

## Phase 7: Post-Deployment

### Documentation:
- [ ] Deployment documented in DEPLOYMENT_SUMMARY.md
- [ ] Environment variables documented
- [ ] Admin credentials stored securely
- [ ] Backend URL documented
- [ ] Frontend URL documented

### Monitoring Setup:
- [ ] Set up email alerts for deployment failures
- [ ] Monitor error rates
- [ ] Check logs regularly for issues

### Maintenance:
- [ ] Establish update schedule
- [ ] Plan for scaling if needed
- [ ] Document any production issues
- [ ] Keep MongoDB Atlas updated

---

## Troubleshooting Checklist

### If Getting 500 Errors:
- [ ] Check Render logs for error messages
- [ ] Verify MONGODB_URI is correct
- [ ] Verify JWT_SECRET is set
- [ ] Check MongoDB Atlas network access includes Render IP
- [ ] Redeploy after fixing errors

### If CORS Errors:
- [ ] Verify FRONTEND_URL in Render env vars (must be exact domain)
- [ ] Check VITE_API_URL in Vercel (must include `/api`)
- [ ] Ensure no trailing slashes where not needed
- [ ] Redeploy both services

### If Frontend Can't Reach Backend:
- [ ] Test backend health: `curl https://your-backend/api/health`
- [ ] Verify VITE_API_URL is correct in Vercel
- [ ] Check Network tab in browser DevTools
- [ ] Look at exact error message

### If Login Fails:
- [ ] Check admin account exists in database
- [ ] Verify MONGODB_URI is correct
- [ ] Check JWT_SECRET is set in backend
- [ ] Review backend logs for errors
- [ ] Test with valid credentials

### If Render Free Tier Spins Down:
- [ ] This is expected - service stops after 15 min inactivity
- [ ] First request after spin-down will be slow
- [ ] Upgrade to paid tier to prevent this
- [ ] Consider uptime monitoring service

---

## Additional Commands

### Local Development:
```bash
npm install              # Install dependencies
npm run dev             # Run both frontend and backend
npm run build           # Build frontend
npm run dev:server      # Backend only
npm run dev:client      # Frontend only
```

### Verify Deployment:
```bash
# Test backend
curl https://your-backend/api/health

# Test specific endpoint (requires auth for most)
curl https://your-backend/api/products

# Check frontend
curl https://your-frontend
```

### View Logs:
```bash
# Render: Go to Dashboard → Service → Logs
# Vercel: Go to Dashboard → Deployments → Details → Logs

# Or use CLI if configured
vercel logs               # Vercel logs
```

---

## Quick Reference Links

| Service | Link |
|---------|------|
| Render Dashboard | https://render.com/dashboard |
| Vercel Dashboard | https://vercel.com/dashboard |
| MongoDB Atlas | https://cloud.mongodb.com/ |
| Project GitHub | https://github.com/your-username/your-repo |
| Render Service Logs | Check dashboard after deployment |
| Vercel Build Logs | Check dashboard after deployment |

---

## Support

**Deployment Guide:** See `DEPLOYMENT_GUIDE.md`
**Quick Reference:** See `DEPLOYMENT_QUICK_REFERENCE.md`
**Summary:** See `DEPLOYMENT_SUMMARY.md`

---

## Status

- **Date Created:** February 15, 2026
- **Last Updated:** February 15, 2026
- **Version:** 1.0
- **Status:** Ready for Production Deployment

---

**Total Estimated Time:** 30-45 minutes (first time)

✅ **All systems configured and ready to deploy!**
