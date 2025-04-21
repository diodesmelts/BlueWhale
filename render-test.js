#!/usr/bin/env node

/**
 * This is a simple test script to verify the environment
 * on Render and identify any specific issues.
 */

const fs = require('fs');
const path = require('path');
const os = require('os');
const childProcess = require('child_process');

function log(message) {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${message}`);
  fs.appendFileSync('render-diagnostic.log', `[${timestamp}] ${message}\n`);
}

async function runTest() {
  log('Starting Render environment diagnostic test');
  
  // System info
  log(`Node.js version: ${process.version}`);
  log(`OS: ${os.type()} ${os.release()}`);
  log(`CPU: ${os.cpus()[0].model}`);
  log(`Memory: ${Math.round(os.totalmem() / (1024 * 1024 * 1024))}GB`);
  log(`Hostname: ${os.hostname()}`);
  log(`User: ${os.userInfo().username}`);
  
  // Directory structure
  log('Current directory structure:');
  try {
    const dirOutput = childProcess.execSync('find . -type d -not -path "*/node_modules/*" -not -path "*/\\.*" | sort', { encoding: 'utf8' });
    log(dirOutput);
  } catch (err) {
    log(`Error listing directories: ${err.message}`);
  }
  
  // Check environment variables
  log('Environment variables:');
  Object.keys(process.env)
    .filter(key => !key.match(/TOKEN|SECRET|PASSWORD|KEY/i)) // Skip sensitive values
    .sort()
    .forEach(key => {
      log(`${key}=${process.env[key]}`);
    });
  
  // List installed packages
  log('Package.json contents:');
  try {
    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    log(JSON.stringify(packageJson, null, 2));
  } catch (err) {
    log(`Error reading package.json: ${err.message}`);
  }
  
  // Test vite resolution
  try {
    log('Testing Vite module resolution:');
    const result = childProcess.execSync('node -e "console.log(require.resolve(\'vite\'))"', { encoding: 'utf8' });
    log(`Vite resolved to: ${result.trim()}`);
  } catch (err) {
    log(`Vite resolution error: ${err.message}`);
  }
  
  // Test esbuild functionality
  try {
    log('Testing esbuild functionality:');
    const testFile = './esbuild-test.js';
    fs.writeFileSync(testFile, 'console.log("Hello from esbuild test");');
    
    const esbuildResult = childProcess.execSync('npx esbuild --version && npx esbuild ./esbuild-test.js --outfile=./esbuild-test.out.js', { encoding: 'utf8' });
    log(`esbuild test result: ${esbuildResult.trim()}`);
    
    // Clean up
    fs.unlinkSync(testFile);
    fs.unlinkSync('./esbuild-test.out.js');
  } catch (err) {
    log(`esbuild test error: ${err.message}`);
  }
  
  log('Diagnostic test completed');
}

runTest().catch(err => {
  log(`Test failed with error: ${err.message}`);
});