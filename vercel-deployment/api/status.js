// API Status Endpoint
export default function handler(req, res) {
  res.status(200).json({
    status: 'ok',
    message: 'Blue Whale Competitions API is running',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
}