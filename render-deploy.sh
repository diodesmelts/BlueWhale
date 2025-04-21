#!/bin/bash

# This is a special deploy script for Render that avoids using Vite directly
# It will be executed by Render's build process

set -e

echo "Starting custom Render deployment process"

# Install required dependencies
echo "Installing build dependencies"
npm install --no-save esbuild typescript

# Create essential directories
echo "Creating directories"
mkdir -p dist
mkdir -p dist/public
mkdir -p dist/shared

# Copy shared schema
echo "Copying shared schema"
cp -r ./shared/* ./dist/shared/

# Build the server with esbuild
echo "Building server"
./node_modules/.bin/esbuild server/index.ts --platform=node --bundle --outfile=dist/index.js --external:express --external:pg --external:drizzle-orm

# Create a static HTML file
echo "Creating static frontend"
cat > dist/public/index.html << 'EOL'
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Blue Whale Competitions</title>
    <style>
      body {
        font-family: system-ui, -apple-system, sans-serif;
        margin: 0;
        padding: 0;
        background: #000;
        color: #fff;
        height: 100vh;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        text-align: center;
      }
      h1 {
        font-size: 2.5rem;
        color: #0066cc;
        margin-bottom: 1rem;
      }
      p {
        margin: 0.5rem 0;
        font-size: 1.2rem;
      }
      .logo {
        font-size: 4rem;
        margin-bottom: 1rem;
        color: #0066cc;
      }
      .container {
        background: rgba(0,0,0,0.8);
        padding: 2rem;
        border-radius: 8px;
        max-width: 800px;
        box-shadow: 0 0 20px rgba(0,102,204,0.3);
      }
      .status {
        margin-top: 2rem;
        padding: 1rem;
        border-radius: 4px;
        background: rgba(0,102,204,0.1);
      }
      .status.success {
        border-left: 4px solid #00cc66;
      }
      .status.pending {
        border-left: 4px solid #ffc107;
      }
      .status.error {
        border-left: 4px solid #ff3333;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="logo">🐋</div>
      <h1>Blue Whale Competitions</h1>
      <p>The server is running successfully!</p>
      <div id="status" class="status pending">Checking API connection...</div>
    </div>
    <script>
      fetch("/api/user")
        .then(response => {
          if (response.ok || response.status === 401) {
            document.getElementById("status").innerHTML = "✅ API is responding correctly!";
            document.getElementById("status").className = "status success";
          } else {
            document.getElementById("status").innerHTML = "⚠️ API returned unexpected status: " + response.status;
            document.getElementById("status").className = "status error";
          }
        })
        .catch(error => {
          document.getElementById("status").innerHTML = "❌ Error connecting to API: " + error.message;
          document.getElementById("status").className = "status error";
        });
    </script>
  </body>
</html>
EOL

echo "Build completed successfully!"