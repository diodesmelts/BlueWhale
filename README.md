# Blue Whale Competitions

A dynamic competition tracking web application that empowers users to discover, manage, and monitor online competitions through an intelligent and visually refined user experience.

## Tech Stack

- React.js frontend with TypeScript
- Tailwind CSS for responsive design
- Express.js backend with comprehensive route handling
- Zod validation for data integrity
- Advanced state management with React Query
- PostgreSQL database with Drizzle ORM

## Deployment to Render

### Deployment Process (Docker-based)

For the most reliable deployment, follow these steps:

1. **Make sure these files are present in your GitHub repository**:
   - `Dockerfile` - Docker configuration for containerized deployment
   - `render.yaml` - Blueprint configuration for automated setup

2. **Choose one of these deployment methods**:

### Option 1: Using Render Blueprint (Recommended)

1. **Deploy directly from the repository:**
   - Go to Render Dashboard
   - Click "Blueprint" > "New Blueprint Instance"
   - Connect your GitHub repository
   - Render will automatically set up the web service and database based on the `render.yaml` configuration

2. **Add required environment variables:**
   - After deployment, add these secrets:
     - `STRIPE_SECRET_KEY`: (Your Stripe secret key)
     - `VITE_STRIPE_PUBLIC_KEY`: (Your Stripe publishable key)

### Option 2: Manual Deployment

1. **Create a web service:**
   - Go to Render Dashboard
   - Click "New" > "Web Service"
   - Connect your GitHub repository

2. **Configure the Web Service:**
   - Name: `blue-whale-app`
   - Environment: `Docker`
   - Docker Command: `npm run start`
   - Add Environment Variables:
     - `NODE_ENV`: `production`
     - `PORT`: `10000`
     - `DATABASE_URL`: (Your PostgreSQL connection string)
     - `SESSION_SECRET`: (A random string)
     - `STRIPE_SECRET_KEY`: (Your Stripe secret key)
     - `VITE_STRIPE_PUBLIC_KEY`: (Your Stripe publishable key)

3. **Create a PostgreSQL Database:**
   - Go to Render Dashboard
   - Click "New" > "PostgreSQL"
   - Configure your database settings
   - Use the provided connection string in your web service env vars

### Why Docker?

Using Docker for deployment provides several benefits:
- Consistent build environment across all platforms
- Eliminates "command not found" errors by packaging all dependencies
- Isolates the application for better security
- Simplifies environment configuration

### Troubleshooting Deployment Issues

If you encounter build issues:

1. **Check build logs** in the Render dashboard
2. **Verify Docker is building correctly**
3. **Ensure all environment variables** are correctly set
4. **Check database connection** if the app builds but fails at runtime

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