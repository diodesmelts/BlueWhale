// API route for banner
module.exports = (req, res) => {
  const baseUrl = process.env.VERCEL_URL 
    ? `https://${process.env.VERCEL_URL}` 
    : 'https://bluewhale-competition.vercel.app';
    
  res.json({
    imageUrl: `${baseUrl}/assets/banner.jpg`
  });
};