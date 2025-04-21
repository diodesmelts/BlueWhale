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

# Install dev dependencies needed for build
RUN npm install --no-save typescript esbuild

# Install Drizzle CLI for database operations
RUN npm install --no-save drizzle-kit

# Make sure shared folder is properly copied for schema access
RUN mkdir -p dist/shared
RUN cp -r ./shared/* ./dist/shared/

# Build the server side only - no Vite
RUN npx esbuild server/index.ts --platform=node --bundle --packages=external --outfile=dist/index.js

# Create a slightly nicer frontend that shows Blue Whale branding
RUN mkdir -p dist/public/assets
RUN echo '<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Blue Whale Competitions</title><style>body{font-family:system-ui,sans-serif;margin:0;padding:0;background:#000;color:#fff;height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center}h1{font-size:2.5rem;color:#0066cc;margin-bottom:1rem}p{margin:0.5rem 0;font-size:1.2rem}.logo{font-size:4rem;margin-bottom:1rem;color:#0066cc}.container{background:rgba(0,0,0,0.8);padding:2rem;border-radius:8px;max-width:800px;box-shadow:0 0 20px rgba(0,102,204,0.3)}.status{margin-top:2rem;padding:1rem;border-radius:4px;background:rgba(0,102,204,0.1);}.status.success{border-left:4px solid #00cc66}.status.pending{border-left:4px solid #ffc107}.status.error{border-left:4px solid #ff3333}</style></head><body><div class="container"><div class="logo">🐋</div><h1>Blue Whale Competitions</h1><p>The server is running successfully!</p><div id="status" class="status pending">Checking API connection...</div></div><script>fetch("/api/user").then(response => {if (response.ok || response.status === 401) {document.getElementById("status").innerHTML = "✅ API is responding correctly!";document.getElementById("status").className = "status success";} else {document.getElementById("status").innerHTML = "⚠️ API returned unexpected status: " + response.status;document.getElementById("status").className = "status error";}}).catch(error => {document.getElementById("status").innerHTML = "❌ Error connecting to API: " + error.message;document.getElementById("status").className = "status error";});</script></body></html>' > dist/public/index.html

# Expose required port
EXPOSE 10000

# Run the application
CMD ["node", "dist/index.js"]