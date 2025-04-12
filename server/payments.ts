import { Express, Request, Response } from "express";
import Stripe from "stripe";
import { storage } from "./storage";

// Initialize Stripe with the secret key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: "2023-10-16", // Use a stable API version
});

export interface PaymentMetadata {
  userId: number;
  competitionId?: number;
  type: "wallet_funding" | "entry_fee" | "premium_upgrade";
  amount: number;
}

export function setupPaymentRoutes(app: Express) {
  // Middleware to ensure the user is authenticated
  const ensureAuthenticated = (req: Request, res: Response, next: Function) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    next();
  };

  // Create a payment intent (for direct credit card payments)
  app.post("/api/payments/create-payment-intent", ensureAuthenticated, async (req, res) => {
    try {
      const { amount, description, metadata } = req.body;
      const userId = req.user!.id;

      // Validate the request
      if (!amount || amount < 100) { // Minimum amount is $1.00 (100 cents)
        return res.status(400).json({ error: "Invalid amount" });
      }

      // Create a payment intent
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount), // amount in cents
        currency: "usd",
        description,
        metadata: {
          ...metadata,
          userId
        },
        payment_method_types: ["card"],
        // Enable this when ready for Apple Pay:
        payment_method_options: {
          card: {
            request_three_d_secure: "automatic"
          }
        }
      });

      // Return the client secret to the client
      res.json({
        clientSecret: paymentIntent.client_secret
      });
    } catch (error: any) {
      console.error("Payment intent creation error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Create a setup intent (for saving cards for future use)
  app.post("/api/payments/create-setup-intent", ensureAuthenticated, async (req, res) => {
    try {
      const userId = req.user!.id;
      
      // Get or create a customer
      let customer;
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      
      if (user.stripeCustomerId) {
        customer = await stripe.customers.retrieve(user.stripeCustomerId);
      } else {
        // Create a new customer
        customer = await stripe.customers.create({
          email: user.email,
          name: user.username,
          metadata: {
            userId: user.id.toString()
          }
        });

        // Update the user with the Stripe customer ID
        await storage.updateUser(userId, {
          stripeCustomerId: customer.id
        });
      }

      // Create a setup intent
      const setupIntent = await stripe.setupIntents.create({
        customer: customer.id,
        payment_method_types: ["card"],
      });

      // Return the client secret to the client
      res.json({
        clientSecret: setupIntent.client_secret
      });
    } catch (error: any) {
      console.error("Setup intent creation error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Get saved payment methods
  app.get("/api/payments/payment-methods", ensureAuthenticated, async (req, res) => {
    try {
      const userId = req.user!.id;
      const user = await storage.getUser(userId);
      
      if (!user || !user.stripeCustomerId) {
        return res.json({ paymentMethods: [] });
      }
      
      // Get the customer's payment methods
      const paymentMethods = await stripe.paymentMethods.list({
        customer: user.stripeCustomerId,
        type: "card",
      });

      // Return the payment methods to the client
      res.json({
        paymentMethods: paymentMethods.data.map(pm => ({
          id: pm.id,
          brand: pm.card?.brand,
          last4: pm.card?.last4,
          expMonth: pm.card?.exp_month,
          expYear: pm.card?.exp_year,
          isDefault: pm.metadata?.isDefault === "true"
        }))
      });
    } catch (error: any) {
      console.error("Payment methods retrieval error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Pay for competition entry
  app.post("/api/payments/pay-for-entry", ensureAuthenticated, async (req, res) => {
    try {
      const { competitionId, paymentMethodId } = req.body;
      const userId = req.user!.id;
      
      // Get the competition
      const competition = await storage.getCompetition(Number(competitionId));
      if (!competition) {
        return res.status(404).json({ error: "Competition not found" });
      }
      
      // Check if the user has already entered this competition
      const existingEntry = await storage.getUserEntry(userId, competition.id);
      if (existingEntry) {
        return res.status(400).json({ error: "Already entered this competition" });
      }
      
      // Get user for Stripe customer ID
      const user = await storage.getUser(userId);
      if (!user || !user.stripeCustomerId) {
        return res.status(400).json({ error: "User is not set up for payments" });
      }

      // Create the payment
      const paymentIntent = await stripe.paymentIntents.create({
        amount: competition.entryFee ? competition.entryFee * 100 : 0, // convert dollars to cents
        currency: "usd",
        customer: user.stripeCustomerId,
        payment_method: paymentMethodId,
        off_session: true,
        confirm: true,
        metadata: {
          userId: userId.toString(),
          competitionId: competition.id.toString(),
          type: "entry_fee"
        },
        description: `Entry fee for ${competition.title}`
      });

      // If payment is successful, create the entry
      if (paymentIntent.status === "succeeded") {
        // Create entry with initial progress
        const entryProgress = Array(competition.entrySteps.length).fill(0);
        await storage.createUserEntry({
          userId,
          competitionId: competition.id,
          entryProgress,
          isBookmarked: false,
          isLiked: false,
          paymentIntentId: paymentIntent.id
        });

        return res.json({ success: true, message: "Payment successful and entry created" });
      } else {
        return res.status(400).json({ error: "Payment failed", status: paymentIntent.status });
      }
    } catch (error: any) {
      console.error("Entry payment error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Upgrade to premium
  app.post("/api/payments/upgrade-to-premium", ensureAuthenticated, async (req, res) => {
    try {
      const { paymentMethodId } = req.body;
      const userId = req.user!.id;
      
      // Get user for Stripe customer ID
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      // Check if already premium
      if (user.isPremium) {
        return res.status(400).json({ error: "User is already premium" });
      }

      // Make sure user has a Stripe customer ID
      if (!user.stripeCustomerId) {
        // Create a new customer
        const customer = await stripe.customers.create({
          email: user.email,
          name: user.username,
          metadata: {
            userId: user.id.toString()
          }
        });

        // Update the user with the Stripe customer ID
        await storage.updateUser(userId, {
          stripeCustomerId: customer.id
        });

        user.stripeCustomerId = customer.id;
      }

      // Create the payment - $9.99 for premium upgrade
      const paymentIntent = await stripe.paymentIntents.create({
        amount: 999, // $9.99 in cents
        currency: "usd",
        customer: user.stripeCustomerId,
        payment_method: paymentMethodId,
        off_session: true,
        confirm: true,
        metadata: {
          userId: userId.toString(),
          type: "premium_upgrade"
        },
        description: "Premium membership upgrade"
      });

      // If payment is successful, update the user to premium
      if (paymentIntent.status === "succeeded") {
        await storage.updateUser(userId, {
          isPremium: true
        });

        return res.json({ success: true, message: "Payment successful and premium status activated" });
      } else {
        return res.status(400).json({ error: "Payment failed", status: paymentIntent.status });
      }
    } catch (error: any) {
      console.error("Premium upgrade error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Fund wallet (add credits to user's wallet)
  app.post("/api/payments/fund-wallet", ensureAuthenticated, async (req, res) => {
    try {
      const { amount, paymentMethodId } = req.body;
      const userId = req.user!.id;

      // Validate the amount
      const amountInCents = Math.round(parseFloat(amount) * 100);
      if (isNaN(amountInCents) || amountInCents < 500) { // Minimum $5.00
        return res.status(400).json({ error: "Invalid amount. Minimum funding amount is $5.00" });
      }
      
      // Get user for Stripe customer ID
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      // Make sure user has a Stripe customer ID
      if (!user.stripeCustomerId) {
        // Create a new customer
        const customer = await stripe.customers.create({
          email: user.email,
          name: user.username,
          metadata: {
            userId: user.id.toString()
          }
        });

        // Update the user with the Stripe customer ID
        await storage.updateUser(userId, {
          stripeCustomerId: customer.id
        });

        user.stripeCustomerId = customer.id;
      }

      // Create the payment
      const paymentIntent = await stripe.paymentIntents.create({
        amount: amountInCents,
        currency: "usd",
        customer: user.stripeCustomerId,
        payment_method: paymentMethodId,
        off_session: true,
        confirm: true,
        metadata: {
          userId: userId.toString(),
          type: "wallet_funding",
          amount: amountInCents.toString()
        },
        description: `Wallet funding ($${(amountInCents / 100).toFixed(2)})`
      });

      // If payment is successful, update the user's wallet balance
      if (paymentIntent.status === "succeeded") {
        // Get user's current wallet balance
        const currentBalance = user.walletBalance || 0;
        const newBalance = currentBalance + (amountInCents / 100); // Convert back to dollars

        await storage.updateUser(userId, {
          walletBalance: newBalance
        });

        return res.json({ 
          success: true, 
          message: "Wallet funded successfully", 
          newBalance
        });
      } else {
        return res.status(400).json({ error: "Payment failed", status: paymentIntent.status });
      }
    } catch (error: any) {
      console.error("Wallet funding error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Webhook to handle payment events from Stripe
  app.post("/api/payments/webhook", async (req, res) => {
    const sig = req.headers["stripe-signature"] as string;
    
    // TODO: Set up webhook secret in production environment
    // const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;
    
    let event;

    try {
      // For now, just parse the JSON since we don't have a webhook secret
      event = req.body;
      // In production, use this to verify the webhook signature:
      // event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
    } catch (err: any) {
      console.error("Webhook signature verification failed:", err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Handle the event
    switch (event.type) {
      case "payment_intent.succeeded":
        const paymentIntent = event.data.object;
        console.log("PaymentIntent succeeded:", paymentIntent.id);
        // Handle successful payment
        break;
        
      case "payment_intent.payment_failed":
        const failedPayment = event.data.object;
        console.log("Payment failed:", failedPayment.id, failedPayment.last_payment_error?.message);
        // Handle failed payment
        break;

      // Add more event handlers as needed
        
      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    res.json({ received: true });
  });
}