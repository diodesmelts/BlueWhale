#!/usr/bin/env node

/**
 * Standalone Vite build script
 * This provides a direct way to build with Vite without using the CLI
 */

const { build } = require('vite');
const { resolve } = require('path');

async function buildProject() {
  console.log('🔨 Starting Vite build via API...');
  
  try {
    // Load config file
    const configFile = resolve(__dirname, 'vite.config.ts');
    console.log(`Using config file: ${configFile}`);
    
    // Run the build
    await build({
      configFile,
      root: __dirname,
      base: '/',
      mode: 'production',
      build: {
        outDir: 'dist/public',
        emptyOutDir: true,
        sourcemap: false,
        minify: true
      }
    });
    
    console.log('✅ Vite build via API completed successfully!');
  } catch (error) {
    console.error('❌ Vite build via API failed:', error);
    process.exit(1);
  }
}

buildProject();