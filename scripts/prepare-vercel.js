/**
 * This script prepares the backend for Vercel deployment
 * It builds the server files and ensures proper folder structure
 */

import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

async function main() {
  console.log('Preparing project for Vercel deployment...');

  // Create required directories
  console.log('Creating necessary directories...');
  ensureDir('dist/server');
  ensureDir('dist/shared');
  ensureDir('dist/api');

  // Copy shared schema
  console.log('Copying shared schema...');
  copyDir('shared', 'dist/shared');

  // Build the server with esbuild
  console.log('Building server files...');
  try {
    await execAsync(
      'esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outfile=dist/index.js'
    );
    console.log('✅ Server build successful');
  } catch (error) {
    console.error('❌ Server build failed:', error);
    process.exit(1);
  }

  // Create serverless function for Vercel
  console.log('Creating serverless function entry point...');
  
  fs.writeFileSync('dist/api/index.js', `
// API route handler for Vercel
import { createServer } from 'http';
import { app } from '../index.js';

// Create server instance
const server = createServer(app);

// Export the Express API
export default app;
  `);

  console.log('✅ Vercel preparation complete!');
}

function ensureDir(dir) {
  const fullPath = path.resolve(dir);
  if (!fs.existsSync(fullPath)) {
    fs.mkdirSync(fullPath, { recursive: true });
  }
}

function copyDir(src, dest) {
  const fullSrcPath = path.resolve(src);
  const fullDestPath = path.resolve(dest);
  
  ensureDir(fullDestPath);
  
  const entries = fs.readdirSync(fullSrcPath, { withFileTypes: true });
  
  for (const entry of entries) {
    const srcPath = path.join(fullSrcPath, entry.name);
    const destPath = path.join(fullDestPath, entry.name);
    
    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

main().catch(console.error);