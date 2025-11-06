const express = require('express');
const admin = require('../firebase');
const axios = require('axios');
const { generateState, validateState } = require('../utils/oauthState');

const router = express.Router();

// Threads uses Meta/Facebook Graph API (same app as Facebook/Instagram)
const THREADS_CLIENT_ID = process.env.FACEBOOK_CLIENT_ID || process.env.THREADS_CLIENT_ID;
const THREADS_CLIENT_SECRET = process.env.FACEBOOK_CLIENT_SECRET || process.env.THREADS_CLIENT_SECRET;
const THREADS_REDIRECT_URI = process.env.THREADS_REDIRECT_URI;

router.get('/connect', (req, res) => {
  try {
    const idToken = req.query.idToken;
    
    if (!idToken) {
      return res.status(400).json({ error: 'Missing idToken' });
    }
    
    if (!THREADS_CLIENT_ID || !THREADS_REDIRECT_URI) {
      return res.status(500).json({ error: 'Server configuration error: Missing Threads credentials' });
    }
    
    // Generate secure state token
    const stateToken = generateState(idToken);
    
    // Threads uses Facebook Graph API with Threads scopes
    const url = `https://www.facebook.com/v18.0/dialog/oauth?` +
      `client_id=${THREADS_CLIENT_ID}&` +
      `redirect_uri=${encodeURIComponent(THREADS_REDIRECT_URI)}&` +
      `state=${encodeURIComponent(stateToken)}&` +
      `scope=threads_basic,threads_content_publish,pages_show_list`;
    
    res.redirect(url);
  } catch (error) {
    console.error('Threads OAuth connect error:', error);
    res.redirect('/dashboard?error=' + encodeURIComponent('Failed to initiate Threads connection'));
  }
});

router.get('/callback', async (req, res) => {
  const { code, state, error } = req.query;
  
  // Handle OAuth errors
  if (error) {
    console.error('Threads OAuth callback error:', error);
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
    
    if (!THREADS_CLIENT_ID || !THREADS_CLIENT_SECRET || !THREADS_REDIRECT_URI) {
      return res.redirect('/dashboard?error=' + encodeURIComponent('Server configuration error'));
    }
    
    // Exchange code for access token using Facebook Graph API
    const response = await axios.get('https://graph.facebook.com/v18.0/oauth/access_token', {
      params: {
        client_id: THREADS_CLIENT_ID,
        redirect_uri: THREADS_REDIRECT_URI,
        client_secret: THREADS_CLIENT_SECRET,
        code,
      },
    });
    
    const { access_token, expires_in } = response.data;
    
    if (!access_token) {
      return res.redirect('/dashboard?error=' + encodeURIComponent('Failed to obtain access token'));
    }
    
    // Verify idToken and get user
    const decoded = await admin.auth().verifyIdToken(idToken);
    const userId = decoded.uid;
    
    // Get Threads Page ID (requires Facebook Page connected to Threads)
    let threadsPageId = null;
    try {
      const pagesResponse = await axios.get('https://graph.facebook.com/v18.0/me/accounts', {
        params: { access_token: access_token },
      });
      
      if (pagesResponse.data.data && pagesResponse.data.data.length > 0) {
        // Find page with Threads connected
        for (const page of pagesResponse.data.data) {
          try {
            const threadsResponse = await axios.get(`https://graph.facebook.com/v18.0/${page.id}`, {
              params: {
                access_token: access_token,
                fields: 'threads_profile',
              },
            });
            if (threadsResponse.data.threads_profile) {
              threadsPageId = page.id;
              break;
            }
          } catch (err) {
            // Continue to next page
          }
        }
      }
    } catch (err) {
      console.warn('Could not fetch Threads Page ID:', err.message);
    }
    
    await admin.firestore().collection('connections').add({
      userId,
      platform: 'Threads',
      accessToken: access_token,
      expiresAt: Date.now() + (expires_in ? expires_in * 1000 : 0),
      threadsPageId: threadsPageId,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    
    res.redirect('/dashboard?connected=Threads');
  } catch (error) {
    console.error('Threads OAuth callback error:', error);
    
    // Handle specific OAuth errors
    let errorMessage = 'Connection failed';
    if (error.response?.data) {
      const oauthError = error.response.data;
      if (oauthError.error?.message) {
        errorMessage = oauthError.error.message;
      } else if (oauthError.error_description) {
        errorMessage = oauthError.error_description;
      } else {
        errorMessage = oauthError.error?.type || 'Connection failed';
      }
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    res.redirect('/dashboard?error=' + encodeURIComponent(errorMessage));
  }
});

module.exports = router;

