// API Competitions Endpoint
export default function handler(req, res) {
  // This is a simplified mock data version
  // In production, you would connect to a database
  const competitions = [
    {
      id: 1,
      title: "Ninja Air Fryer",
      organizer: "Kitchen Gadgets",
      description: "Win the latest Ninja Air Fryer model with digital display and 6 cooking presets.",
      image: "https://images.unsplash.com/photo-1648371477306-42e7c73b3aca?w=800&auto=format&fit=crop",
      platform: "instagram",
      type: "competition",
      category: "appliances",
      prize: 150,
      ticketPrice: 299, // in cents
      eligibility: "worldwide",
      endDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days from now
      drawTime: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days from now
      entries: 528,
      isVerified: true
    },
    {
      id: 2,
      title: "$500 Cash Prize",
      organizer: "Money Makers",
      description: "Win $500 cash deposited directly to your account.",
      image: "https://images.unsplash.com/photo-1621244335300-5cca6a359f22?w=800&auto=format&fit=crop",
      platform: "website",
      type: "competition",
      category: "cash",
      prize: 500,
      ticketPrice: 499, // in cents
      eligibility: "US only",
      endDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString(), // 4 days from now
      drawTime: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days from now
      entries: 1248,
      isVerified: true
    },
    {
      id: 3,
      title: "Family Holiday Package",
      organizer: "Dream Vacations",
      description: "Win a 7-day holiday package for a family of four including flights and accommodation.",
      image: "https://images.unsplash.com/photo-1510414842594-a61c69b5ae57?w=800&auto=format&fit=crop",
      platform: "facebook",
      type: "competition",
      category: "family",
      prize: 2500,
      ticketPrice: 999, // in cents
      eligibility: "worldwide",
      endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
      drawTime: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000).toISOString(), // 8 days from now
      entries: 752,
      isVerified: true
    }
  ];

  res.status(200).json(competitions);
}