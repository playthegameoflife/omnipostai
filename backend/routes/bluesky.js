const express = require('express');
const admin = require('../firebase');
const axios = require('axios');
const { generateState, validateState } = require('../utils/oauthState');

const router = express.Router();

// Bluesky uses AT Protocol, not traditional OAuth
// For now, we'll use app password authentication
// Users will need to provide their handle and app password
const BLUESKY_SERVICE_URL = process.env.BLUESKY_SERVICE_URL || 'https://bsky.social';

router.get('/connect', (req, res) => {
  try {
    const idToken = req.query.idToken;
    
    if (!idToken) {
      return res.status(400).json({ error: 'Missing idToken' });
    }
    
    // Generate secure state token
    const stateToken = generateState(idToken);
    
    // Bluesky doesn't use traditional OAuth
    // Redirect to a form where user can enter their handle and app password
    // For now, redirect with state to handle it client-side or show a modal
    res.redirect(`/dashboard?bluesky_connect=${encodeURIComponent(stateToken)}`);
  } catch (error) {
    console.error('Bluesky connect error:', error);
    res.redirect('/dashboard?error=' + encodeURIComponent('Failed to initiate Bluesky connection'));
  }
});

// Alternative endpoint for app password authentication
router.post('/authenticate', async (req, res) => {
  try {
    const { idToken, handle, appPassword } = req.body;
    
    if (!idToken || !handle || !appPassword) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    // Verify idToken
    const decoded = await admin.auth().verifyIdToken(idToken);
    const userId = decoded.uid;
    
    // Authenticate with Bluesky using AT Protocol
    const authResponse = await axios.post(`${BLUESKY_SERVICE_URL}/xrpc/com.atproto.server.createSession`, {
      identifier: handle,
      password: appPassword,
    });
    
    const { accessJwt, refreshJwt, did } = authResponse.data;
    
    if (!accessJwt) {
      return res.status(400).json({ error: 'Failed to authenticate with Bluesky' });
    }
    
    // Save connection
    await admin.firestore().collection('connections').add({
      userId,
      platform: 'Bluesky',
      accessToken: accessJwt,
      refreshToken: refreshJwt,
      blueskyDid: did,
      blueskyHandle: handle,
      expiresAt: Date.now() + (24 * 60 * 60 * 1000), // 24 hours
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    
    res.json({ success: true, message: 'Bluesky connected successfully' });
  } catch (error) {
    console.error('Bluesky authentication error:', error);
    
    let errorMessage = 'Authentication failed';
    if (error.response?.data) {
      errorMessage = error.response.data.message || error.response.data.error || errorMessage;
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    res.status(400).json({ error: errorMessage });
  }
});

// Traditional OAuth callback (for future use if Bluesky adds OAuth)
router.get('/callback', async (req, res) => {
  const { code, state, error } = req.query;
  
  // Handle OAuth errors
  if (error) {
    console.error('Bluesky OAuth callback error:', error);
    const errorMessage = error === 'access_denied' 
      ? 'Connection was denied. Please try again.'
      : `Connection failed: ${error}`;
    return res.redirect('/dashboard?error=' + encodeURIComponent(errorMessage));
  }
  
  // For now, redirect to manual authentication
  res.redirect('/dashboard?error=' + encodeURIComponent('Bluesky requires app password authentication. Please use the manual connection option.'));
});

module.exports = router;

