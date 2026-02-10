#!/bin/bash

# Enterprise Inventory System Deployment Script
# This script helps deploy the frontend to Vercel and backend to Render

set -e

echo "🚀 Enterprise Inventory System Deployment"
echo "=========================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if Vercel CLI is installed
check_vercel_cli() {
    if ! command -v vercel &> /dev/null; then
        echo -e "${RED}❌ Vercel CLI is not installed.${NC}"
        echo "Install it with: npm i -g vercel"
        exit 1
    fi
    echo -e "${GREEN}✅ Vercel CLI is installed${NC}"
}

# Deploy frontend to Vercel
deploy_frontend() {
    echo ""
    echo -e "${YELLOW}📦 Deploying Frontend to Vercel...${NC}"
    echo "=========================================="
    
    # Check if user is logged in to Vercel
    if ! vercel whoami &> /dev/null; then
        echo -e "${YELLOW}⚠️  Please login to Vercel first${NC}"
        vercel login
    fi
    
    # Check if project is linked
    if [ ! -f .vercel/project.json ]; then
        echo -e "${YELLOW}🔗 Linking project to Vercel...${NC}"
        vercel link
    fi
    
    # Set environment variables if not set
    echo -e "${YELLOW}🔧 Checking environment variables...${NC}"
    
    read -p "Enter your Render API URL (e.g., https://your-api.onrender.com/api): " api_url
    
    if [ -n "$api_url" ]; then
        echo "Setting VITE_API_URL..."
        vercel env add VITE_API_URL production <<< "$api_url" || true
    fi
    
    # Deploy
    echo -e "${YELLOW}🚀 Deploying to Vercel...${NC}"
    vercel --prod
    
    echo -e "${GREEN}✅ Frontend deployed successfully!${NC}"
}

# Show Render deployment instructions
show_render_instructions() {
    echo ""
    echo -e "${YELLOW}📦 Backend Deployment to Render${NC}"
    echo "=========================================="
    echo ""
    echo "To deploy the backend to Render, you have two options:"
    echo ""
    echo "Option 1: Using Render Dashboard (Recommended)"
    echo "  1. Go to https://dashboard.render.com/"
    echo "  2. Click 'New +' → 'Web Service'"
    echo "  3. Connect your GitHub repository"
    echo "  4. Use these settings:"
    echo "     - Build Command: cd server && npm install"
    echo "     - Start Command: cd server && npm start"
    echo "  5. Add environment variables from .env.example"
    echo "  6. Click 'Create Web Service'"
    echo ""
    echo "Option 2: Using Render Blueprint"
    echo "  1. Push the render.yaml file to your repository"
    echo "  2. In Render dashboard, click 'New +' → 'Blueprint'"
    echo "  3. Connect your repository"
    echo "  4. Render will auto-configure the service"
    echo ""
    echo -e "${GREEN}✅ Render deployment configuration ready!${NC}"
}

# Main menu
show_menu() {
    echo ""
    echo "What would you like to do?"
    echo "  1) Deploy Frontend to Vercel"
    echo "  2) Show Render Backend Instructions"
    echo "  3) Deploy Both (Full Deployment)"
    echo "  4) Exit"
    echo ""
    read -p "Select an option (1-4): " choice
    
    case $choice in
        1)
            check_vercel_cli
            deploy_frontend
            ;;
        2)
            show_render_instructions
            ;;
        3)
            check_vercel_cli
            deploy_frontend
            show_render_instructions
            echo ""
            echo -e "${GREEN}🎉 Deployment process initiated!${NC}"
            echo "Make sure to set up your Render backend with the correct FRONTEND_URL from Vercel."
            ;;
        4)
            echo "Goodbye!"
            exit 0
            ;;
        *)
            echo -e "${RED}Invalid option${NC}"
            show_menu
            ;;
    esac
}

# Start
show_menu
