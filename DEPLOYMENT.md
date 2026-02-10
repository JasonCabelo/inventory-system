# Deployment Guide

## Overview
- **Frontend**: Deployed to Vercel (React + Vite)
- **Backend**: Deployed to Render (Express + MongoDB)

---

## Prerequisites
- Vercel account (https://vercel.com)
- Render account (https://render.com)
- MongoDB Atlas cluster (or other MongoDB provider)

---

## Step 1: Deploy Backend to Render

### Option A: Using Render Dashboard (Recommended)
1. Go to https://dashboard.render.com/
2. Click "New +" → "Web Service"
3. Connect your GitHub repository
4. Configure the service:
   - **Name**: `enterprise-inventory-api`
   - **Runtime**: Node
   - **Build Command**: `cd server && npm install`
   - **Start Command**: `cd server && npm start`
   - **Plan**: Free

5. Add Environment Variables:
   ```
   NODE_ENV=production
   PORT=10000
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_super_secret_jwt_key
   JWT_EXPIRES_IN=30d
   FRONTEND_URL=your_vercel_frontend_url (e.g., https://your-app.vercel.app)
   ```

6. Click "Create Web Service"

### Option B: Using render.yaml (Blueprint)
1. Push the `render.yaml` file to your repository
2. In Render dashboard, click "New +" → "Blueprint"
3. Connect your repository
4. Render will automatically detect and configure the service

---

## Step 2: Deploy Frontend to Vercel

### Using Vercel CLI
```bash
# Install Vercel CLI
npm i -g vercel

# Navigate to project root
cd enterprise-inventory-system

# Deploy
vercel
```

### Using Vercel Dashboard
1. Go to https://vercel.com/dashboard
2. Click "Add New..." → "Project"
3. Import your GitHub repository
4. Configure:
   - **Framework Preset**: Vite
   - **Root Directory**: `src`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

5. Add Environment Variables:
   ```
   VITE_API_URL=https://your-render-api-url.onrender.com/api
   ```

6. Click "Deploy"

---

## Environment Variables Reference

### Backend (Render)
| Variable | Description | Example |
|----------|-------------|---------|
| `NODE_ENV` | Environment mode | `production` |
| `PORT` | Server port | `10000` |
| `MONGODB_URI` | MongoDB connection string | `mongodb+srv://...` |
| `JWT_SECRET` | Secret for JWT signing | `your-secret-key` |
| `JWT_EXPIRES_IN` | Token expiration | `30d` |
| `FRONTEND_URL` | Frontend URL for CORS | `https://app.vercel.app` |

### Frontend (Vercel)
| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_API_URL` | Backend API URL | `https://api.onrender.com/api` |

---

## Post-Deployment Steps

1. **Update CORS**: Ensure your Render backend has the correct `FRONTEND_URL` set to your Vercel deployment URL

2. **Test API**: Visit `https://your-render-api.onrender.com/api/health` to verify backend is running

3. **Test Frontend**: Visit your Vercel URL and verify the app loads and can connect to the backend

4. **Create Admin User**: Use the seed script or API to create your first admin user

---

## Troubleshooting

### CORS Errors
- Verify `FRONTEND_URL` in Render matches your actual Vercel URL
- Check that the URL has no trailing slash

### API Connection Issues
- Verify `VITE_API_URL` in Vercel is correct
- Ensure the API URL includes `/api` at the end

### Build Failures
- Check that `src/package.json` has the correct build script
- Verify Node version compatibility (18+ recommended)

---

## Architecture

```
┌─────────────────┐         ┌──────────────────┐
│   Vercel        │ ─────── │   Render         │
│   (Frontend)    │   CORS  │   (Backend)      │
│   React + Vite  │         │   Express +      │
│                 │         │   MongoDB        │
└─────────────────┘         └──────────────────┘
       │                            │
       └──────────┬─────────────────┘
                  │
           ┌─────────────┐
           │  MongoDB    │
           │  Atlas      │
           └─────────────┘
