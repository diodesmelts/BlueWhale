// API endpoint for competitions
module.exports = (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');
  
  const competitions = [
    {
      id: 1,
      title: "Ninja Air Fryer",
      organizerName: "Blue Whale Competitions",
      description: "Win this amazing Air Fryer for your kitchen!",
      image: "https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec",
      ticketPrice: 4.99,
      endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      category: "Appliances",
      totalTickets: 1000,
      soldTickets: 389
    },
    {
      id: 2,
      title: "£500 Cash Prize",
      organizerName: "Blue Whale Competitions",
      description: "Win £500 cash directly to your bank account!",
      image: "https://images.unsplash.com/photo-1579621970563-ebec7560ff3e",
      ticketPrice: 2.99,
      endDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
      category: "Cash",
      totalTickets: 2000,
      soldTickets: 1458
    }
  ];
  
  res.status(200).json(competitions);
};