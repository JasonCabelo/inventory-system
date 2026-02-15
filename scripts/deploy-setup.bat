@echo off
REM Deployment Setup Script for Enterprise Inventory System
REM This script helps you prepare for deployment to Render and Vercel

setlocal enabledelayedexpansion

echo.
echo 🚀 Enterprise Inventory System - Deployment Setup
echo ==================================================
echo.

REM Check for required files
echo 📋 Checking project structure...
if not exist "package.json" (
    echo ❌ Error: package.json not found in root directory
    exit /b 1
)

if not exist "server" (
    echo ❌ Error: server directory not found
    exit /b 1
)

if not exist "src" (
    echo ❌ Error: src directory not found
    exit /b 1
)

echo ✅ Project structure verified
echo.

REM Check for Node.js
echo 📦 Checking Node.js...
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Node.js is not installed. Please install from https://nodejs.org
    exit /b 1
)

for /f "tokens=*" %%i in ('node --version') do set NODE_VERSION=%%i
echo ✅ Node.js version: !NODE_VERSION!
echo.

REM Check for Git
echo 📚 Checking Git...
where git >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ⚠️  Git is not installed. You'll need it for deployment.
) else (
    echo ✅ Git is installed
)
echo.

REM Create .env.production if it doesn't exist
echo 🔐 Setting up environment variables...
if not exist ".env.production" (
    copy ".env.production.example" ".env.production"
    echo ✅ Created .env.production (update with your actual values)
) else (
    echo ✅ .env.production already exists
)
echo.

REM Display MongoDB configuration info
echo 🗄️  MongoDB Configuration:
findstr /M "mongodb+srv://username:password" ".env.production" >nul
if %ERRORLEVEL% EQU 0 (
    echo ⚠️  MongoDB URI still has template values
    echo    Get your MongoDB connection string from:
    echo    1. Go to https://mongodb.com/cloud/atlas
    echo    2. Create a project and cluster
    echo    3. Copy the connection string
    echo    4. Update MONGODB_URI in .env.production
) else (
    echo ✅ MongoDB URI appears configured
)
echo.

REM Display JWT Secret info
echo 🔑 JWT Secret Configuration:
findstr /M "change-this-to-a-strong-random-secret" ".env.production" >nul
if %ERRORLEVEL% EQU 0 (
    echo ⚠️  JWT_SECRET still has template value
    echo    Generate a strong random secret (at least 32 characters)
    echo    Update JWT_SECRET in .env.production
) else (
    echo ✅ JWT_SECRET appears configured
)
echo.

REM Install dependencies
echo 📥 Installing dependencies...
call npm install
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Failed to install dependencies
    exit /b 1
)
echo ✅ Dependencies installed
echo.

REM Build frontend
echo 🏗️  Building frontend...
call npm run build
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Failed to build frontend
    exit /b 1
)
echo ✅ Frontend built successfully
echo.

REM Display next steps
echo ==================================================
echo ✅ Setup complete! Next steps:
echo.
echo 1. 📝 Configure environment variables in .env.production:
echo    - MONGODB_URI: Your MongoDB connection string
echo    - JWT_SECRET: A strong random string (min 32 chars)
echo    - FRONTEND_URL: Your production domain
echo.
echo 2. 🔗 Push to GitHub:
echo    git add .
echo    git commit -m "Prepare for deployment"
echo    git push origin main
echo.
echo 3. 🚀 Deploy to Render:
echo    Option A: Use render.yaml Blueprint
echo    Option B: Manual setup (see DEPLOYMENT_GUIDE.md)
echo.
echo 4. 🚀 Deploy to Vercel:
echo    npm run deploy:vercel
echo    or use Vercel Dashboard at https://vercel.com/dashboard
echo.
echo 📖 For detailed instructions, see DEPLOYMENT_GUIDE.md
echo ==================================================
echo.
