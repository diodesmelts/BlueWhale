#!/usr/bin/env node

/**
 * Enhanced build script for Vercel deployment
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

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

async function buildProject() {
  try {
    log('Starting enhanced build for Vercel deployment');
    
    // Full build including front-end and back-end
    log('Building client and server...');
    runCommand('vite build');
    runCommand('esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist');
    
    // Copy API routes to make them directly accessible
    log('Copying serverless API handlers...');
    fs.mkdirSync(path.join('dist', 'api'), { recursive: true });
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