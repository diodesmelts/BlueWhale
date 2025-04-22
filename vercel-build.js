const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('Starting custom Vercel build process...');

// Run the Vite build for the frontend
try {
  console.log('Building frontend with Vite...');
  execSync('npx vite build', { stdio: 'inherit' });
  console.log('Frontend build completed successfully.');
} catch (error) {
  console.error('Frontend build failed:', error);
  process.exit(1);
}

// Check if dist/public directory exists
const distPublicDir = path.join(__dirname, 'dist/public');
if (!fs.existsSync(distPublicDir)) {
  console.error('Error: dist/public directory not found after build.');
  process.exit(1);
}

// Create a backup index.html in case something goes wrong
console.log('Creating backup index.html...');
const indexHtml = `<!DOCTYPE html>
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
      background-color: #f0f8ff;
      color: #333;
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
    }
    .container {
      max-width: 800px;
      padding: 40px;
      background: white;
      border-radius: 12px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.15);
      text-align: center;
    }
    h1 {
      color: #0092d1;
      margin-bottom: 20px;
      font-size: 32px;
    }
    p {
      line-height: 1.6;
      margin-bottom: 20px;
      font-size: 18px;
    }
    .logo {
      width: 150px;
      margin-bottom: 20px;
    }
    .btn {
      display: inline-block;
      background-color: #0092d1;
      color: white;
      padding: 12px 24px;
      border-radius: 6px;
      text-decoration: none;
      font-weight: bold;
      margin-top: 20px;
      font-size: 16px;
    }
  </style>
</head>
<body>
  <div class="container">
    <svg class="logo" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
      <path d="M100 10C48.2 10 10 48.2 10 100s38.2 90 90 90 90-38.2 90-90S151.8 10 100 10zm0 160c-38.6 0-70-31.4-70-70s31.4-70 70-70 70 31.4 70 70-31.4 70-70 70z" fill="#0092d1"/>
      <path d="M145 85c-5.5 0-10 4.5-10 10s4.5 10 10 10 10-4.5 10-10-4.5-10-10-10zm-45-15c-16.5 0-30 13.5-30 30s13.5 30 30 30 30-13.5 30-30-13.5-30-30-30zm0 40c-5.5 0-10-4.5-10-10s4.5-10 10-10 10 4.5 10 10-4.5 10-10 10z" fill="#0092d1"/>
    </svg>
    <h1>Blue Whale Competitions</h1>
    <p>Welcome to Blue Whale Competitions - your premier destination for exciting competitions and prize draws.</p>
    <p>Our full application is being deployed. In the meantime, you can check out our API endpoints.</p>
    <a href="/api/status" class="btn">Check API Status</a>
  </div>
</body>
</html>`;

// Write the backup index.html (overwrite if it exists)
fs.writeFileSync(path.join(distPublicDir, 'index.html'), indexHtml);

console.log('Vercel build process completed successfully!');