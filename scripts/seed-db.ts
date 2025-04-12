import { db, pool } from '../server/db';
import { users, competitions, leaderboard } from '../shared/schema';
import { scrypt, randomBytes } from 'crypto';
import { promisify } from 'util';

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

async function seedDatabase() {
  console.log('Starting database seeding...');
  
  try {
    // Check if users already exist
    const existingUsers = await db.select().from(users);
    
    if (existingUsers.length > 0) {
      console.log('Database already has users, skipping seeding.');
      return;
    }
    
    // Create demo user
    const demoUser = await db.insert(users).values({
      username: 'SDK',
      email: 'user@example.com',
      password: await hashPassword('password123'),
      isPremium: false,
      isAdmin: false,
      walletBalance: 5000, // $50 in cents
    }).returning();
    
    console.log('Created demo user:', demoUser[0].username);
    
    // Create admin user
    const adminUser = await db.insert(users).values({
      username: 'admin',
      email: 'admin@example.com',
      password: await hashPassword('admin123'),
      isPremium: true,
      isAdmin: true,
      walletBalance: 10000, // $100 in cents
    }).returning();
    
    console.log('Created admin user:', adminUser[0].username);
    
    // Create a sample competition
    const sampleCompetition = await db.insert(competitions).values({
      title: 'Instagram Photo Contest',
      organizer: 'CompetePro',
      description: 'Share your best travel photo for a chance to win a £1000 travel voucher! Tag us and use #TravelWithCP to enter.',
      image: '/uploads/demo-competition.jpg',
      platform: 'instagram',
      type: 'photo',
      prize: 1000,
      ticketPrice: 500, // £5 in cents
      maxTicketsPerUser: 10,
      totalTickets: 1000,
      soldTickets: 50,
      entries: 50,
      eligibility: 'worldwide',
      endDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30), // 30 days from now
      entrySteps: [
        { id: 1, description: 'Follow @CompetePro', link: 'https://instagram.com/competepro' },
        { id: 2, description: 'Like our latest post', link: 'https://instagram.com/p/123456' },
        { id: 3, description: 'Tag 3 friends in the comments' },
        { id: 4, description: 'Share this post to your story' }
      ],
      isVerified: true,
      isDeleted: false
    }).returning();
    
    console.log('Created sample competition:', sampleCompetition[0].title);
    
    // Create leaderboard entries
    await db.insert(leaderboard).values({
      userId: demoUser[0].id,
      rank: 1,
      entries: 10,
      wins: 2,
      winRate: 200, // 20.0%
      streak: 1
    });
    
    await db.insert(leaderboard).values({
      userId: adminUser[0].id,
      rank: 2,
      entries: 8,
      wins: 1,
      winRate: 125, // 12.5%
      streak: 0
    });
    
    console.log('Created leaderboard entries');
    
    console.log('Database seeding completed successfully!');
  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    // Close the database connection
    await pool.end();
  }
}

// Run the seed function
seedDatabase();