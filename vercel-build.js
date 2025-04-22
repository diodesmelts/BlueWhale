// Special Vercel build script
const { execSync } = require('child_process');

// Log build information
console.log('Running Vercel build script...');
console.log('Node version:', process.version);
console.log('Current directory:', process.cwd());

try {
  // Run the build command
  console.log('Building the application...');
  execSync('npm run build', { stdio: 'inherit' });
  
  // Copy index.html to 404.html for SPA routing
  console.log('Copying index.html to 404.html...');
  execSync('cp dist/public/index.html dist/public/404.html');
  
  console.log('Build completed successfully!');
} catch (error) {
  console.error('Build failed:', error);
  process.exit(1);
}