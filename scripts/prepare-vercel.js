#!/usr/bin/env node

/**
 * This script prepares the backend for Vercel deployment
 * It builds the server files and ensures proper folder structure
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

function main() {
  console.log('Preparing project for Vercel deployment...');

  // Create required directories
  console.log('Creating necessary directories...');
  ensureDir('dist/server');
  ensureDir('dist/shared');
  ensureDir('dist/api');

  // Copy shared schema
  console.log('Copying shared schema...');
  copyDir('shared', 'dist/shared');

  // Try multiple build approaches
  console.log('Building server files...');
  
  try {
    console.log('Method 1: Using esbuild...');
    
    // Install esbuild if not already installed
    try {
      // Check if esbuild exists
      execSync('npx esbuild --version', { stdio: 'ignore' });
    } catch (e) {
      // Install esbuild if not found
      console.log('Installing esbuild...');
      execSync('npm install --no-save esbuild');
    }
    
    execSync(
      'npx esbuild server/index.ts --platform=node --external:express --external:pg --external:drizzle-orm --bundle --outfile=dist/index.js',
      { stdio: 'inherit' }
    );
    console.log('✅ Server build successful with esbuild');
  } catch (error) {
    console.error('❌ esbuild approach failed, trying TypeScript compiler...');
    
    try {
      console.log('Method 2: Using TypeScript compiler...');
      execSync('npx tsc --skipLibCheck server/index.ts --outDir dist', { stdio: 'inherit' });
      console.log('✅ Server build successful with TypeScript');
    } catch (error) {
      console.error('❌ TypeScript approach failed, using direct file copy...');
      
      console.log('Method 3: Using direct file copy...');
      // Copy server directory
      copyDir('server', 'dist/server');
      
      // Create a simple starter script
      fs.writeFileSync('dist/index.js', `
// Simple server starter that works with TypeScript files
const { spawn } = require('child_process');
const path = require('path');

// Use tsx to run the TypeScript file
const tsx = path.resolve(require.resolve('tsx'));
const serverPath = path.resolve(__dirname, 'server/index.ts');

// Start the server
require(tsx).run(serverPath);
      `);
      
      // Install tsx as a dependency if not present
      try {
        console.log('Installing tsx for runtime TypeScript execution...');
        execSync('npm install --no-save tsx', { stdio: 'inherit' });
      } catch (e) {
        console.error('Failed to install tsx:', e);
      }
    }
  }

  // Create serverless function for Vercel
  console.log('Creating serverless function entry point...');
  
  fs.writeFileSync('dist/api/index.js', `
// API route handler for Vercel
const app = require('../index.js').app;

// Export the Express API
module.exports = app;
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

// Run the main function
try {
  main();
} catch (error) {
  console.error('Error in prepare-vercel script:', error);
  process.exit(1);
}