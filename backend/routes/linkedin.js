const express = require('express');
const admin = require('../firebase');
const axios = require('axios');

const router = express.Router();

const LINKEDIN_CLIENT_ID = process.env.LINKEDIN_CLIENT_ID;
const LINKEDIN_CLIENT_SECRET = process.env.LINKEDIN_CLIENT_SECRET;
const LINKEDIN_REDIRECT_URI = process.env.LINKEDIN_REDIRECT_URI;

router.get('/connect', (req, res) => {
  // Forward idToken as state for callback
  const idToken = req.query.idToken;
  const state = encodeURIComponent(idToken || '');
  const url = `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${LINKEDIN_CLIENT_ID}&redirect_uri=${encodeURIComponent(LINKEDIN_REDIRECT_URI)}&scope=r_liteprofile%20r_emailaddress%20w_member_social&state=${state}`;
  res.redirect(url);
});

router.get('/callback', async (req, res) => {
  const { code, state } = req.query;
  // Use state as idToken
  const idToken = state;
  try {
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
    if (!idToken) return res.status(400).json({ error: 'Missing idToken' });
    const decoded = await admin.auth().verifyIdToken(idToken);
    const userId = decoded.uid;
    await admin.firestore().collection('connections').add({
      userId,
      platform: 'LinkedIn',
      accessToken: access_token,
      expiresAt: Date.now() + expires_in * 1000,
    });
    res.redirect('/dashboard?connected=LinkedIn');
  } catch (error) {
    res.status(400).json({ error: error.message, details: error.response?.data });
  }
});

module.exports = router; 