const express = require('express');
const admin = require('../firebase');
const axios = require('axios');
const { generateState, validateState } = require('../utils/oauthState');

const router = express.Router();

const TIKTOK_CLIENT_KEY = process.env.TIKTOK_CLIENT_KEY;
const TIKTOK_CLIENT_SECRET = process.env.TIKTOK_CLIENT_SECRET;
const TIKTOK_REDIRECT_URI = process.env.TIKTOK_REDIRECT_URI;

router.get('/connect', (req, res) => {
  try {
    const idToken = req.query.idToken;
    
    if (!idToken) {
      return res.status(400).json({ error: 'Missing idToken' });
    }
    
    if (!TIKTOK_CLIENT_KEY || !TIKTOK_REDIRECT_URI) {
      return res.status(500).json({ error: 'Server configuration error: Missing TikTok credentials' });
    }
    
    // Generate secure state token
    const stateToken = generateState(idToken);
    
    // TikTok OAuth authorization URL
    const url = `https://www.tiktok.com/v2/auth/authorize/` +
      `?client_key=${TIKTOK_CLIENT_KEY}&` +
      `redirect_uri=${encodeURIComponent(TIKTOK_REDIRECT_URI)}&` +
      `response_type=code&` +
      `scope=user.info.basic,video.upload,video.publish&` +
      `state=${encodeURIComponent(stateToken)}`;
    
    res.redirect(url);
  } catch (error) {
    console.error('TikTok OAuth connect error:', error);
    res.redirect('/dashboard?error=' + encodeURIComponent('Failed to initiate TikTok connection'));
  }
});

router.get('/callback', async (req, res) => {
  const { code, state, error } = req.query;
  
  // Handle OAuth errors
  if (error) {
    console.error('TikTok OAuth callback error:', error);
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
    
    if (!TIKTOK_CLIENT_KEY || !TIKTOK_CLIENT_SECRET || !TIKTOK_REDIRECT_URI) {
      return res.redirect('/dashboard?error=' + encodeURIComponent('Server configuration error'));
    }
    
    // Exchange code for access token
    const response = await axios.post('https://open.tiktokapis.com/v2/oauth/token/', {
      client_key: TIKTOK_CLIENT_KEY,
      client_secret: TIKTOK_CLIENT_SECRET,
      code,
      grant_type: 'authorization_code',
      redirect_uri: TIKTOK_REDIRECT_URI,
    }, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    const { access_token, refresh_token, expires_in, token_type } = response.data.data;
    
    if (!access_token) {
      return res.redirect('/dashboard?error=' + encodeURIComponent('Failed to obtain access token'));
    }
    
    // Verify idToken and get user
    const decoded = await admin.auth().verifyIdToken(idToken);
    const userId = decoded.uid;
    
    await admin.firestore().collection('connections').add({
      userId,
      platform: 'TikTok',
      accessToken: access_token,
      refreshToken: refresh_token || null,
      expiresAt: Date.now() + (expires_in ? expires_in * 1000 : 0),
      tokenType: token_type || 'Bearer',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    
    res.redirect('/dashboard?connected=TikTok');
  } catch (error) {
    console.error('TikTok OAuth callback error:', error);
    
    // Handle specific OAuth errors
    let errorMessage = 'Connection failed';
    if (error.response?.data) {
      const oauthError = error.response.data;
      if (oauthError.error?.message) {
        errorMessage = oauthError.error.message;
      } else if (oauthError.description) {
        errorMessage = oauthError.description;
      } else if (oauthError.error_description) {
        errorMessage = oauthError.error_description;
      }
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    res.redirect('/dashboard?error=' + encodeURIComponent(errorMessage));
  }
});

module.exports = router;

