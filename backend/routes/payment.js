const express = require('express');
const admin = require('../firebase');
const authenticateToken = require('../middleware/auth');
const axios = require('axios');

const router = express.Router();
const db = admin.firestore();

// Stripe configuration (would use stripe npm package in production)
const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;
const STRIPE_PUBLISHABLE_KEY = process.env.STRIPE_PUBLISHABLE_KEY;

// Get publishable key for frontend
router.get('/config', (req, res) => {
  res.json({
    publishableKey: STRIPE_PUBLISHABLE_KEY || 'pk_test_placeholder'
  });
});

// Create a checkout session
router.post('/create-checkout-session', authenticateToken, async (req, res) => {
  try {
    const { planId, priceId } = req.body;
    
    if (!planId || !priceId) {
      return res.status(400).json({ error: 'Plan ID and Price ID are required' });
    }

    const userId = req.user.uid;
    
    // In production, use Stripe SDK:
    // const stripe = require('stripe')(STRIPE_SECRET_KEY);
    // const session = await stripe.checkout.sessions.create({...});
    
    // For now, create a placeholder session
    // In production, this would create an actual Stripe checkout session
    const sessionId = `session_${Date.now()}_${userId}`;
    
    // Store session in database
    await db.collection('payment_sessions').add({
      userId,
      sessionId,
      planId,
      priceId,
      status: 'pending',
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });
    
    // In production, return Stripe checkout URL
    res.json({
      sessionId,
      url: `/checkout?session_id=${sessionId}` // Placeholder URL
    });
  } catch (error) {
    console.error('Payment session creation error:', error);
    res.status(500).json({ error: 'Failed to create checkout session' });
  }
});

// Handle Stripe webhook (for production)
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  try {
    // In production, verify webhook signature
    // const stripe = require('stripe')(STRIPE_SECRET_KEY);
    // const sig = req.headers['stripe-signature'];
    // const event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
    
    const event = req.body;
    
    // Handle different event types
    switch (event.type) {
      case 'checkout.session.completed':
        const session = event.data.object;
        // Update user subscription in database
        await updateUserSubscription(session);
        break;
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted':
        const subscription = event.data.object;
        await updateUserSubscriptionStatus(subscription);
        break;
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }
    
    res.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(400).json({ error: 'Webhook handler failed' });
  }
});

// Get user subscription
router.get('/subscription', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.uid;
    
    // Get user's subscription from database
    const userDoc = await db.collection('users').doc(userId).get();
    const userData = userDoc.data();
    
    res.json({
      plan: userData?.subscription?.plan || 'free',
      status: userData?.subscription?.status || 'active',
      expiresAt: userData?.subscription?.expiresAt || null
    });
  } catch (error) {
    console.error('Get subscription error:', error);
    res.status(500).json({ error: 'Failed to get subscription' });
  }
});

// Cancel subscription
router.post('/cancel-subscription', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.uid;
    
    // In production, cancel via Stripe API
    // const stripe = require('stripe')(STRIPE_SECRET_KEY);
    // await stripe.subscriptions.cancel(subscriptionId);
    
    // Update user subscription in database
    await db.collection('users').doc(userId).update({
      'subscription.status': 'cancelled',
      'subscription.cancelledAt': admin.firestore.FieldValue.serverTimestamp()
    });
    
    res.json({ message: 'Subscription cancelled successfully' });
  } catch (error) {
    console.error('Cancel subscription error:', error);
    res.status(500).json({ error: 'Failed to cancel subscription' });
  }
});

// Helper functions
async function updateUserSubscription(session) {
  const userId = session.metadata?.userId;
  if (!userId) return;
  
  const planId = session.metadata?.planId || 'free';
  const plan = getPlanDetails(planId);
  
  await db.collection('users').doc(userId).update({
    subscription: {
      plan: planId,
      status: 'active',
      startsAt: admin.firestore.FieldValue.serverTimestamp(),
      expiresAt: null, // Would calculate based on plan
      stripeCustomerId: session.customer,
      stripeSubscriptionId: session.subscription
    }
  });
}

async function updateUserSubscriptionStatus(subscription) {
  const userId = subscription.metadata?.userId;
  if (!userId) return;
  
  await db.collection('users').doc(userId).update({
    'subscription.status': subscription.status,
    'subscription.updatedAt': admin.firestore.FieldValue.serverTimestamp()
  });
}

function getPlanDetails(planId) {
  const plans = {
    free: { name: 'Free', price: 0 },
    pro: { name: 'Pro', price: 29 },
    enterprise: { name: 'Enterprise', price: 0 }
  };
  return plans[planId] || plans.free;
}

module.exports = router;


