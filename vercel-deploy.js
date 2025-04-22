// Standalone Vercel deployment script
// This script prepares the project for Vercel deployment
// It creates a clean bundle that works with Vercel's serverless functions

import { exec } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function runCommand(command, options = {}) {
  return new Promise((resolve, reject) => {
    log(`Running: ${command}`, colors.cyan);
    
    exec(command, { ...options }, (error, stdout, stderr) => {
      if (error) {
        log(`Error: ${error.message}`, colors.red);
        return reject(error);
      }
      
      if (stderr) {
        log(`Command stderr: ${stderr}`, colors.yellow);
      }
      
      log(`Command completed: ${command}`, colors.green);
      resolve(stdout);
    });
  });
}

async function prepareVercelDeployment() {
  try {
    log('Starting Vercel deployment preparation...', colors.blue);

    // Step 1: Ensure API folder exists
    if (!fs.existsSync(path.join(__dirname, 'api'))) {
      fs.mkdirSync(path.join(__dirname, 'api'));
      log('Created api folder', colors.green);
    }

    // Step 2: Build the frontend
    log('Building frontend...', colors.blue);
    await runCommand('npx vite build');

    // Step A simple alternative approach that skips TypeScript compilation
    log('Setting up serverless functions...', colors.blue);
    
    // Make sure the API folder has the right files
    if (!fs.existsSync(path.join(__dirname, 'api', 'index.js'))) {
      log('Warning: api/index.js not found, deployment may fail', colors.yellow);
    }

    if (!fs.existsSync(path.join(__dirname, 'api', 'vercel.js'))) {
      log('Warning: api/vercel.js not found, deployment may fail', colors.yellow);
    }

    // Create a simple package.json for the API folder
    const apiPackageJson = {
      "name": "blue-whale-api",
      "version": "1.0.0",
      "dependencies": {
        "express": "^4.18.2"
      }
    };

    fs.writeFileSync(
      path.join(__dirname, 'api', 'package.json'),
      JSON.stringify(apiPackageJson, null, 2)
    );
    log('Created api/package.json', colors.green);

    // Verify vercel.json exists
    if (!fs.existsSync(path.join(__dirname, 'vercel.json'))) {
      log('Warning: vercel.json not found. Creating a default one...', colors.yellow);
      
      const vercelConfig = {
        "buildCommand": "npm run build",
        "outputDirectory": "dist",
        "framework": null,
        "rewrites": [
          { "source": "/api/(.*)", "destination": "/api/$1" },
          { "source": "/(.*)", "destination": "/" }
        ]
      };
      
      fs.writeFileSync(
        path.join(__dirname, 'vercel.json'),
        JSON.stringify(vercelConfig, null, 2)
      );
      log('Created vercel.json', colors.green);
    }

    log('Vercel deployment preparation complete!', colors.green);
    log('\nDeployment Instructions:', colors.blue);
    log('1. Install Vercel CLI: npm i -g vercel', colors.cyan);
    log('2. Login to Vercel: vercel login', colors.cyan);
    log('3. Deploy project: vercel', colors.cyan);
    log('4. For production: vercel --prod', colors.cyan);
    
  } catch (error) {
    log(`Deployment preparation failed: ${error.message}`, colors.red);
    process.exit(1);
  }
}

prepareVercelDeployment();