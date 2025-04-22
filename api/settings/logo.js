// API route for logo
module.exports = (req, res) => {
  const baseUrl = process.env.VERCEL_URL 
    ? `https://${process.env.VERCEL_URL}` 
    : 'https://bluewhale-competition.vercel.app';
    
  res.json({
    imageUrl: `${baseUrl}/assets/blue_whale.svg`
  });
};