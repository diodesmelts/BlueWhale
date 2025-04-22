# Blue Whale Competitions - Next.js Deployment

This is a Next.js version of the Blue Whale Competitions platform specifically designed for Vercel deployment.

## Structure

- `pages/index.js` - The main landing page with styled JSX
- `pages/api/status.js` - Simple API endpoint 

## Why Next.js?

Next.js is the officially recommended framework for Vercel deployments. It handles:

1. Proper HTML rendering (eliminates the "raw code" issue)
2. Built-in API routes
3. Automatic deployment on Vercel without configuration

## Deployment Steps

1. Create a new Vercel project
2. Point to this directory (`nextjs_deploy`)
3. Deploy with default settings

Vercel will automatically detect Next.js, install dependencies, and deploy correctly.

## Testing the Deployment

After deployment, you should be able to:
- Visit the root URL and see a properly rendered page with Blue Whale branding
- Visit `/api/status` and see a JSON response