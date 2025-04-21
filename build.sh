#!/bin/bash
set -e

echo "Installing dependencies with NPM..."
npm ci || npm install

echo "Moving vite and esbuild to regular dependencies..."
# This is a critical step for Render deployment
npm install --save vite@5.4.14 esbuild@0.25.0

echo "Listing directory contents for debugging:"
ls -la

echo "Creating a simplified vite.config for production build..."
cat > vite.config.js << 'EOF'
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "client", "src"),
      "@shared": path.resolve(__dirname, "shared"),
      "@assets": path.resolve(__dirname, "attached_assets"),
    },
  },
  root: path.resolve(__dirname, "client"),
  build: {
    outDir: path.resolve(__dirname, "dist/public"),
    emptyOutDir: true,
  },
});
EOF

echo "Building frontend with simplified config..."
npm exec -- vite build --config ./vite.config.js

echo "Building backend with esbuild..."
npm exec -- esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist

echo "Build completed successfully"