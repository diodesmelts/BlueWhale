# Blue Whale Competitions

A dynamic competition tracking web application that empowers users to discover, manage, and monitor online competitions through an intelligent and visually refined user experience.

## Tech Stack

- React.js frontend with TypeScript
- Tailwind CSS for responsive design
- Express.js backend with comprehensive route handling
- Zod validation for data integrity
- Advanced state management with React Query
- PostgreSQL database with Drizzle ORM

## Deployment to Vercel

### Prerequisites

1. **GitHub Repository Setup**
   - Ensure your GitHub repository contains all necessary files
   - Make sure the following crucial files are present and properly configured:
     - `vercel.json` - Vercel configuration
     - `api/index.js` - Serverless API entry point
     - `api/vercel.js` - Vercel-specific API handler
     - `api/package.json` - Dependencies for API functions

2. **Required Environment Variables:**
   - `DATABASE_URL`: PostgreSQL connection string
   - `SESSION_SECRET`: Random string for session security
   - `STRIPE_SECRET_KEY`: Your Stripe secret key
   - `VITE_STRIPE_PUBLIC_KEY`: Your Stripe publishable key (client-side)

### Deployment Options

#### Option 1: Deploy via Vercel CLI (Recommended)

This approach gives you the most control over the deployment process.

1. **Install Vercel CLI globally:**
   ```bash
   npm install -g vercel
   ```

2. **Log in to Vercel:**
   ```bash
   vercel login
   ```

3. **Prepare your project:**
   ```bash
   node vercel-deploy.js
   ```
   This script will prepare your project for Vercel deployment by:
   - Building the frontend
   - Setting up serverless functions
   - Ensuring proper configuration

4. **Deploy to Vercel:**
   ```bash
   vercel
   ```
   Follow the prompts to configure your project.

5. **Deploy to production:**
   ```bash
   vercel --prod
   ```

#### Option 2: Deploy via Vercel Dashboard

1. **Fork the repository** to your GitHub account

2. **Import your project to Vercel:**
   - Go to [Vercel Dashboard](https://vercel.com/dashboard)
   - Click "Add New" > "Project"
   - Choose your repository
   - Configure project settings:
     - Framework Preset: Other
     - Build Command: `npm run build`
     - Output Directory: `dist`
     - Install Command: `npm install`

3. **Configure Environment Variables:**
   - Add all required environment variables in the Vercel project settings

4. **Deploy your project:**
   - Click "Deploy"
   - Wait for the deployment to complete

### Understanding Our Vercel Setup

Our Vercel deployment uses a hybrid approach:

1. **Frontend:** Static files built with Vite and served from the `dist` directory
2. **Backend API:** Serverless functions in the `api` directory:
   - `api/index.js` - Handles API requests and serves a static landing page
   - `api/vercel.js` - Alternative API handler specifically for Vercel
   - `api/package.json` - Defines dependencies for serverless functions

The key files that make this work:

- **vercel.json**: Configuration for routing and build settings
- **vercel-deploy.js**: Preparation script for deployment
- **.vercelignore**: Controls which files are excluded from deployment

### Troubleshooting Deployment Issues

If you encounter deployment problems:

1. **Check build logs** in the Vercel dashboard
2. **Verify API routes** are correctly configured
3. **Test serverless functions** individually
4. **Ensure all environment variables** are properly set
5. **Check for TypeScript compilation errors** in the build logs

If TypeScript compilation fails, the fallback mechanism will serve the static API version.

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

## Database Management

For database migrations:
```
npm run db:push
```