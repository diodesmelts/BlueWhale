// Pre-build script for Vercel deployment
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('Starting Vercel build process...');

// Run the build command
try {
  console.log('Building the application...');
  execSync('npm run build', { stdio: 'inherit' });
  console.log('Build completed successfully.');
} catch (error) {
  console.error('Error building application:', error);
  process.exit(1);
}

// Create a simplified index.html in the root directory for Vercel to serve
const rootIndexPath = path.join(__dirname, 'index.html');
const distIndexPath = path.join(__dirname, 'dist', 'public', 'index.html');

if (fs.existsSync(distIndexPath)) {
  console.log('Creating root index.html to redirect to the built application...');
  
  // Create a simple HTML file that redirects to the built application
  const redirectHtml = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta http-equiv="refresh" content="0;url=/dist/public/index.html">
    <title>Blue Whale Competitions - Redirecting...</title>
    <style>
      body {
        font-family: Arial, sans-serif;
        background-color: #0a192f;
        color: white;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        height: 100vh;
        margin: 0;
        text-align: center;
      }
      .loading {
        display: inline-block;
        width: 50px;
        height: 50px;
        border: 3px solid rgba(100, 255, 218, 0.3);
        border-radius: 50%;
        border-top-color: #64ffda;
        animation: spin 1s ease-in-out infinite;
      }
      @keyframes spin {
        to { transform: rotate(360deg); }
      }
    </style>
  </head>
  <body>
    <div class="loading"></div>
    <p>Redirecting to Blue Whale Competitions...</p>
  </body>
</html>`;

  fs.writeFileSync(rootIndexPath, redirectHtml);
  console.log('Root index.html created successfully.');
} else {
  console.error('Error: dist/public/index.html not found. Build may have failed.');
  process.exit(1);
}

console.log('Vercel build process completed successfully.');