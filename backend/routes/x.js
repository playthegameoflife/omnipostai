const express = require('express');
const admin = require('../firebase');
const axios = require('axios');
const { generateCodeVerifier, generateCodeChallenge } = require('../utils/pkce');
const { storeVerifier, getVerifier } = require('../utils/pkceStore');
const { generateState, validateState } = require('../utils/oauthState');

const router = express.Router();

const X_CLIENT_ID = process.env.X_CLIENT_ID;
const X_CLIENT_SECRET = process.env.X_CLIENT_SECRET;
const X_REDIRECT_URI = process.env.X_REDIRECT_URI;

// Step 1: Redirect user to X/Twitter authorization URL
router.get('/connect', (req, res) => {
  try {
    const idToken = req.query.idToken;
    
    if (!idToken) {
      return res.status(400).json({ error: 'Missing idToken' });
    }
    
    if (!X_CLIENT_ID || !X_REDIRECT_URI) {
      return res.status(500).json({ error: 'Server configuration error: Missing X/Twitter credentials' });
    }
    
    // Generate secure state token
    const stateToken = generateState(idToken);
    
    // Generate PKCE code verifier and challenge
    const codeVerifier = generateCodeVerifier();
    const codeChallenge = generateCodeChallenge(codeVerifier);
    
    // Store code verifier with state token for callback
    storeVerifier(stateToken, codeVerifier);
    
    // Build authorization URL with PKCE
    const url = `https://twitter.com/i/oauth2/authorize?` +
      `response_type=code&` +
      `client_id=${X_CLIENT_ID}&` +
      `redirect_uri=${encodeURIComponent(X_REDIRECT_URI)}&` +
      `scope=tweet.read%20tweet.write%20users.read%20offline.access&` +
      `state=${encodeURIComponent(stateToken)}&` +
      `code_challenge=${codeChallenge}&` +
      `code_challenge_method=S256`;
    
    res.redirect(url);
  } catch (error) {
    console.error('X OAuth connect error:', error);
    res.redirect('/dashboard?error=' + encodeURIComponent('Failed to initiate X/Twitter connection'));
  }
});

// Step 2: Handle callback from X/Twitter
router.get('/callback', async (req, res) => {
  const { code, state, error } = req.query;
  
  // Handle OAuth errors
  if (error) {
    console.error('X OAuth callback error:', error);
    const errorMessage = error === 'access_denied' 
      ? 'Connection was denied. Please try again.'
      : `Connection failed: ${error}`;
    return res.redirect('/dashboard?error=' + encodeURIComponent(errorMessage));
  }
  
  // Validate required parameters
  if (!code || !state) {
    return res.redirect('/dashboard?error=' + encodeURIComponent('Missing authorization code or state'));
  }
  
  try {
    // Validate state and extract idToken
    const idToken = validateState(state);
    
    if (!idToken) {
      return res.redirect('/dashboard?error=' + encodeURIComponent('Invalid or expired state token'));
    }
    
    // Get code verifier from store
    const codeVerifier = getVerifier(state);
    
    if (!codeVerifier) {
      return res.redirect('/dashboard?error=' + encodeURIComponent('Missing code verifier. Please try again.'));
    }
    
    if (!X_CLIENT_ID || !X_CLIENT_SECRET || !X_REDIRECT_URI) {
      return res.redirect('/dashboard?error=' + encodeURIComponent('Server configuration error'));
    }
    
    // Exchange code for access token with PKCE
    const response = await axios.post('https://api.twitter.com/2/oauth2/token', null, {
      params: {
        code,
        grant_type: 'authorization_code',
        client_id: X_CLIENT_ID,
        redirect_uri: X_REDIRECT_URI,
        code_verifier: codeVerifier,
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
    
    if (!access_token) {
      return res.redirect('/dashboard?error=' + encodeURIComponent('Failed to obtain access token'));
    }
    
    // Verify idToken and get user
    const decoded = await admin.auth().verifyIdToken(idToken);
    const userId = decoded.uid;
    
    // Save to Firestore connections
    await admin.firestore().collection('connections').add({
      userId,
      platform: 'X',
      accessToken: access_token,
      refreshToken: refresh_token || null,
      expiresAt: Date.now() + (expires_in ? expires_in * 1000 : 0),
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    
    // Redirect to dashboard with success
    res.redirect('/dashboard?connected=X');
  } catch (error) {
    console.error('X OAuth callback error:', error);
    
    // Handle specific OAuth errors
    let errorMessage = 'Connection failed';
    if (error.response?.data) {
      const oauthError = error.response.data;
      if (oauthError.error === 'invalid_grant') {
        errorMessage = 'Authorization code expired. Please try again.';
      } else if (oauthError.error_description) {
        errorMessage = oauthError.error_description;
      } else {
        errorMessage = oauthError.error || 'Connection failed';
      }
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    res.redirect('/dashboard?error=' + encodeURIComponent(errorMessage));
  }
});

module.exports = router; 