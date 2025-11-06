const express = require('express');
const admin = require('../firebase');
const axios = require('axios');
const { generateState, validateState } = require('../utils/oauthState');

const router = express.Router();

const YOUTUBE_CLIENT_ID = process.env.YOUTUBE_CLIENT_ID;
const YOUTUBE_CLIENT_SECRET = process.env.YOUTUBE_CLIENT_SECRET;
const YOUTUBE_REDIRECT_URI = process.env.YOUTUBE_REDIRECT_URI;

router.get('/connect', (req, res) => {
  try {
    const idToken = req.query.idToken;
    
    if (!idToken) {
      return res.status(400).json({ error: 'Missing idToken' });
    }
    
    if (!YOUTUBE_CLIENT_ID || !YOUTUBE_REDIRECT_URI) {
      return res.status(500).json({ error: 'Server configuration error: Missing YouTube credentials' });
    }
    
    // Generate secure state token
    const stateToken = generateState(idToken);
    
    // Google OAuth 2.0 authorization URL
    const url = `https://accounts.google.com/o/oauth2/v2/auth?` +
      `client_id=${YOUTUBE_CLIENT_ID}&` +
      `redirect_uri=${encodeURIComponent(YOUTUBE_REDIRECT_URI)}&` +
      `response_type=code&` +
      `scope=https://www.googleapis.com/auth/youtube.upload%20https://www.googleapis.com/auth/youtube.readonly&` +
      `access_type=offline&` +
      `prompt=consent&` +
      `state=${encodeURIComponent(stateToken)}`;
    
    res.redirect(url);
  } catch (error) {
    console.error('YouTube OAuth connect error:', error);
    res.redirect('/dashboard?error=' + encodeURIComponent('Failed to initiate YouTube connection'));
  }
});

router.get('/callback', async (req, res) => {
  const { code, state, error } = req.query;
  
  // Handle OAuth errors
  if (error) {
    console.error('YouTube OAuth callback error:', error);
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
    
    if (!YOUTUBE_CLIENT_ID || !YOUTUBE_CLIENT_SECRET || !YOUTUBE_REDIRECT_URI) {
      return res.redirect('/dashboard?error=' + encodeURIComponent('Server configuration error'));
    }
    
    // Exchange code for access token
    const response = await axios.post('https://oauth2.googleapis.com/token', null, {
      params: {
        client_id: YOUTUBE_CLIENT_ID,
        client_secret: YOUTUBE_CLIENT_SECRET,
        code,
        grant_type: 'authorization_code',
        redirect_uri: YOUTUBE_REDIRECT_URI,
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
    
    await admin.firestore().collection('connections').add({
      userId,
      platform: 'YouTube',
      accessToken: access_token,
      refreshToken: refresh_token || null,
      expiresAt: Date.now() + (expires_in ? expires_in * 1000 : 0),
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    
    res.redirect('/dashboard?connected=YouTube');
  } catch (error) {
    console.error('YouTube OAuth callback error:', error);
    
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

