// API endpoint for settings
module.exports = (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');
  
  res.status(200).json({
    appName: "Blue Whale Competitions",
    theme: "blue",
    logoUrl: "https://raw.githubusercontent.com/diodesmelts/BlueWhale/main/public/assets/blue_whale.svg",
    bannerUrl: "https://raw.githubusercontent.com/diodesmelts/BlueWhale/main/public/assets/banner.jpg",
    contactEmail: "hello@bluewwhalecompetitions.com"
  });
};