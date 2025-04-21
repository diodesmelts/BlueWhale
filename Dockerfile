FROM node:18.16.0

WORKDIR /app

# Install dependencies first (for better caching)
COPY package*.json ./
RUN npm ci --only=production

# Copy application code
COPY . .

# Set environment variables
ENV NODE_ENV=production 
ENV PORT=10000

# Build the server side only - no Vite
RUN npm install --no-save typescript esbuild
RUN npx esbuild server/index.ts --platform=node --bundle --packages=external --outfile=dist/index.js

# Create a minimal frontend that avoids Vite issues
RUN mkdir -p dist/public/assets
RUN echo '<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Blue Whale</title><style>body{font-family:system-ui;margin:0;padding:20px;background:#f0f8ff;color:#00008b}h1{color:#0066cc}</style></head><body><h1>Blue Whale Competitions</h1><div id="status">Server running!</div><script>fetch("/api/user").then(r=>document.getElementById("status").innerHTML="API is working!")</script></body></html>' > dist/public/index.html

# Expose required port
EXPOSE 10000

# Run the application
CMD ["node", "dist/index.js"]