const express = require('express');
const admin = require('../firebase');
const axios = require('axios');
const { generateState, validateState } = require('../utils/oauthState');

const router = express.Router();

// Instagram uses Facebook Graph API (same app as Facebook)
const INSTAGRAM_CLIENT_ID = process.env.FACEBOOK_CLIENT_ID || process.env.INSTAGRAM_CLIENT_ID;
const INSTAGRAM_CLIENT_SECRET = process.env.FACEBOOK_CLIENT_SECRET || process.env.INSTAGRAM_CLIENT_SECRET;
const INSTAGRAM_REDIRECT_URI = process.env.INSTAGRAM_REDIRECT_URI;

router.get('/connect', (req, res) => {
  try {
    const idToken = req.query.idToken;
    
    if (!idToken) {
      return res.status(400).json({ error: 'Missing idToken' });
    }
    
    if (!INSTAGRAM_CLIENT_ID || !INSTAGRAM_REDIRECT_URI) {
      return res.status(500).json({ error: 'Server configuration error: Missing Instagram credentials' });
    }
    
    // Generate secure state token
    const stateToken = generateState(idToken);
    
    // Instagram uses Facebook Graph API with Instagram scopes
    const url = `https://www.facebook.com/v18.0/dialog/oauth?` +
      `client_id=${INSTAGRAM_CLIENT_ID}&` +
      `redirect_uri=${encodeURIComponent(INSTAGRAM_REDIRECT_URI)}&` +
      `state=${encodeURIComponent(stateToken)}&` +
      `scope=instagram_basic,instagram_content_publish,pages_show_list,pages_read_engagement`;
    
    res.redirect(url);
  } catch (error) {
    console.error('Instagram OAuth connect error:', error);
    res.redirect('/dashboard?error=' + encodeURIComponent('Failed to initiate Instagram connection'));
  }
});

router.get('/callback', async (req, res) => {
  const { code, state, error } = req.query;
  
  // Handle OAuth errors
  if (error) {
    console.error('Instagram OAuth callback error:', error);
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
    
    if (!INSTAGRAM_CLIENT_ID || !INSTAGRAM_CLIENT_SECRET || !INSTAGRAM_REDIRECT_URI) {
      return res.redirect('/dashboard?error=' + encodeURIComponent('Server configuration error'));
    }
    
    // Exchange code for access token using Facebook Graph API
    const response = await axios.get('https://graph.facebook.com/v18.0/oauth/access_token', {
      params: {
        client_id: INSTAGRAM_CLIENT_ID,
        redirect_uri: INSTAGRAM_REDIRECT_URI,
        client_secret: INSTAGRAM_CLIENT_SECRET,
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
    
    // Get Instagram Business Account ID (requires Facebook Page)
    // This is a simplified version - in production, you'd need to handle page selection
    let instagramAccountId = null;
    try {
      const pagesResponse = await axios.get('https://graph.facebook.com/v18.0/me/accounts', {
        params: { access_token: access_token },
      });
      
      if (pagesResponse.data.data && pagesResponse.data.data.length > 0) {
        const pageId = pagesResponse.data.data[0].id;
        const instagramResponse = await axios.get(`https://graph.facebook.com/v18.0/${pageId}`, {
          params: {
            access_token: access_token,
            fields: 'instagram_business_account',
          },
        });
        
        if (instagramResponse.data.instagram_business_account) {
          instagramAccountId = instagramResponse.data.instagram_business_account.id;
        }
      }
    } catch (err) {
      console.warn('Could not fetch Instagram Business Account ID:', err.message);
    }
    
    await admin.firestore().collection('connections').add({
      userId,
      platform: 'Instagram',
      accessToken: access_token,
      expiresAt: Date.now() + (expires_in ? expires_in * 1000 : 0),
      instagramAccountId: instagramAccountId,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    
    res.redirect('/dashboard?connected=Instagram');
  } catch (error) {
    console.error('Instagram OAuth callback error:', error);
    
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

