# Blue Whale Competitions - Minimal Vercel Deployment

This is the absolute minimal version of Blue Whale Competitions for Vercel deployment. It uses the most basic configuration possible to ensure compatibility with Vercel's platform.

## Files

- `vercel.json` - Minimal Vercel configuration
- `package.json` - Minimal package definition (no dependencies)
- `index.html` - Static landing page
- `api/status.js` - Simple API endpoint using Vercel serverless functions

## How to Deploy

1. Create a new project on Vercel
2. Connect your GitHub repository
3. Set the root directory to `vercel_minimal` (this folder)
4. Deploy without any additional configuration

## Important Notes

- This is an ultra-minimal configuration designed specifically to troubleshoot Vercel deployment issues
- The API endpoint uses the older CommonJS syntax (module.exports) for maximum compatibility
- There are no build steps, no dependencies, and no complex configuration

## Next Steps

Once this minimal version deploys successfully, we can gradually add more functionality by:

1. Adding more API endpoints
2. Incorporating a frontend framework
3. Connecting to a database

## Testing the Deployment

After deployment, you should be able to:
- Visit the root URL and see the landing page
- Visit `/api/status` and see a JSON response