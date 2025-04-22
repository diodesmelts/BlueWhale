// Entry point for Vercel
// This file explicitly states that we're only serving static content

console.log('Serving static content only');

module.exports = (req, res) => {
  // Just a placeholder for Vercel
  res.status(404).send('This is a static site. Please access the HTML files directly.');
};