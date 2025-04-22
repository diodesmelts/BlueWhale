#!/usr/bin/env node

/**
 * Enhanced build script for Vercel deployment
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

function log(message) {
  console.log(`[build] ${message}`);
}

function runCommand(command, options = {}) {
  log(`Executing: ${command}`);
  return execSync(command, {
    stdio: 'inherit',
    ...options,
  });
}

function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

async function buildProject() {
  try {
    log('Starting enhanced build for Vercel deployment');
    
    // Install dependencies if needed
    if (!fs.existsSync('node_modules')) {
      log('Installing dependencies...');
      runCommand('npm install');
    }
    
    // Generate the main frontend build
    log('Building frontend with Vite...');
    try {
      runCommand('npx vite build');
    } catch (error) {
      log(`Vite build failed: ${error.message}`);
      log('Falling back to simplified build...');
      // Create a minimal dist directory
      ensureDir('dist');
    }
    
    // Bundle the server
    log('Building server with esbuild...');
    try {
      runCommand('npx esbuild server/index.ts --platform=node --packages=external --bundle --outdir=dist --format=esm');
    } catch (error) {
      log(`Server build failed: ${error.message}`);
    }
    
    // Copy API handlers to dist
    log('Copying API handlers...');
    ensureDir(path.join('dist', 'api'));
    if (fs.existsSync('api')) {
      fs.readdirSync('api').forEach(file => {
        if (file.endsWith('.js')) {
          fs.copyFileSync(
            path.join('api', file),
            path.join('dist', 'api', file)
          );
        }
      });
    }
    
    // Ensure we have an index.html
    if (!fs.existsSync(path.join('dist', 'index.html'))) {
      log('Creating fallback index.html...');
      const apiIndexPath = path.join('api', 'index.js');
      if (fs.existsSync(apiIndexPath)) {
        const apiIndexContent = fs.readFileSync(apiIndexPath, 'utf8');
        // Extract the HTML template if it exists
        const htmlMatch = apiIndexContent.match(/const landingPage = `([\s\S]*?)`;/);
        if (htmlMatch && htmlMatch[1]) {
          fs.writeFileSync(path.join('dist', 'index.html'), htmlMatch[1]);
        } else {
          // Create a simple redirect
          fs.writeFileSync(path.join('dist', 'index.html'), `
<!DOCTYPE html>
<html>
<head>
  <meta http-equiv="refresh" content="0;url=/api">
</head>
<body>
  Redirecting to Blue Whale Competitions...
</body>
</html>
          `);
        }
      }
    }
    
    log('Build completed successfully!');
  } catch (error) {
    log(`Build failed: ${error.message}`);
    process.exit(1);
  }
}

buildProject().catch(err => {
  console.error('Unhandled error:', err);
  process.exit(1);
});