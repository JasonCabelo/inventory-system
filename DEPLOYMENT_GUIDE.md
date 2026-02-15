# Deployment Guide for Enterprise Inventory System

This guide covers deploying your application to both Render and Vercel.

## Prerequisites

1. **GitHub Repository** - Push your code to GitHub
2. **MongoDB Atlas Account** - Create a free cluster at https://mongodb.com/cloud/atlas
3. **Vercel Account** - Create an account at https://vercel.com
4. **Render Account** - Create an account at https://render.com

---

## Environment Variables Setup

### Production Environment Variables

Create a `.env.production` file in the root directory:

```env
# Frontend URL (will be set during deployment)
FRONTEND_URL=https://your-domain.vercel.app

# JWT Configuration (Generate a strong secret!)
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production-12345

# MongoDB Connection String
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/inventory?retryWrites=true&w=majority

# Node Environment
NODE_ENV=production
JWT_EXPIRES_IN=30d
```

### MongoDB Atlas Setup

1. Go to https://mongodb.com/cloud/atlas
2. Create a new project
3. Create a free cluster
4. Create a database user with a strong password
5. Add your IP to the network access (or allow all IPs for development)
6. Copy the connection string and update `MONGODB_URI`

---

## Deployment Option A: Render Backend + Vercel Frontend (Recommended)

### Step 1: Deploy Backend to Render

#### Method 1: Using Render.yaml Blueprint

1. Push your code to GitHub
2. Go to https://render.com/dashboard
3. Click "New +" → "Blueprint"
4. Connect your GitHub repository
5. Select branch (main/master)
6. Click "Apply"

#### Method 2: Manual Setup on Render

1. Go to https://render.com/dashboard
2. Click "New +" → "Web Service"
3. Select your GitHub repo
4. Configure:
   - **Name**: `inventory-api`
   - **Runtime**: Node
   - **Build Command**: `cd server && npm install`
   - **Start Command**: `npm start --workspace=server`
   - **Plan**: Free tier

5. Add Environment Variables in Render Dashboard:
   - `MONGODB_URI`: Your MongoDB connection string
   - `JWT_SECRET`: Generate a strong secret key
   - `FRONTEND_URL`: https://your-vercel-domain.vercel.app
   - `NODE_ENV`: production
   - `JWT_EXPIRES_IN`: 30d

6. Click "Create Web Service"
7. Wait for build to complete (note your service URL like: https://inventory-api.onrender.com)

### Step 2: Deploy Frontend to Vercel

1. Go to https://vercel.com/dashboard
2. Click "Add New..." → "Project"
3. Import your GitHub repository
4. Configure:
   - **Project Name**: enterprise-inventory-system
   - **Framework**: Vite
   - **Root Directory**: ./src

5. Add Environment Variables:
   - `VITE_API_URL`: https://inventory-api.onrender.com/api

6. Click "Deploy"

### Step 3: Update Environment Variables

1. Go back to Render Dashboard for your backend Service
2. Update `FRONTEND_URL` to your new Vercel URL (e.g., https://your-project.vercel.app)
3. Redeploy the service

---

## Deployment Option B: Full Stack on Vercel

### Prerequisites

- Vercel account
- GitHub repository with this code pushed

### Step 1: Link Your Repository to Vercel

```bash
npm install -g vercel
vercel link
```

### Step 2: Deploy to Vercel

```bash
vercel --prod
```

Or through the Vercel Dashboard:

1. Go to https://vercel.com/dashboard
2. Click "Add New..." → "Project"
3. Import your GitHub repository
4. Configure:
   - **Framework**: Other (since it's a monorepo)
   - **Root Directory**: ./

5. Add Environment Variables in Vercel:
   - `MONGODB_URI`: Your MongoDB connection string
   - `JWT_SECRET`: Generate a strong secret key
   - `FRONTEND_URL`: Your production Vercel URL (e.g., https://your-project.vercel.app)
   - `NODE_ENV`: production

6. Click "Deploy"

---

## Post-Deployment Steps

### 1. Test the Deployment

```bash
# Test API health check
curl https://your-api-domain/api/health

# Test frontend
Open https://your-frontend-domain in browser
```

### 2. Initialize the Database

The admin user seed should create an initial admin account:

- **Email**: admin@inventory.com
- **Password**: Check your console output during deployment

### 3. MongoDB Atlas Security

1. Enable IP Whitelist:
   - Go to MongoDB Atlas → Your Cluster → Network Access
   - Add Render and Vercel IPs or use: 0.0.0.0/0 (less secure)

2. Enable Encryption at Rest:
   - Go to Security → Encryption at Rest
   - Enable for stronger security

### 4. Custom Domain (Optional)

#### For Vercel:
1. Go to Project Settings → Domains
2. Add your custom domain
3. Follow DNS configuration steps

#### For Render:
1. Go to Service → Settings → Custom Domain
2. Add your domain and follow DNS instructions

---

## Troubleshooting

### 500 Internal Server Error

**Issue**: API returns 500 errors
**Solutions**:
1. Check Database Connection:
   - Verify `MONGODB_URI` is correct
   - Ensure IP whitelist includes deployment provider
   - Check MongoDB Atlas cluster is running

2. Check Environment Variables:
   - Verify all required env vars are set
   - REST the service after updating env vars

3. Check API Server Logs:
   - Render: Service Dashboard → Logs
   - Vercel: Deployment → Logs

### CORS Errors

**Issue**: Frontend can't connect to API
**Solutions**:
1. Verify `FRONTEND_URL` is set correctly
2. Check CORS configuration in _server/index.js_
3. Ensure the origin is whitelisted

### Database Connection Timeout

**Issue**: Can't connect to MongoDB
**Solutions**:
1. Verify connection string is correct
2. Add deployment IP to MongoDB Atlas network access
3. Check MongoDB Atlas cluster is running
4. Verify credentials are correct

---

## Monitoring & Maintenance

### Logging

- **Render**: Dashboard → Logs tab
- **Vercel**: Dashboard → Deployments → Logs tab

### Performance

- Use Render/Vercel analytics to monitor usage
- Check database performance in MongoDB Atlas

### Updates & Deployment

1. Push code changes to GitHub
2. Both Render and Vercel will auto-deploy on new commits
3. Monitor deployment status in their dashboards

---

## Quick Deployment Checklist

- [ ] Push code to GitHub
- [ ] Create MongoDB Atlas cluster and get connection string
- [ ] Generate strong JWT_SECRET
- [ ] Deploy backend to Render (or Vercel)
- [ ] Deploy frontend to Vercel
- [ ] Set all environment variables
- [ ] Test API endpoints
- [ ] Test authentication (login)
- [ ] Test CRUD operations
- [ ] Set up custom domain (optional)
- [ ] Enable monitoring/logging

---

## Support & Resources

- **Render Docs**: https://render.com/docs
- **Vercel Docs**: https://vercel.com/docs
- **MongoDB Atlas**: https://docs.mongodb.com/atlas/
- **Express.js**: https://expressjs.com/
- **React/Vite**: https://vitejs.dev/

---

For issues or questions, refer to the project's GitHub issues page.
