#!/bin/bash

# Bold/Color
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
BOLD='\033[1m'
NC='\033[0m' # No Color

echo -e "${BLUE}${BOLD}Blue Whale Competitions - Vercel Deployment Script${NC}\n"

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo -e "${YELLOW}Vercel CLI not found. Installing...${NC}"
    npm install -g vercel
fi

# Function to check if a command succeeded
check_status() {
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✓ Success${NC}"
    else
        echo -e "${RED}✗ Failed${NC}"
        exit 1
    fi
}

# Step 1: Clean up any unnecessary files
echo -e "${BLUE}Step 1: Cleaning up unnecessary files...${NC}"
find . -name "*render*" -not -path "./node_modules/*" -type f -delete 2>/dev/null
rm -f static.json 2>/dev/null
echo -e "${GREEN}✓ Cleanup complete${NC}"

# Step 2: Ensure required files exist
echo -e "\n${BLUE}Step 2: Checking required files...${NC}"

FILES_TO_CHECK=(
    "vercel.json"
    "api/index.js"
    "api/vercel.js"
    "api/package.json"
)

MISSING_FILES=false
for file in "${FILES_TO_CHECK[@]}"; do
    if [ ! -f "$file" ]; then
        echo -e "${RED}✗ Missing required file: $file${NC}"
        MISSING_FILES=true
    else
        echo -e "${GREEN}✓ Found: $file${NC}"
    fi
done

if [ "$MISSING_FILES" = true ]; then
    echo -e "${RED}${BOLD}Error: Some required files are missing. Please create them before deploying.${NC}"
    exit 1
fi

# Step 3: Prepare for deployment
echo -e "\n${BLUE}Step 3: Preparing for deployment...${NC}"

# Build the frontend
echo -e "${BLUE}Building frontend...${NC}"
npm run build
check_status

# Step 4: Deploy to Vercel
echo -e "\n${BLUE}Step 4: Ready to deploy to Vercel${NC}"
echo -e "${YELLOW}Please choose an option:${NC}"
echo "1. Deploy to preview environment"
echo "2. Deploy to production"
echo "3. Exit without deploying"
read -p "Enter your choice (1-3): " deploy_choice

case $deploy_choice in
    1)
        echo -e "\n${BLUE}Deploying to preview environment...${NC}"
        vercel
        check_status
        ;;
    2)
        echo -e "\n${BLUE}Deploying to production...${NC}"
        vercel --prod
        check_status
        ;;
    3)
        echo -e "\n${YELLOW}Exiting without deploying. Your project is prepared for manual deployment.${NC}"
        exit 0
        ;;
    *)
        echo -e "\n${RED}Invalid choice. Exiting.${NC}"
        exit 1
        ;;
esac

echo -e "\n${GREEN}${BOLD}Deployment process completed!${NC}"
echo -e "Visit your Vercel dashboard to see your deployment details."