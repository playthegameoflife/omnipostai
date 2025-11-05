const express = require('express');
const admin = require('../firebase');
const axios = require('axios');

const router = express.Router();

const FACEBOOK_CLIENT_ID = process.env.FACEBOOK_CLIENT_ID;
const FACEBOOK_CLIENT_SECRET = process.env.FACEBOOK_CLIENT_SECRET;
const FACEBOOK_REDIRECT_URI = process.env.FACEBOOK_REDIRECT_URI;

router.get('/connect', (req, res) => {
  // Forward idToken as state for callback
  const idToken = req.query.idToken;
  const state = encodeURIComponent(idToken || '');
  const url = `https://www.facebook.com/v18.0/dialog/oauth?client_id=${FACEBOOK_CLIENT_ID}&redirect_uri=${encodeURIComponent(FACEBOOK_REDIRECT_URI)}&state=${state}&scope=public_profile,pages_manage_posts,pages_read_engagement,pages_show_list,pages_manage_metadata`;
  res.redirect(url);
});

router.get('/callback', async (req, res) => {
  const { code, state } = req.query;
  // Use state as idToken
  const idToken = state;
  try {
    const response = await axios.get('https://graph.facebook.com/v18.0/oauth/access_token', {
      params: {
        client_id: FACEBOOK_CLIENT_ID,
        redirect_uri: FACEBOOK_REDIRECT_URI,
        client_secret: FACEBOOK_CLIENT_SECRET,
        code,
      },
    });
    const { access_token, expires_in } = response.data;
    if (!idToken) return res.status(400).json({ error: 'Missing idToken' });
    const decoded = await admin.auth().verifyIdToken(idToken);
    const userId = decoded.uid;
    await admin.firestore().collection('connections').add({
      userId,
      platform: 'Facebook',
      accessToken: access_token,
      expiresAt: Date.now() + expires_in * 1000,
    });
    res.redirect('/dashboard?connected=Facebook');
  } catch (error) {
    res.status(400).json({ error: error.message, details: error.response?.data });
  }
});

module.exports = router; 