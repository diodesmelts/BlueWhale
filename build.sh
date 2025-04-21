#!/bin/bash
set -e

echo "Installing dependencies with NPM..."
npm ci || npm install

echo "Moving vite and esbuild to regular dependencies..."
# This is a critical step for Render deployment
npm install --save vite@5.4.14 esbuild@0.25.0

echo "Building frontend with Vite..."
npm exec -- vite build

echo "Building backend with esbuild..."
npm exec -- esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist

echo "Build completed successfully"