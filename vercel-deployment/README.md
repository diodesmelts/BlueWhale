# Blue Whale Competitions - Vercel Deployment

This directory contains a standalone version of the Blue Whale Competitions platform optimized for Vercel deployment.

## Project Structure

```
vercel-deployment/
├── api/                # Serverless API functions
│   ├── competitions.js # Competition data endpoint
│   ├── leaderboard.js  # Leaderboard data endpoint
│   ├── settings.js     # Site settings endpoint
│   ├── status.js       # API status endpoint
│   └── user-stats.js   # User statistics endpoint
├── index.html          # Static landing page
├── package.json        # Project dependencies and scripts
├── README.md           # Project documentation
└── vercel.json         # Vercel configuration
```

## Deployment Instructions

1. Create a new Vercel project
2. Connect your GitHub repository
3. Set up the following environment variables:
   - `NODE_ENV=production`
   - `DATABASE_URL` (if using a database connection)
   - `STRIPE_SECRET_KEY` (if using Stripe payments)
4. Deploy from the `/vercel-deployment` subdirectory

## Development

For local development:

1. Navigate to the project directory
2. Install dependencies: `npm install`
3. Run the development server: `npm run dev`

## API Endpoints

- `/api/status` - Check API status
- `/api/competitions` - Get competition data
- `/api/leaderboard` - Get leaderboard data
- `/api/user-stats` - Get user statistics
- `/api/settings` - Get site settings

## Technologies Used

- Vercel serverless functions
- Static HTML/CSS for the frontend