const express = require('express');
const admin = require('../firebase');
const axios = require('axios');

const router = express.Router();

const PINTEREST_CLIENT_ID = process.env.PINTEREST_CLIENT_ID;
const PINTEREST_CLIENT_SECRET = process.env.PINTEREST_CLIENT_SECRET;
const PINTEREST_REDIRECT_URI = process.env.PINTEREST_REDIRECT_URI;

router.get('/connect', (req, res) => {
  // Forward idToken as state for callback
  const idToken = req.query.idToken;
  const state = encodeURIComponent(idToken || '');
  const url = `https://www.pinterest.com/oauth/?response_type=code&client_id=${PINTEREST_CLIENT_ID}&redirect_uri=${encodeURIComponent(PINTEREST_REDIRECT_URI)}&scope=read_public,write_public&state=${state}`;
  res.redirect(url);
});

router.get('/callback', async (req, res) => {
  const { code, state } = req.query;
  // Use state as idToken
  const idToken = state;
  try {
    const response = await axios.post('https://api.pinterest.com/v1/oauth/token', null, {
      params: {
        grant_type: 'authorization_code',
        client_id: PINTEREST_CLIENT_ID,
        client_secret: PINTEREST_CLIENT_SECRET,
        code,
        redirect_uri: PINTEREST_REDIRECT_URI,
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
      platform: 'Pinterest',
      accessToken: access_token,
      expiresAt: Date.now() + (expires_in ? expires_in * 1000 : 0),
    });
    res.redirect('/dashboard?connected=Pinterest');
  } catch (error) {
    res.status(400).json({ error: error.message, details: error.response?.data });
  }
});

module.exports = router; 