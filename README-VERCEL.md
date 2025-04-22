# Blue Whale Competitions - Vercel Deployment Guide

## Overview

Blue Whale Competitions is a platform for discovering, participating in, and tracking online competitions. This guide provides instructions for deploying the application on Vercel.

## Project Structure

We've created a dedicated directory optimized for Vercel deployment:

```
vercel-deployment/
├── api/                # Serverless API functions
├── index.html          # Static landing page
├── vercel.json         # Vercel configuration
└── package.json        # Project dependencies
```

## Why This Structure?

The original project structure was causing issues with Vercel deployment because:

1. Vercel's serverless model is different from traditional Express applications
2. The build process wasn't correctly producing deployable assets
3. The mixed client/server code wasn't structured in a way Vercel expects

This new structure separates the concerns:
- Static HTML for the frontend
- API endpoints as individual serverless functions
- Clear configuration in vercel.json

## Deployment Instructions

### Option 1: Deploy from the Subdirectory

1. Push this entire repository to GitHub
2. In Vercel, create a new project from this repository
3. Set the "Root Directory" to `vercel-deployment`
4. Configure your environment variables (if needed)
5. Deploy!

### Option 2: Create a New Repository

1. Copy just the `vercel-deployment` directory to a new repository
2. Push that repository to GitHub
3. In Vercel, create a new project from this repository
4. Deploy!

## Environment Variables

If your application uses a database or external services, make sure to set up the following environment variables in Vercel:

- `NODE_ENV`: Set to `production`
- `DATABASE_URL`: Your database connection string (if applicable)
- `STRIPE_SECRET_KEY`: Your Stripe secret key (if using payments)

## Testing Locally

To test the deployment structure locally:

1. Navigate to the `vercel-deployment` directory
2. Serve the frontend with any static file server: `npx serve`
3. Test the API endpoints using the provided `test-api.js` script

## Additional Resources

- See the `DEPLOYMENT.md` file in the `vercel-deployment` directory for detailed deployment steps
- Refer to Vercel documentation for more information: [vercel.com/docs](https://vercel.com/docs)

## Troubleshooting

If you encounter issues:

1. Check your environment variables in the Vercel dashboard
2. Ensure all paths in `vercel.json` are correct
3. Look at Vercel build logs for specific errors
4. Verify that all API endpoints are properly formatted for serverless functions