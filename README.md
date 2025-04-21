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

### Option 1: Using the Render Dashboard

1. **Connect your GitHub repository:**
   - Go to Render Dashboard
   - Click "New" > "Web Service"
   - Connect your GitHub repository

2. **Configure the Web Service:**
   - Name: `blue-whale-app`
   - Build Command: `npm install && npm run build`
   - Start Command: `npm run start`
   - Add Environment Variables:
     - `NODE_ENV`: `production`
     - `DATABASE_URL`: (Your PostgreSQL connection string)
     - `SESSION_SECRET`: (A random string)
     - `STRIPE_SECRET_KEY`: (Your Stripe secret key)
     - `VITE_STRIPE_PUBLIC_KEY`: (Your Stripe publishable key)

3. **Create a PostgreSQL Database:**
   - Go to Render Dashboard
   - Click "New" > "PostgreSQL"
   - Configure your database settings
   - Use the provided connection string in your web service env vars

### Option 2: Using Render Blueprint (render.yaml)

1. **Deploy directly from the repository:**
   - Go to Render Dashboard
   - Click "Blueprint" > "New Blueprint Instance"
   - Connect your GitHub repository
   - Render will automatically set up the web service and database based on the `render.yaml` configuration

2. **Add required environment variables:**
   - After deployment, add:
     - `STRIPE_SECRET_KEY`: (Your Stripe secret key)
     - `VITE_STRIPE_PUBLIC_KEY`: (Your Stripe publishable key)

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