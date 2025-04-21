/**
 * Vercel API Entry Point
 * 
 * This serverless function acts as the entry point for all API routes on Vercel.
 * It imports and uses the Express app from our server code.
 */

// Use ESM syntax for compatibility
import { app } from '../server/index.js';

// Export the Express app as the default handler
export default app;