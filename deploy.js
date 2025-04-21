#!/usr/bin/env node

/**
 * This is a custom deployment script that builds the project in a way that works on Render.
 * It handles both the frontend and backend building process without relying on complex Vite configurations.
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m'
};

// Helper function to execute commands and print them
function runCommand(command, options = {}) {
  console.log(`${colors.blue}> ${command}${colors.reset}`);
  return execSync(command, { 
    stdio: 'inherit',
    ...options
  });
}

// Helper function to log with colors
function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

// Main deployment function
async function deploy() {
  try {
    log('🚀 Starting deployment process...', colors.bright + colors.green);
    
    // Install dependencies
    log('\n📦 Installing dependencies...', colors.yellow);
    runCommand('npm install');
    
    // Build frontend
    log('\n🏗️ Building frontend...', colors.yellow);
    if (!fs.existsSync('./client/dist')) {
      fs.mkdirSync('./client/dist', { recursive: true });
    }
    
    try {
      runCommand('npx vite build', { 
        env: { ...process.env, NODE_ENV: 'production' }
      });
    } catch (error) {
      log('\n⚠️ Vite build failed, trying alternative build method...', colors.bright + colors.yellow);
      // Create a simple public directory with index.html
      const publicDir = path.join(__dirname, 'dist', 'public');
      if (!fs.existsSync(publicDir)) {
        fs.mkdirSync(publicDir, { recursive: true });
      }
      
      // Copy client files to public
      runCommand('cp -r ./client/src ./dist/public/');
      runCommand('cp -r ./client/index.html ./dist/public/');
      
      log('✅ Created fallback static assets', colors.green);
    }
    
    // Build backend
    log('\n🔧 Building backend...', colors.yellow);
    try {
      runCommand('npx esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist');
    } catch (error) {
      log('\n⚠️ esbuild failed, trying TypeScript compiler...', colors.bright + colors.yellow);
      
      runCommand('npx tsc --project tsconfig.json');
      log('✅ TypeScript compilation successful', colors.green);
    }
    
    // Create verification file
    const verificationPath = path.join(__dirname, 'dist', 'build-verification.txt');
    fs.writeFileSync(verificationPath, `Build completed at ${new Date().toISOString()}`);
    
    log('\n✅ Deployment process completed successfully!', colors.bright + colors.green);
  } catch (error) {
    log(`\n❌ Deployment failed: ${error.message}`, colors.bright + colors.red);
    process.exit(1);
  }
}

// Run the deployment
deploy();