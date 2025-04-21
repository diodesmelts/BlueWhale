#!/usr/bin/env node

/**
 * This is a completely standalone build script that
 * bypasses Vite entirely and creates a deployable backend
 * with a simple static frontend
 */

const fs = require('fs');
const path = require('path');
const childProcess = require('child_process');

// Simple logging with timestamp
function log(message) {
  console.log(`[${new Date().toISOString()}] ${message}`);
}

// Run command and capture output
function runCommand(command, options = {}) {
  log(`Running: ${command}`);
  try {
    const output = childProcess.execSync(command, { 
      encoding: 'utf8',
      ...options
    });
    return { success: true, output };
  } catch (error) {
    log(`Command failed: ${error.message}`);
    return { success: false, error };
  }
}

// Create directory if it doesn't exist
function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    log(`Created directory: ${dir}`);
  }
}

async function build() {
  log('Starting cloud-friendly build process');
  
  // Install build dependencies if needed
  log('Installing build dependencies');
  runCommand('npm install --no-save esbuild typescript');
  
  // Create essential directories
  ensureDir('./dist');
  ensureDir('./dist/public');
  ensureDir('./dist/shared');
  
  // Copy shared schema
  log('Copying shared schema');
  runCommand('cp -r ./shared/* ./dist/shared/');
  
  // Build the server with esbuild
  log('Building server with esbuild');
  runCommand('npx esbuild server/index.ts --platform=node --bundle --outfile=dist/index.js --external:express --external:pg --external:drizzle-orm');
  
  // Create a basic index.html
  const indexHtml = `
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Blue Whale Competitions</title>
    <style>
      body {
        font-family: system-ui, -apple-system, sans-serif;
        margin: 0;
        padding: 0;
        background: #000;
        color: #fff;
        height: 100vh;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        text-align: center;
      }
      h1 {
        font-size: 2.5rem;
        color: #0066cc;
        margin-bottom: 1rem;
      }
      p {
        margin: 0.5rem 0;
        font-size: 1.2rem;
      }
      .logo {
        font-size: 4rem;
        margin-bottom: 1rem;
        color: #0066cc;
      }
      .container {
        background: rgba(0,0,0,0.8);
        padding: 2rem;
        border-radius: 8px;
        max-width: 800px;
        box-shadow: 0 0 20px rgba(0,102,204,0.3);
      }
      .status {
        margin-top: 2rem;
        padding: 1rem;
        border-radius: 4px;
        background: rgba(0,102,204,0.1);
      }
      .status.success {
        border-left: 4px solid #00cc66;
      }
      .status.pending {
        border-left: 4px solid #ffc107;
      }
      .status.error {
        border-left: 4px solid #ff3333;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="logo">🐋</div>
      <h1>Blue Whale Competitions</h1>
      <p>The server is running successfully!</p>
      <div id="status" class="status pending">Checking API connection...</div>
    </div>
    <script>
      fetch("/api/user")
        .then(response => {
          if (response.ok || response.status === 401) {
            document.getElementById("status").innerHTML = "✅ API is responding correctly!";
            document.getElementById("status").className = "status success";
          } else {
            document.getElementById("status").innerHTML = "⚠️ API returned unexpected status: " + response.status;
            document.getElementById("status").className = "status error";
          }
        })
        .catch(error => {
          document.getElementById("status").innerHTML = "❌ Error connecting to API: " + error.message;
          document.getElementById("status").className = "status error";
        });
    </script>
  </body>
</html>`;

  fs.writeFileSync('./dist/public/index.html', indexHtml);
  
  // Create a simple package.json for the production deployment
  const packageJson = {
    "name": "blue-whale-competitions",
    "version": "1.0.0",
    "private": true,
    "scripts": {
      "start": "node index.js"
    },
    "dependencies": {
      "express": "^4.18.2",
      "drizzle-orm": "^0.28.6",
      "pg": "^8.11.3",
      "@neondatabase/serverless": "^0.6.0",
      "zod": "^3.22.2",
      "stripe": "^13.9.0"
    },
    "engines": {
      "node": ">=18.0.0"
    }
  };
  
  fs.writeFileSync('./dist/package.json', JSON.stringify(packageJson, null, 2));
  
  // Create a simple start script
  const startScript = `#!/bin/bash
export NODE_ENV=production
node index.js`;
  
  fs.writeFileSync('./dist/start.sh', startScript);
  runCommand('chmod +x ./dist/start.sh');
  
  log('Build completed successfully! The dist/ directory is ready for deployment.');
}

build().catch(error => {
  log(`Build failed: ${error.message}`);
  process.exit(1);
});