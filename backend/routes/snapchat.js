const express = require('express');
const admin = require('../firebase');
const axios = require('axios');
const { generateState, validateState } = require('../utils/oauthState');

const router = express.Router();

const SNAPCHAT_CLIENT_ID = process.env.SNAPCHAT_CLIENT_ID;
const SNAPCHAT_CLIENT_SECRET = process.env.SNAPCHAT_CLIENT_SECRET;
const SNAPCHAT_REDIRECT_URI = process.env.SNAPCHAT_REDIRECT_URI;

router.get('/connect', (req, res) => {
  try {
    const idToken = req.query.idToken;
    
    if (!idToken) {
      return res.status(400).json({ error: 'Missing idToken' });
    }
    
    if (!SNAPCHAT_CLIENT_ID || !SNAPCHAT_REDIRECT_URI) {
      return res.status(500).json({ error: 'Server configuration error: Missing Snapchat credentials' });
    }
    
    // Generate secure state token
    const stateToken = generateState(idToken);
    
    // Snap Kit OAuth authorization URL
    const url = `https://accounts.snapchat.com/login/oauth2/authorize?` +
      `client_id=${SNAPCHAT_CLIENT_ID}&` +
      `redirect_uri=${encodeURIComponent(SNAPCHAT_REDIRECT_URI)}&` +
      `response_type=code&` +
      `scope=user.bitmoji,user.display_name,user.external_id&` +
      `state=${encodeURIComponent(stateToken)}`;
    
    res.redirect(url);
  } catch (error) {
    console.error('Snapchat OAuth connect error:', error);
    res.redirect('/dashboard?error=' + encodeURIComponent('Failed to initiate Snapchat connection'));
  }
});

router.get('/callback', async (req, res) => {
  const { code, state, error } = req.query;
  
  // Handle OAuth errors
  if (error) {
    console.error('Snapchat OAuth callback error:', error);
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
    
    if (!SNAPCHAT_CLIENT_ID || !SNAPCHAT_CLIENT_SECRET || !SNAPCHAT_REDIRECT_URI) {
      return res.redirect('/dashboard?error=' + encodeURIComponent('Server configuration error'));
    }
    
    // Exchange code for access token
    const response = await axios.post('https://accounts.snapchat.com/login/oauth2/access_token', {
      client_id: SNAPCHAT_CLIENT_ID,
      client_secret: SNAPCHAT_CLIENT_SECRET,
      code,
      grant_type: 'authorization_code',
      redirect_uri: SNAPCHAT_REDIRECT_URI,
    }, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    const { access_token, refresh_token, expires_in } = response.data;
    
    if (!access_token) {
      return res.redirect('/dashboard?error=' + encodeURIComponent('Failed to obtain access token'));
    }
    
    // Verify idToken and get user
    const decoded = await admin.auth().verifyIdToken(idToken);
    const userId = decoded.uid;
    
    await admin.firestore().collection('connections').add({
      userId,
      platform: 'Snapchat',
      accessToken: access_token,
      refreshToken: refresh_token || null,
      expiresAt: Date.now() + (expires_in ? expires_in * 1000 : 0),
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    
    res.redirect('/dashboard?connected=Snapchat');
  } catch (error) {
    console.error('Snapchat OAuth callback error:', error);
    
    // Handle specific OAuth errors
    let errorMessage = 'Connection failed';
    if (error.response?.data) {
      const oauthError = error.response.data;
      if (oauthError.error_description) {
        errorMessage = oauthError.error_description;
      } else if (oauthError.error) {
        errorMessage = oauthError.error;
      }
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    res.redirect('/dashboard?error=' + encodeURIComponent(errorMessage));
  }
});

module.exports = router;

