#!/bin/bash
set -e

echo "Installing dependencies..."
npm install

echo "Building frontend..."
# Try multiple ways to run vite to maximize chances of success
if [ -f "./node_modules/vite/bin/vite.js" ]; then
  echo "Using direct path to vite.js"
  node ./node_modules/vite/bin/vite.js build
elif [ -f "./node_modules/.bin/vite" ]; then
  echo "Using .bin/vite executable"
  ./node_modules/.bin/vite build
else
  echo "Trying npx as fallback"
  npx vite build
fi

echo "Building backend..."
# Try multiple ways to run esbuild to maximize chances of success
if [ -f "./node_modules/esbuild/bin/esbuild" ]; then
  echo "Using direct path to esbuild"
  node ./node_modules/esbuild/bin/esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist
elif [ -f "./node_modules/.bin/esbuild" ]; then
  echo "Using .bin/esbuild executable"
  ./node_modules/.bin/esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist
else
  echo "Trying npx as fallback"
  npx esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist
fi

echo "Build completed successfully"