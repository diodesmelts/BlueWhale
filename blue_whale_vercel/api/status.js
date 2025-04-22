module.exports = (req, res) => {
  res.status(200).json({
    status: "online",
    version: "1.0.0",
    message: "Blue Whale API is running",
    timestamp: new Date().toISOString()
  });
}