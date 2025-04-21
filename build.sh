#!/bin/bash
set -e

echo "=== STARTING BUILD PROCESS ==="

# Install core dependencies
echo "=== Installing dependencies ==="
npm install

# Install critical build tools globally
echo "=== Installing build tools globally ==="
npm install -g vite esbuild typescript

# List installed packages for debugging
echo "=== Installed global packages ==="
npm list -g --depth=0

echo "=== Installed local packages ==="
npm list --depth=0 | grep -E 'vite|esbuild'

# Create a production-compatible Vite config
echo "=== Creating production Vite config ==="
cat > vite.config.production.js << 'EOF'
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

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

# Build frontend
echo "=== Building frontend ==="
vite build --config vite.config.production.js

# Build backend
echo "=== Building backend ==="
esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist

# Create a small verification script
echo "=== Creating verification files ==="
echo 'console.log("Build completed successfully at", new Date().toISOString());' > dist/build-verification.js

# Execute verification
node dist/build-verification.js

echo "=== BUILD PROCESS COMPLETED SUCCESSFULLY ==="