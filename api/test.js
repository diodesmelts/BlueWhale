// Advanced test endpoint with HTML response option
const fs = require('fs');
const path = require('path');

module.exports = (req, res) => {
  // Check if the client wants HTML (browser request)
  const wantsHtml = req.headers.accept && req.headers.accept.includes('text/html');
  
  if (wantsHtml) {
    res.setHeader('Content-Type', 'text/html');
    return res.send(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Blue Whale API Test</title>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <style>
            body { font-family: system-ui, sans-serif; line-height: 1.5; padding: 2rem; max-width: 800px; margin: 0 auto; }
            pre { background-color: #f5f5f5; padding: 1rem; border-radius: 0.25rem; overflow-x: auto; }
            .success { color: green; }
            .error { color: red; }
          </style>
        </head>
        <body>
          <h1>Blue Whale API Test</h1>
          <p class="success">✅ API server is working correctly</p>
          
          <h2>Environment Information</h2>
          <pre>${JSON.stringify({
            status: 'ok',
            message: 'Vercel API is working correctly',
            timestamp: new Date().toISOString(),
            environment: process.env.VERCEL_ENV || 'development',
            node_version: process.version,
            vercel_url: process.env.VERCEL_URL || 'Not deployed on Vercel'
          }, null, 2)}</pre>
          
          <h2>Static Files Check</h2>
          <div id="static-status">
            Checking static files...
          </div>
          
          <script>
            // Check if we can load the main application
            fetch('/')
              .then(response => {
                if (response.ok) {
                  return response.text().then(text => {
                    if (text.includes('<div id="root"></div>')) {
                      document.getElementById('static-status').innerHTML = 
                        '<p class="success">✅ Static files appear to be accessible</p>' +
                        '<p>Found main application index.html file</p>';
                    } else {
                      document.getElementById('static-status').innerHTML = 
                        '<p class="error">❌ Main application file found but may not be the React app</p>';
                    }
                  });
                } else {
                  document.getElementById('static-status').innerHTML = 
                    '<p class="error">❌ Could not access main application files</p>' +
                    '<p>Status: ' + response.status + '</p>';
                }
              })
              .catch(error => {
                document.getElementById('static-status').innerHTML = 
                  '<p class="error">❌ Error checking static files: ' + error.message + '</p>';
              });
          </script>
        </body>
      </html>
    `);
  }
  
  // Default JSON response
  res.json({
    status: 'ok',
    message: 'Vercel API is working correctly',
    timestamp: new Date().toISOString(),
    environment: process.env.VERCEL_ENV || 'development',
    node_version: process.version,
    vercel_url: process.env.VERCEL_URL || 'Not deployed on Vercel'
  });
};