import express, { type Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import { insertCompetitionSchema } from "@shared/schema";
import { setupAuth } from "./auth";
import { setupPaymentRoutes } from "./payments";
import multer from "multer";
import path from "path";
import fs from "fs";
import { v4 as uuidv4 } from "uuid";
import sharp from "sharp";

export async function registerRoutes(app: Express): Promise<Server> {
  // Set up authentication
  const { isAuthenticated, isAdmin } = setupAuth(app);
  
  // Set up payment routes
  setupPaymentRoutes(app);
  
  // Special development route to make SDK an admin user (would be removed in production)
  app.get("/api/dev/make-sdk-admin", async (req, res) => {
    try {
      // Find SDK user
      const sdkUser = await storage.getUserByUsername("SDK");
      
      if (!sdkUser) {
        return res.status(404).json({ message: "SDK user not found" });
      }
      
      // Update SDK to be an admin
      const updatedUser = await storage.updateUser(sdkUser.id, { 
        isAdmin: true,
        isPremium: true
      });
      
      res.status(200).json({ 
        message: "SDK user is now an admin",
        user: {
          id: updatedUser.id,
          username: updatedUser.username,
          email: updatedUser.email,
          isAdmin: updatedUser.isAdmin,
          isPremium: updatedUser.isPremium
        }
      });
    } catch (error) {
      console.error("Failed to make SDK admin:", error);
      res.status(500).json({ message: "Failed to update user permissions" });
    }
  });
  
  // API routes
  
  // Admin routes
  app.get("/api/admin/check", isAdmin, (req, res) => {
    res.status(200).json({ isAdmin: true });
  });
  
  // User management routes (admin only)
  app.get("/api/admin/users", isAdmin, async (req, res) => {
    try {
      const users = await storage.listUsers();
      res.status(200).json(users);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });
  
  // Update user permissions
  app.patch("/api/admin/users/:id", isAdmin, async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const updateSchema = z.object({
        isPremium: z.boolean().optional(),
        isAdmin: z.boolean().optional()
      });

      const validatedData = updateSchema.parse(req.body);
      const updatedUser = await storage.updateUser(userId, validatedData);
      res.status(200).json(updatedUser);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid update data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to update user" });
      }
    }
  });
  
  app.post("/api/admin/competitions", isAdmin, async (req, res) => {
    try {
      const validatedData = insertCompetitionSchema.parse(req.body);
      const competition = await storage.createCompetition(validatedData);
      res.status(201).json(competition);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Validation error", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create competition" });
      }
    }
  });
  
  // Get a specific competition (admin only)
  app.get("/api/admin/competitions/:id", isAdmin, async (req, res) => {
    try {
      const competitionId = parseInt(req.params.id);
      const competition = await storage.getCompetition(competitionId);
      
      if (!competition) {
        return res.status(404).json({ message: "Competition not found" });
      }
      
      res.status(200).json(competition);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch competition" });
    }
  });
  
  // Update a competition (admin only)
  app.put("/api/admin/competitions/:id", isAdmin, async (req, res) => {
    try {
      const competitionId = parseInt(req.params.id);
      
      // Custom update schema with specific handling for endDate and drawTime
      const updateSchema = z.object({
        title: z.string().optional(),
        organizer: z.string().optional(),
        description: z.string().optional(),
        image: z.string().optional(),
        platform: z.string().optional(),
        type: z.string().optional(),
        category: z.string().optional(),
        prize: z.number().optional(),
        ticketPrice: z.number().optional(),
        maxTicketsPerUser: z.number().optional(),
        totalTickets: z.number().optional(),
        soldTickets: z.number().optional(),
        entries: z.number().optional(),
        eligibility: z.string().optional(),
        // Accept string for date and convert to Date object
        endDate: z.string()
          .transform(dateStr => {
            // Create a Date object from the string
            const date = new Date(dateStr);
            if (isNaN(date.getTime())) {
              throw new Error("Invalid date format");
            }
            return date;
          })
          .optional(),
        // drawTime field is required for competition draw countdown
        drawTime: z.string()
          .transform(dateStr => {
            const date = new Date(dateStr);
            if (isNaN(date.getTime())) {
              throw new Error("Invalid date format");
            }
            return date;
          }),
        entrySteps: z.array(
          z.object({
            id: z.number(),
            description: z.string(),
            link: z.string().optional()
          })
        ).optional(),
        isVerified: z.boolean().optional(),
        isDeleted: z.boolean().optional(),
      });
      
      console.log('Request body:', req.body);
      const validatedData = updateSchema.parse(req.body);
      console.log('Validated data:', validatedData);
      
      const competition = await storage.updateCompetition(competitionId, validatedData);
      
      if (!competition) {
        return res.status(404).json({ message: "Competition not found" });
      }
      
      res.status(200).json(competition);
    } catch (error) {
      console.error('Competition update error:', error);
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Validation error", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to update competition", error: error.message });
      }
    }
  });
  
  // Get all competitions (admin only)
  app.get("/api/admin/competitions", isAdmin, async (req, res) => {
    try {
      // Include deleted competitions for admin view
      const competitions = await storage.listCompetitions(undefined, undefined, undefined, true);
      res.status(200).json(competitions);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch competitions" });
    }
  });
  
  // Delete a competition (admin only)
  app.delete("/api/admin/competitions/:id", isAdmin, async (req, res) => {
    try {
      const competitionId = parseInt(req.params.id);
      const deleted = await storage.deleteCompetition(competitionId);
      
      if (!deleted) {
        return res.status(404).json({ message: "Competition not found" });
      }
      
      res.status(200).json({ message: "Competition deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete competition" });
    }
  });
  
  // Get user stats
  app.get("/api/user/stats", async (req, res) => {
    try {
      // Normally we'd get the user ID from the session
      // For demo purposes, we'll use user ID 1
      const userId = 1;
      const stats = await storage.getUserStats(userId);
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch user stats" });
    }
  });
  
  // Get competitions
  app.get("/api/competitions", async (req, res) => {
    try {
      const platform = req.query.platform as string;
      const type = req.query.type as string;
      const sortBy = req.query.sortBy as string;
      const tab = req.query.tab as string;
      
      // Get user ID from session if authenticated, otherwise use 1 for demo
      const userId = req.isAuthenticated() ? req.user!.id : 1;
      
      const competitions = await storage.getCompetitionsWithUserStatus(
        userId,
        { platform, type },
        sortBy,
        tab
      );
      
      res.json(competitions);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch competitions" });
    }
  });
  
  // Get competitions by category
  app.get("/api/competitions/category/:category", async (req, res) => {
    try {
      const category = req.params.category;
      const sortBy = req.query.sortBy as string;
      
      // Validate category
      if (!['family', 'appliances', 'cash', 'other'].includes(category)) {
        return res.status(400).json({ message: "Invalid category" });
      }
      
      // Get user ID from session if authenticated, otherwise use 1 for demo
      const userId = req.isAuthenticated() ? req.user!.id : 1;
      
      // Use the existing getCompetitionsWithUserStatus method but filter by category
      const competitions = await storage.getCompetitionsWithUserStatus(
        userId,
        { category },
        sortBy
      );
      
      res.json(competitions);
    } catch (error) {
      console.error("Failed to fetch category competitions:", error);
      res.status(500).json({ message: "Failed to fetch category competitions" });
    }
  });
  
  // Get a single competition by ID
  app.get("/api/competitions/:id", async (req, res) => {
    try {
      const competitionId = parseInt(req.params.id);
      if (isNaN(competitionId)) {
        return res.status(400).json({ message: "Invalid competition ID" });
      }
      
      // Get user ID from session if authenticated, otherwise use 1 for demo
      const userId = req.isAuthenticated() ? req.user!.id : 1;
      
      // Get the competition
      const competition = await storage.getCompetition(competitionId);
      
      if (!competition) {
        return res.status(404).json({ message: "Competition not found" });
      }
      
      // Get user-specific status for this competition
      const userEntry = await storage.getUserEntry(userId, competitionId);
      const userWin = await storage.getUserWins(userId).then(wins => 
        wins.find(win => win.competitionId === competitionId)
      );
      
      // Combine competition data with user-specific status
      const competitionWithStatus = {
        ...competition,
        isEntered: !!userEntry,
        entryProgress: userEntry ? userEntry.entryProgress : [],
        isBookmarked: userEntry ? userEntry.isBookmarked : false,
        isLiked: userEntry ? userEntry.isLiked : false,
        ticketCount: userEntry ? userEntry.ticketCount : 0,
        ticketNumbers: userEntry ? userEntry.ticketNumbers : [],
        
        // Win information if applicable
        winDate: userWin ? userWin.createdAt.toISOString() : undefined,
        claimByDate: userWin ? userWin.claimByDate?.toISOString() : undefined,
        prizeReceived: userWin ? userWin.prizeReceived : undefined,
        receivedDate: userWin ? userWin.receivedDate?.toISOString() : undefined,
      };
      
      res.json(competitionWithStatus);
    } catch (error) {
      console.error("Error fetching competition:", error);
      res.status(500).json({ message: "Failed to fetch competition details" });
    }
  });
  
  // Get user entries
  app.get("/api/user/entries", async (req, res) => {
    try {
      // For demo purposes, we'll use user ID 1
      const userId = 1;
      
      const entries = await storage.getCompetitionsWithUserStatus(userId, undefined, undefined, "my-entries");
      res.json(entries);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch user entries" });
    }
  });
  
  // Get user wins
  app.get("/api/user/wins", async (req, res) => {
    try {
      // For demo purposes, we'll use user ID 1
      const userId = 1;
      
      const wins = await storage.getUserWins(userId);
      
      // Enrich with competition data
      const enrichedWins = await Promise.all(
        wins.map(async (win) => {
          const competition = await storage.getCompetition(win.competitionId);
          if (!competition) return null;
          
          return {
            id: win.id,
            title: competition.title,
            organizer: competition.organizer,
            description: competition.description,
            image: competition.image,
            platform: competition.platform,
            type: competition.type,
            prize: competition.prize,
            entries: competition.entries,
            eligibility: competition.eligibility,
            endDate: competition.endDate.toISOString(),
            drawTime: competition.drawTime.toISOString(),
            entrySteps: competition.entrySteps,
            isVerified: competition.isVerified,
            createdAt: competition.createdAt ? competition.createdAt.toISOString() : new Date().toISOString(),
            isEntered: true,
            entryProgress: Array(competition.entrySteps.length).fill(1), // All completed since won
            isBookmarked: true,
            isLiked: false,
            winDate: win.winDate ? win.winDate.toISOString() : new Date().toISOString(),
            claimByDate: win.claimByDate.toISOString(),
            prizeReceived: win.prizeReceived,
            receivedDate: win.receivedDate?.toISOString()
          };
        })
      );
      
      // Filter out nulls
      const validWins = enrichedWins.filter(Boolean);
      
      res.json(validWins);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch user wins" });
    }
  });
  
  // Get leaderboard
  app.get("/api/leaderboard", async (req, res) => {
    try {
      const leaderboard = await storage.getLeaderboard();
      res.json(leaderboard);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch leaderboard" });
    }
  });
  
  // Enter competition or purchase tickets
  app.post("/api/competitions/:id/enter", async (req, res) => {
    try {
      const competitionId = parseInt(req.params.id);
      const userId = req.isAuthenticated() ? req.user!.id : 1; // Use authenticated user if available
      const ticketCount = req.body.ticketCount ? parseInt(req.body.ticketCount) : 1;
      
      // Check if competition exists
      const competition = await storage.getCompetition(competitionId);
      if (!competition) {
        return res.status(404).json({ message: "Competition not found" });
      }
      
      // Check for available tickets if this is a ticket-based competition
      if (competition.ticketPrice && competition.ticketPrice > 0) {
        // Check if competition has available tickets
        if (competition.soldTickets && competition.totalTickets && 
            competition.soldTickets >= competition.totalTickets) {
          return res.status(400).json({ message: "Competition is sold out" });
        }
        
        // Check if user is trying to buy more than allowed
        if (competition.maxTicketsPerUser && ticketCount > competition.maxTicketsPerUser) {
          return res.status(400).json({ 
            message: `You can only purchase up to ${competition.maxTicketsPerUser} tickets`
          });
        }
        
        // Check available tickets
        if (competition.totalTickets && competition.soldTickets) {
          const remainingTickets = competition.totalTickets - competition.soldTickets;
          if (ticketCount > remainingTickets) {
            return res.status(400).json({ 
              message: `Only ${remainingTickets} tickets remaining`
            });
          }
        }
      }
      
      // Check if already entered
      const existingEntry = await storage.getUserEntry(userId, competitionId);
      
      if (existingEntry) {
        // If this is a ticket purchase (not just a regular entry), redirect to payment route
        if (competition.ticketPrice && competition.ticketPrice > 0 && ticketCount > 0) {
          // Return existing entry for now - payment happens in separate endpoint
          return res.status(200).json({
            ...existingEntry,
            message: "Continue to payment to purchase additional tickets"
          });
        }
        
        return res.status(400).json({ message: "Already entered this competition" });
      }
      
      // For free entries or initial entry before payment
      const entryProgress = Array(competition.entrySteps.length).fill(0);
      
      // If this is a paid ticket entry, only create a placeholder entry
      // The actual ticket counts will be updated after payment
      const entry = await storage.createUserEntry({
        userId,
        competitionId,
        entryProgress,
        isBookmarked: false,
        isLiked: false,
        ticketCount: competition.ticketPrice && competition.ticketPrice > 0 ? 0 : ticketCount,
        ticketNumbers: [],
        paymentStatus: competition.ticketPrice && competition.ticketPrice > 0 ? "pending" : "none",
        totalPaid: 0
      });
      
      // Update competition entries count if this is a free entry
      if (!competition.ticketPrice || competition.ticketPrice === 0) {
        await storage.updateCompetition(competitionId, {
          entries: (competition.entries || 0) + 1,
          soldTickets: (competition.soldTickets || 0) + ticketCount
        });
        
        // For free entries, generate ticket numbers
        if (ticketCount > 0) {
          const startTicketNumber = (competition.soldTickets || 0) - ticketCount + 1;
          const ticketNumbers = Array.from(
            { length: ticketCount }, 
            (_, i) => startTicketNumber + i
          );
          
          await storage.updateUserEntry(entry.id, {
            ticketNumbers
          });
          
          entry.ticketNumbers = ticketNumbers;
        }
      }
      
      res.status(201).json(entry);
    } catch (error) {
      console.error("Failed to enter competition:", error);
      res.status(500).json({ message: "Failed to enter competition" });
    }
  });
  
  // Direct ticket purchase for users who have already entered
  app.post("/api/competitions/:id/purchase-tickets", async (req, res) => {
    try {
      const competitionId = parseInt(req.params.id);
      const userId = req.isAuthenticated() ? req.user!.id : 1; // Use authenticated user if available
      const ticketCount = req.body.ticketCount ? parseInt(req.body.ticketCount) : 1;
      
      // Check if competition exists
      const competition = await storage.getCompetition(competitionId);
      if (!competition) {
        return res.status(404).json({ message: "Competition not found" });
      }
      
      // Check if user has already entered
      const existingEntry = await storage.getUserEntry(userId, competitionId);
      if (!existingEntry) {
        return res.status(400).json({ message: "You must enter this competition first" });
      }
      
      // Check for available tickets if this is a ticket-based competition
      if (competition.ticketPrice && competition.ticketPrice > 0) {
        // Check if competition has available tickets
        if (competition.soldTickets && competition.totalTickets && 
            competition.soldTickets >= competition.totalTickets) {
          return res.status(400).json({ message: "Competition is sold out" });
        }
        
        // Calculate total tickets including the new purchase
        const userTotal = (existingEntry.ticketCount || 0) + ticketCount;
        
        // Check if user is trying to buy more than allowed
        if (competition.maxTicketsPerUser && userTotal > competition.maxTicketsPerUser) {
          return res.status(400).json({ 
            message: `You can only purchase up to ${competition.maxTicketsPerUser} tickets total`
          });
        }
        
        // Check available tickets
        if (competition.totalTickets && competition.soldTickets) {
          const remainingTickets = competition.totalTickets - competition.soldTickets;
          if (ticketCount > remainingTickets) {
            return res.status(400).json({ 
              message: `Only ${remainingTickets} tickets remaining`
            });
          }
        }
      }
      
      // Generate ticket numbers
      const startNumber = competition.soldTickets || 0;
      const ticketNumbers: number[] = [];
      for (let i = 0; i < ticketCount; i++) {
        ticketNumbers.push(startNumber + i + 1);
      }
      
      // Update user entry with new tickets
      const updatedEntry = await storage.updateUserEntry(existingEntry.id, {
        ticketCount: (existingEntry.ticketCount || 0) + ticketCount,
        ticketNumbers: [...(existingEntry.ticketNumbers || []), ...ticketNumbers],
        paymentStatus: "completed",
        totalPaid: (existingEntry.totalPaid || 0) + (ticketCount * (competition.ticketPrice || 0))
      });
      
      // Update competition soldTickets count
      await storage.updateCompetition(competitionId, {
        soldTickets: (competition.soldTickets || 0) + ticketCount
      });
      
      res.status(200).json({
        ...updatedEntry,
        message: "Tickets purchased successfully"
      });
    } catch (error) {
      console.error("Error purchasing tickets:", error);
      res.status(500).json({ message: "Failed to purchase tickets" });
    }
  });
  
  // Bookmark competition
  app.post("/api/competitions/:id/bookmark", async (req, res) => {
    try {
      const competitionId = parseInt(req.params.id);
      const userId = 1; // For demo purposes
      
      // Check if competition exists
      const competition = await storage.getCompetition(competitionId);
      if (!competition) {
        return res.status(404).json({ message: "Competition not found" });
      }
      
      // Get or create entry
      let entry = await storage.getUserEntry(userId, competitionId);
      
      if (entry) {
        // Toggle bookmark status
        entry = await storage.updateUserEntry(entry.id, {
          isBookmarked: !entry.isBookmarked
        });
      } else {
        // Create new entry with bookmark
        const entryProgress = Array(competition.entrySteps.length).fill(0);
        entry = await storage.createUserEntry({
          userId,
          competitionId,
          entryProgress,
          isBookmarked: true,
          isLiked: false
        });
      }
      
      res.json({ isBookmarked: entry.isBookmarked });
    } catch (error) {
      res.status(500).json({ message: "Failed to bookmark competition" });
    }
  });
  
  // Like competition
  app.post("/api/competitions/:id/like", async (req, res) => {
    try {
      const competitionId = parseInt(req.params.id);
      const userId = 1; // For demo purposes
      
      // Check if competition exists
      const competition = await storage.getCompetition(competitionId);
      if (!competition) {
        return res.status(404).json({ message: "Competition not found" });
      }
      
      // Get or create entry
      let entry = await storage.getUserEntry(userId, competitionId);
      
      if (entry) {
        // Toggle like status
        entry = await storage.updateUserEntry(entry.id, {
          isLiked: !entry.isLiked
        });
      } else {
        // Create new entry with like
        const entryProgress = Array(competition.entrySteps.length).fill(0);
        entry = await storage.createUserEntry({
          userId,
          competitionId,
          entryProgress,
          isBookmarked: false,
          isLiked: true
        });
      }
      
      res.json({ isLiked: entry.isLiked });
    } catch (error) {
      res.status(500).json({ message: "Failed to like competition" });
    }
  });
  
  // Complete entry steps
  app.post("/api/competitions/:id/complete-entry", async (req, res) => {
    try {
      const competitionId = parseInt(req.params.id);
      const userId = 1; // For demo purposes
      
      // Get entry
      const entry = await storage.getUserEntry(userId, competitionId);
      if (!entry) {
        return res.status(404).json({ message: "Entry not found" });
      }
      
      // Get competition
      const competition = await storage.getCompetition(competitionId);
      if (!competition) {
        return res.status(404).json({ message: "Competition not found" });
      }
      
      // Update progress - mark all steps as complete at once
      const entryProgress = entry.entryProgress.map(() => 1);
      
      // Update entry
      const updatedEntry = await storage.updateUserEntry(entry.id, {
        entryProgress
      });
      
      res.json({ 
        entryProgress: updatedEntry.entryProgress,
        completed: updatedEntry.entryProgress.every(step => step === 1)
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to update entry progress" });
    }
  });

  // (We already defined admin routes above)

  // Set up file upload configuration
  const uploadsDir = path.join(process.cwd(), 'public/uploads');
  
  // Ensure uploads directory exists
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }
  
  // Serve files from the uploads directory
  app.use('/uploads', express.static(uploadsDir));
  
  // Configure multer for file uploads
  const multerStorage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, uploadsDir);
    },
    filename: (req, file, cb) => {
      // Generate unique filename with original extension
      const uniqueName = `${uuidv4()}${path.extname(file.originalname)}`;
      cb(null, uniqueName);
    }
  });
  
  // Create multer upload instance
  const upload = multer({
    storage: multerStorage,
    limits: {
      fileSize: 5 * 1024 * 1024, // 5MB limit
    },
    fileFilter: (req, file, cb) => {
      // Only allow image files
      if (!file.mimetype.startsWith('image/')) {
        return cb(new Error('Only image files are allowed'));
      }
      cb(null, true);
    }
  });
  
  // Image upload endpoint with Sharp image processing
  app.post('/api/upload-image', isAdmin, upload.single('file'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' });
      }
      
      const inputPath = req.file.path;
      const outputPath = inputPath; // Overwrite the original file
      
      // Process image - resize to 700x700 square
      try {
        await sharp(inputPath)
          .resize({
            width: 700,
            height: 700,
            fit: sharp.fit.cover, // This crops the image to make it square
            position: sharp.strategy.attention // Focus on the most interesting part
          })
          .toFile(outputPath + '.processed');
          
        // Replace the original file with the processed one
        fs.unlinkSync(inputPath);
        fs.renameSync(outputPath + '.processed', outputPath);
        
        console.log(`Image processed successfully: ${req.file.filename}`);
      } catch (processError) {
        console.error('Image processing error:', processError);
        // If processing fails, we still return the original image
      }
      
      // Construct the URL to the uploaded file
      const baseUrl = `${req.protocol}://${req.get('host')}`;
      const imageUrl = `${baseUrl}/uploads/${req.file.filename}`;
      
      res.status(200).json({ 
        message: 'File uploaded successfully',
        url: imageUrl,
        filename: req.file.filename
      });
    } catch (error) {
      console.error('File upload error:', error);
      res.status(500).json({ 
        message: 'Failed to upload file',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
