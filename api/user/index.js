// API route for user
module.exports = (req, res) => {
  res.status(401).json({ message: 'Not authenticated' });
};