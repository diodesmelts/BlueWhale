# Deploying Blue Whale Competitions to Vercel

Follow these steps to deploy the Blue Whale Competitions platform to Vercel:

## Prerequisites

1. A Vercel account (sign up at [vercel.com](https://vercel.com))
2. Git repository access
3. Required environment variables

## Deployment Steps

### Method 1: Direct from GitHub Repository

1. Log in to your Vercel account
2. Click "Add New..." → "Project"
3. Connect your GitHub account if not already connected
4. Select the repository containing this code
5. Under the "Configure Project" section:
   - **Framework Preset**: Other
   - **Root Directory**: `vercel-deployment`
   - **Build Command**: None (leave blank)
   - **Output Directory**: `.`
   - **Install Command**: None (leave blank)
6. Configure environment variables (if applicable):
   - `NODE_ENV`: `production`
   - `DATABASE_URL`: Your database connection string (if using a database)
   - `STRIPE_SECRET_KEY`: Your Stripe secret key (if using payments)
7. Click "Deploy"

### Method 2: Using Vercel CLI

1. Install Vercel CLI: `npm install -g vercel`
2. Navigate to the `vercel-deployment` directory
3. Run `vercel login` and follow the prompts
4. Run `vercel` to deploy
5. Follow the interactive prompts
6. When asked about the root directory, specify `.` (current directory)

## Verifying Deployment

After deployment:

1. Vercel will provide a deployment URL (e.g., `your-project.vercel.app`)
2. Navigate to this URL to verify the landing page is working
3. Test the API endpoints:
   - `your-project.vercel.app/api/status`
   - `your-project.vercel.app/api/competitions`
   - etc.

## Troubleshooting

Common issues and solutions:

- **API Endpoints Not Working**: Ensure Vercel functions are properly configured in `vercel.json`
- **Missing Environment Variables**: Check the Vercel dashboard to ensure all required environment variables are set
- **CORS Issues**: Check the request headers and configure CORS in the API responses if needed

## Setting Up a Custom Domain

1. In your Vercel dashboard, select your project
2. Go to "Settings" → "Domains"
3. Follow the instructions to add and verify your custom domain