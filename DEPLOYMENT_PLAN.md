# Enterprise Inventory System - Production Deployment Plan

## Table of Contents
1. [Project Overview](#project-overview)
2. [Pre-deployment Checklist](#pre-deployment-checklist)
3. [Environment Configuration](#environment-configuration)
4. [Database Setup](#database-setup)
5. [Deployment Options](#deployment-options)
   - [Option A: Vercel (Full Stack)](#option-a-vercel-full-stack)
   - [Option B: Render (Backend) + Vercel (Frontend)](#option-b-render-backend--vercel-frontend)
   - [Option C: Railway + Vercel](#option-c-railway--vercel)
6. [Security Considerations](#security-considerations)
7. [Post-deployment Testing](#post-deployment-testing)
8. [Monitoring & Maintenance](#monitoring--maintenance)

---

## Project Overview

### Architecture
- **Frontend**: React 18 + Vite + TailwindCSS
- **Backend**: Express.js + Node.js
- **Database**: MongoDB (MongoDB Atlas)
- **Authentication**: JWT + 2FA (speakeasy + qrcode)
- **State Management**: TanStack React Query
- **UI Components**: Radix UI + Lucide React

### Current Issues (from TODO.md)
- 500 Internal Server Error on API endpoints
- Database connection issues in Vercel's serverless environment
- Environment variables need proper configuration

---

## Pre-deployment Checklist

### Code Preparation
- [ ] Fix database connection middleware issues
- [ ] Add proper error handling for all routes
- [ ] Ensure all API endpoints return proper HTTP status codes
- [ ] Update CORS configuration for production domains
- [ ] Verify all environment variables are documented

### Security Checklist
- [ ] Generate new JWT_SECRET (do not use default values)
- [ ] Configure MongoDB Atlas network access (IP whitelist)
- [ ] Enable MongoDB Atlas encryption at rest
- [ ] Set up HTTPS for custom domains
- [ ] Configure secure cookie settings

### Testing Checklist
- [ ] Test all API endpoints locally
- [ ] Verify authentication flow (login, 2FA setup, logout)
- [ ] Test CRUD operations for all entities (products, categories, suppliers, users)
- [ ] Verify audit logging is working
- [ ] Test error handling and edge cases

---

## Environment Configuration

### Required Environment Variables

Create a `.env.production` file with the following variables:

```
env
# Frontend URL (your production domain)
FRONTEND_URL=https://your-domain.vercel.app

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=30d

# MongoDB Connection String
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/inventory?retryWrites=true&w=majority

# Node Environment
NODE_ENV=production
```

### Environment Variables by Platform

#### Vercel
Configure these in Vercel Dashboard → Project Settings → Environment Variables:
- `MONGODB_URI`
- `JWT_SECRET`
- `FRONTEND_URL`
- `NODE_ENV=production`

#### Render
Configure these in Render Dashboard → Environment Variables:
- `MONGODB_URI`
- `JWT_SECRET`
- `FRONTEND_URL`
- `NODE_ENV=production`
- `PORT` (auto-configured by Render)

---

## Database Setup

### MongoDB Atlas Configuration

1. **Create Cluster**: Use MongoDB Atlas free tier (M0) for development
2. **Network Access**:
   - Add IP whitelist: `0.0.0.0/0` (for Vercel/Render)
   - Or use VPC Peering for better security
3. **Database User**:
   - Create dedicated user for application
   - Use strong password
4. **Connection String**:
   
```
   mongodb+srv://username:password@cluster-name.mongodb.net/inventory?retryWrites=true&w=majority
   
```

### Database Optimization
- Add indexes for frequently queried fields
- Enable MongoDB Atlas Data Explorer for monitoring
- Set up alerts for connection issues

---

## Deployment Options

### Option A: Vercel (Full Stack)

Vercel can host both the frontend and serverless API functions.

#### Step 1: Install Vercel CLI
```
bash
npm install -g vercel
```

#### Step 2: Configure Vercel
Create `vercel.json` in the root directory:

```
json
{
  "version": 2,
  "builds": [
    {
      "src": "src/package.json",
      "use": "@vercel/static"
    },
    {
      "src": "server/index.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "server/index.js"
    },
    {
      "src": "/(.*)",
      "dest": "src/dist/index.html"
    }
  ]
}
```

#### Step 3: Deploy
```
bash
vercel login
vercel --prod
```

#### Step 4: Configure Environment Variables
```
bash
vercel env add MONGODB_URI production
vercel env add JWT_SECRET production
vercel env add FRONTEND_URL production
vercel env add NODE_ENV production
```

#### Pros
- Free tier available
- Automatic HTTPS
- Serverless functions
- CI/CD integration

#### Cons
- Serverless functions have execution time limits (10 seconds)
- Cold start latency
- Limited database connections in serverless environment
- Requires proper connection handling

---

### Option B: Render (Backend) + Vercel (Frontend)

This option separates the backend from the frontend for better performance.

#### Backend: Render

1. **Create Render Account**: https://render.com
2. **Connect GitHub Repository**
3. **Create Web Service**:
   - Root Directory: `server`
   - Build Command: (empty)
   - Start Command: `node index.js`
   - Environment: Node

4. **Environment Variables** (in Render Dashboard):
   
```
   MONGODB_URI=your-mongodb-uri
   JWT_SECRET=your-jwt-secret
   NODE_ENV=production
   FRONTEND_URL=https://your-frontend.vercel.app
   
```

5. **Deploy**: Push to GitHub to trigger deployment

#### Frontend: Vercel

1. **Deploy Frontend**:
   
```
bash
   cd src
   vercel --prod
   
```

2. **Update API URL**:
   Create `src/.env.production`:
   
```
   VITE_API_URL=https://your-render-backend.onrender.com
   
```

3. **Update Server Proxy** (vite.config.js):
   
```
javascript
   server: {
     proxy: {
       '/api': {
         target: 'https://your-render-backend.onrender.com',
         changeOrigin: true,
       },
     },
   },
   
```

#### Pros
- No serverless limitations
- Better performance for API
- More control over backend
- Persistent connections

#### Cons
- Render's free tier sleeps after 15 minutes
- Requires two platform management

---

### Option C: Railway + Vercel

#### Backend: Railway

1. **Create Railway Account**: https://railway.app
2. **Deploy from GitHub**
3. **Environment Variables**:
   
```
   MONGODB_URI=your-mongodb-uri
   JWT_SECRET=your-jwt-secret
   NODE_ENV=production
   FRONTEND_URL=https://your-frontend.vercel.app
   
```

#### Frontend: Vercel

Follow the same steps as Option B (Frontend section).

#### Pros
- Railway provides persistent servers on paid plans
- Easy deployment
- Good performance

#### Cons
- Free tier limited
- Railway can be more expensive

---

## Security Considerations

### 1. JWT Security
- Use strong, random JWT_SECRET (minimum 256 bits)
- Implement token refresh mechanism
- Set appropriate expiration (currently 30d - consider shorter)
- Use secure, httpOnly cookies

### 2. CORS Configuration
Current configuration in server/index.js:
```
javascript
app.use(cors({
  origin: function (origin, callback) {
    // Allow localhost for development
    if (origin.startsWith('http://localhost')) return callback(null, true);
    // Allow Vercel deployments
    if (origin.includes('vercel.app')) return callback(null, true);
    // Allow the configured FRONTEND_URL
    if (frontendUrl && origin === frontendUrl) return callback(null, true);
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
}));
```

### 3. MongoDB Security
- Use connection string with credentials
- Enable IP whitelist
- Use MongoDB Atlas encryption
- Rotate credentials periodically

### 4. API Security
- Implement rate limiting
- Add request validation (Zod schemas already in place)
- Log all API requests (audit logging already implemented)

---

## Post-deployment Testing

### 1. Health Check
```
bash
curl https://your-api-domain.com/api/health
```

Expected response:
```
json
{
  "status": "OK",
  "message": "API is running"
}
```

### 2. Authentication Tests
- [ ] Sign up new user
- [ ] Sign in with valid credentials
- [ ] Sign in with invalid credentials
- [ ] Enable 2FA
- [ ] Sign in with 2FA
- [ ] Logout

### 3. CRUD Operations
- [ ] Create product
- [ ] Read products
- [ ] Update product
- [ ] Delete product
- [ ] Same for categories, suppliers, users

### 4. Error Handling
- [ ] Test invalid routes (404)
- [ ] Test unauthorized access (401)
- [ ] Test forbidden access (403)
- [ ] Test server errors (500)

### 5. Performance
- [ ] Test API response times
- [ ] Test database query performance
- [ ] Test under load (if needed)

---

## Monitoring & Maintenance

### 1. Vercel Analytics
- Enable Vercel Analytics in dashboard
- Monitor performance metrics
- Track usage patterns

### 2. MongoDB Atlas Monitoring
- Use MongoDB Atlas free monitoring
- Set up alerts for:
  - Connection failures
  - Slow queries
  - Storage usage

### 3. Logging
- Vercel provides function logs
- Render provides application logs
- Consider using external logging (Datadog, LogRocket)

### 4. Backups
- MongoDB Atlas provides automatic backups (on paid plans)
- Implement export/import for critical data

### 5. Updates
- Keep dependencies updated
- Monitor security advisories
- Regular code reviews

---

## Quick Start Commands

### Local Development
```
bash
# Install dependencies
npm run install:all

# Start development (both frontend and backend)
npm run dev

# Or separately:
npm run dev:server  # Backend on port 3001
npm run dev:client  # Frontend on port 5173
```

### Build for Production
```
bash
# Build frontend
npm run build
```

### Deploy to Vercel
```
bash
# Full stack to Vercel
npm run deploy:vercel
```

### Deploy to Render
```
bash
# Push to GitHub and connect to Render
npm run deploy:render
```

---

## Troubleshooting

### Common Issues

1. **500 Internal Server Error**
   - Check MongoDB Atlas network access (IP whitelist)
   - Verify environment variables are set
   - Check Vercel function logs

2. **CORS Errors**
   - Verify FRONTEND_URL matches exactly
   - Check for trailing slashes

3. **Database Connection Issues**
   - Verify MONGODB_URI is correct
   - Check MongoDB Atlas cluster status
   - Ensure IP whitelist includes 0.0.0.0/0

4. **JWT Errors**
   - Verify JWT_SECRET is set
   - Check token expiration settings

---

## Support Resources

- **Vercel Docs**: https://vercel.com/docs
- **Render Docs**: https://render.com/docs
- **MongoDB Atlas Docs**: https://docs.atlas.mongodb.com
- **Express.js Docs**: https://expressjs.com
- **React Docs**: https://react.dev

---

*Last Updated: 2024*
*Version: 1.0.0*
