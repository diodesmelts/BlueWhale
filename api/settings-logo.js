// API endpoint for logo settings
module.exports = (req, res) => {
  // Set CORS headers
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');
  
  // Return the logo URL
  res.status(200).json({
    imageUrl: "https://28ab6440-e7e2-406a-9e7f-a0c71bcc1b4a-00-wylwgw9w3f4s.janeway.replit.dev/blue_whale.svg"
  });
};