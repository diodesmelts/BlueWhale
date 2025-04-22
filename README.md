# Blue Whale Competitions

A dynamic competition tracking web application that empowers users to discover, manage, and monitor online competitions through an intelligent and visually refined user experience.

## Tech Stack

- React.js frontend with TypeScript
- Tailwind CSS for responsive design
- Express.js backend
- PostgreSQL database with Drizzle ORM
- Zod validation for data integrity
- React Query for state management
- Authentication with Passport.js
- Stripe payment integration

## Deployment to Vercel

### Simple Deployment Process

1. **Connect to GitHub Repository**
   - Go to [Vercel Dashboard](https://vercel.com/dashboard)
   - Click "Add New" → "Project"
   - Import your GitHub repository
   - Configure the following settings:
     - Framework Preset: `Other`
     - Build Command: `npm run build`
     - Output Directory: `dist`
     - Root Directory: `.` (default)

2. **Configure Environment Variables**
   - Add these required variables:
     - `DATABASE_URL`: Your PostgreSQL connection string
     - `SESSION_SECRET`: Random string for session security
     - `STRIPE_SECRET_KEY`: Your Stripe secret key
     - `VITE_STRIPE_PUBLIC_KEY`: Your Stripe publishable key

3. **Deploy**
   - Click "Deploy"
   - Vercel will build and deploy your application
   - All API routes will automatically work through the serverless functions

### Project Structure

- **Frontend:** React application built with Vite
- **API:** Serverless functions in `/api` directory
- **Config:** Deployment settings in `vercel.json`

The serverless API automatically provides fallback data when not connected to a database, making it perfect for demos and development.

## Local Development

1. Install dependencies:
   ```
   npm install
   ```

2. Start the development server:
   ```
   npm run dev
   ```

3. Open [http://localhost:5000](http://localhost:5000) in your browser.

## Database Setup

For local development with a database:

1. Create a PostgreSQL database
2. Set up the `DATABASE_URL` environment variable
3. Run migrations:
   ```
   npm run db:push
   ```

## Features

- Competition discovery and browsing
- User accounts and authentication
- Secure payments with Stripe
- Ticket purchasing system
- Responsive design for all devices
- User profile management
- Mascot selection system
- Categorized competitions (Family, Appliances, Cash)
- Leaderboard with user rankings