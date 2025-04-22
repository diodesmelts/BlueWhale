// API Settings Endpoint
export default function handler(req, res) {
  const settings = {
    siteName: "Blue Whale Competitions",
    description: "Your premier competition tracking platform",
    logoUrl: "https://i.imgur.com/h5RXhX7.png", 
    bannerUrl: "https://i.imgur.com/DKcRHqj.jpeg",
    primaryColor: "#0092d1",
    secondaryColor: "#006590",
    accentColor: "#e0f4ff",
    features: {
      registration: true,
      payments: true,
      notifications: true,
      social: true
    },
    version: "1.0.0"
  };

  res.status(200).json(settings);
}