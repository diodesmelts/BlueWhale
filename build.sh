#!/bin/bash

# Install dependencies
npm install

# Build frontend with explicit path to vite
node ./node_modules/vite/bin/vite.js build

# Build backend with explicit path to esbuild
node ./node_modules/esbuild/bin/esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist