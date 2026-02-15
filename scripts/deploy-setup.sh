#!/bin/bash

# Deployment Setup Script for Enterprise Inventory System
# This script helps you prepare for deployment to Render and Vercel

set -e

echo "🚀 Enterprise Inventory System - Deployment Setup"
echo "=================================================="
echo ""

# Check for required files
echo "📋 Checking project structure..."
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found in root directory"
    exit 1
fi

if [ ! -d "server" ]; then
    echo "❌ Error: server directory not found"
    exit 1
fi

if [ ! -d "src" ]; then
    echo "❌ Error: src directory not found"
    exit 1
fi

echo "✅ Project structure verified"
echo ""

# Check for Node.js
echo "📦 Checking Node.js..."
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js from https://nodejs.org"
    exit 1
fi
echo "✅ Node.js version: $(node --version)"
echo ""

# Check for Git
echo "📚 Checking Git..."
if ! command -v git &> /dev/null; then
    echo "⚠️  Git is not installed. You'll need it for deployment."
    echo "   Install Git from https://git-scm.com"
else
    echo "✅ Git is installed"
fi
echo ""

# Create .env.production if it doesn't exist
echo "🔐 Setting up environment variables..."
if [ ! -f ".env.production" ]; then
    cp .env.production.example .env.production
    echo "✅ Created .env.production (update with your actual values)"
else
    echo "✅ .env.production already exists"
fi
echo ""

# Check MongoDB URI
echo "🗄️  MongoDB Configuration:"
if grep -q "mongodb+srv://username:password" .env.production; then
    echo "⚠️  MongoDB URI still has template values"
    echo "   Get your MongoDB connection string from:"
    echo "   1. Go to https://mongodb.com/cloud/atlas"
    echo "   2. Create a project and cluster"
    echo "   3. Copy the connection string"
    echo "   4. Update MONGODB_URI in .env.production"
else
    echo "✅ MongoDB URI appears to be configured"
fi
echo ""

# Check JWT Secret
echo "🔑 JWT Secret Configuration:"
if grep -q "change-this-to-a-strong-random-secret" .env.production; then
    echo "⚠️  JWT_SECRET still has template value"
    echo "   Generate a strong random secret (at least 32 characters)"
    echo "   Update JWT_SECRET in .env.production"
else
    echo "✅ JWT_SECRET appears to be configured"
fi
echo ""

# Install dependencies
echo "📥 Installing dependencies..."
npm install
echo "✅ Dependencies installed"
echo ""

# Build frontend
echo "🏗️  Building frontend..."
npm run build
echo "✅ Frontend built successfully"
echo ""

# Display next steps
echo "=================================================="
echo "✅ Setup complete! Next steps:"
echo ""
echo "1. 📝 Configure environment variables in .env.production:"
echo "   - MONGODB_URI: Your MongoDB connection string"
echo "   - JWT_SECRET: A strong random string (min 32 chars)"
echo "   - FRONTEND_URL: Your production domain"
echo ""
echo "2. 🔗 Push to GitHub:"
echo "   git add ."
echo "   git commit -m 'Prepare for deployment'"
echo "   git push origin main"
echo ""
echo "3. 🚀 Deploy to Render:"
echo "   Option A: Use render.yaml Blueprint"
echo "   Option B: Manual setup (see DEPLOYMENT_GUIDE.md)"
echo ""
echo "4. 🚀 Deploy to Vercel:"
echo "   npm run deploy:vercel"
echo "   or use Vercel Dashboard at https://vercel.com/dashboard"
echo ""
echo "📖 For detailed instructions, see DEPLOYMENT_GUIDE.md"
echo "=================================================="
