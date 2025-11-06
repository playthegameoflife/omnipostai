const express = require('express');
const admin = require('../firebase');
const axios = require('axios');
const { generateState, validateState } = require('../utils/oauthState');

const router = express.Router();

const LINKEDIN_CLIENT_ID = process.env.LINKEDIN_CLIENT_ID;
const LINKEDIN_CLIENT_SECRET = process.env.LINKEDIN_CLIENT_SECRET;
const LINKEDIN_REDIRECT_URI = process.env.LINKEDIN_REDIRECT_URI;

router.get('/connect', (req, res) => {
  try {
    const idToken = req.query.idToken;
    
    if (!idToken) {
      return res.status(400).json({ error: 'Missing idToken' });
    }
    
    if (!LINKEDIN_CLIENT_ID || !LINKEDIN_REDIRECT_URI) {
      return res.status(500).json({ error: 'Server configuration error: Missing LinkedIn credentials' });
    }
    
    // Generate secure state token
    const stateToken = generateState(idToken);
    
    const url = `https://www.linkedin.com/oauth/v2/authorization?` +
      `response_type=code&` +
      `client_id=${LINKEDIN_CLIENT_ID}&` +
      `redirect_uri=${encodeURIComponent(LINKEDIN_REDIRECT_URI)}&` +
      `scope=r_liteprofile%20r_emailaddress%20w_member_social&` +
      `state=${encodeURIComponent(stateToken)}`;
    
    res.redirect(url);
  } catch (error) {
    console.error('LinkedIn OAuth connect error:', error);
    res.redirect('/dashboard?error=' + encodeURIComponent('Failed to initiate LinkedIn connection'));
  }
});

router.get('/callback', async (req, res) => {
  const { code, state, error } = req.query;
  
  // Handle OAuth errors
  if (error) {
    console.error('LinkedIn OAuth callback error:', error);
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
    
    if (!LINKEDIN_CLIENT_ID || !LINKEDIN_CLIENT_SECRET || !LINKEDIN_REDIRECT_URI) {
      return res.redirect('/dashboard?error=' + encodeURIComponent('Server configuration error'));
    }
    
    const response = await axios.post('https://www.linkedin.com/oauth/v2/accessToken', null, {
      params: {
        grant_type: 'authorization_code',
        code,
        redirect_uri: LINKEDIN_REDIRECT_URI,
        client_id: LINKEDIN_CLIENT_ID,
        client_secret: LINKEDIN_CLIENT_SECRET,
      },
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });
    
    const { access_token, expires_in } = response.data;
    
    if (!access_token) {
      return res.redirect('/dashboard?error=' + encodeURIComponent('Failed to obtain access token'));
    }
    
    // Verify idToken and get user
    const decoded = await admin.auth().verifyIdToken(idToken);
    const userId = decoded.uid;
    
    await admin.firestore().collection('connections').add({
      userId,
      platform: 'LinkedIn',
      accessToken: access_token,
      expiresAt: Date.now() + (expires_in ? expires_in * 1000 : 0),
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    
    res.redirect('/dashboard?connected=LinkedIn');
  } catch (error) {
    console.error('LinkedIn OAuth callback error:', error);
    
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