const express = require('express');
const admin = require('../firebase');
const axios = require('axios');

const router = express.Router();

// TODO: Add your X/Twitter client ID and secret to .env
const X_CLIENT_ID = process.env.X_CLIENT_ID;
const X_CLIENT_SECRET = process.env.X_CLIENT_SECRET;
const X_REDIRECT_URI = process.env.X_REDIRECT_URI; // e.g., http://localhost:5001/api/auth/x/callback

// Step 1: Redirect user to X/Twitter authorization URL
router.get('/connect', (req, res) => {
  // Forward idToken as state for callback
  const idToken = req.query.idToken;
  const state = encodeURIComponent(idToken || '');
  const url = `https://twitter.com/i/oauth2/authorize?response_type=code&client_id=${X_CLIENT_ID}&redirect_uri=${encodeURIComponent(X_REDIRECT_URI)}&scope=tweet.read%20tweet.write%20users.read%20offline.access&state=${state}&code_challenge=challenge&code_challenge_method=plain`;
  res.redirect(url);
});

// Step 2: Handle callback from X/Twitter
router.get('/callback', async (req, res) => {
  const { code, state } = req.query;
  // Use state as idToken
  const idToken = state;
  // TODO: Validate state
  try {
    // Exchange code for access token
    const response = await axios.post('https://api.twitter.com/2/oauth2/token', null, {
      params: {
        code,
        grant_type: 'authorization_code',
        client_id: X_CLIENT_ID,
        redirect_uri: X_REDIRECT_URI,
        code_verifier: 'challenge', // TODO: use real PKCE
      },
      auth: {
        username: X_CLIENT_ID,
        password: X_CLIENT_SECRET,
      },
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });
    const { access_token, refresh_token, expires_in } = response.data;
    // Get idToken from frontend (as query param or cookie)
    // const idToken = req.query.idToken; // This line is now redundant as idToken is passed in state
    if (!idToken) return res.status(400).json({ error: 'Missing idToken' });
    // Verify idToken and get user
    const decoded = await admin.auth().verifyIdToken(idToken);
    const userId = decoded.uid;
    // Save to Firestore connections
    await admin.firestore().collection('connections').add({
      userId,
      platform: 'X',
      accessToken: access_token,
      refreshToken: refresh_token,
      expiresAt: Date.now() + expires_in * 1000,
    });
    // Redirect to dashboard with success
    res.redirect('/dashboard?connected=X');
  } catch (error) {
    res.status(400).json({ error: error.message, details: error.response?.data });
  }
});

module.exports = router; 