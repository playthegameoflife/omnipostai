const express = require('express');
const admin = require('../firebase');
const axios = require('axios');

const router = express.Router();
const db = admin.firestore();

// Post to X/Twitter
router.post('/x', async (req, res) => {
  const { userId, content } = req.body;
  try {
    // Lookup user's X access token from Firestore
    const snapshot = await db.collection('connections')
      .where('userId', '==', userId)
      .where('platform', '==', 'x')
      .limit(1)
      .get();
    if (snapshot.empty) {
      return res.status(400).json({ error: 'No X connection found for user.' });
    }
    const connection = snapshot.docs[0].data();
    const accessToken = connection.accessToken;
    // TODO: Make authenticated API call to X/Twitter to create the post
    // Example placeholder:
    // const response = await axios.post('https://api.twitter.com/2/tweets', { text: content }, { headers: { Authorization: `Bearer ${accessToken}` } });
    res.json({ message: 'Post would be sent to X/Twitter here.', content });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Post to LinkedIn
router.post('/linkedin', async (req, res) => {
  const { userId, content } = req.body;
  try {
    const snapshot = await db.collection('connections')
      .where('userId', '==', userId)
      .where('platform', '==', 'linkedin')
      .limit(1)
      .get();
    if (snapshot.empty) {
      return res.status(400).json({ error: 'No LinkedIn connection found for user.' });
    }
    const connection = snapshot.docs[0].data();
    const accessToken = connection.accessToken;
    // TODO: Make authenticated API call to LinkedIn to create the post
    res.json({ message: 'Post would be sent to LinkedIn here.', content });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Post to Pinterest
router.post('/pinterest', async (req, res) => {
  const { userId, content } = req.body;
  try {
    const snapshot = await db.collection('connections')
      .where('userId', '==', userId)
      .where('platform', '==', 'pinterest')
      .limit(1)
      .get();
    if (snapshot.empty) {
      return res.status(400).json({ error: 'No Pinterest connection found for user.' });
    }
    const connection = snapshot.docs[0].data();
    const accessToken = connection.accessToken;
    // TODO: Make authenticated API call to Pinterest to create the post
    res.json({ message: 'Post would be sent to Pinterest here.', content });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Post to Facebook
router.post('/facebook', async (req, res) => {
  const { userId, content } = req.body;
  try {
    const snapshot = await db.collection('connections')
      .where('userId', '==', userId)
      .where('platform', '==', 'facebook')
      .limit(1)
      .get();
    if (snapshot.empty) {
      return res.status(400).json({ error: 'No Facebook connection found for user.' });
    }
    const connection = snapshot.docs[0].data();
    const accessToken = connection.accessToken;
    // TODO: Make authenticated API call to Facebook to create the post
    res.json({ message: 'Post would be sent to Facebook here.', content });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Unified post to all connected platforms
router.post('/all', async (req, res) => {
  const { content, mediaUrl } = req.body;
  // Assume authentication middleware sets req.user.uid
  const userId = req.user && req.user.uid ? req.user.uid : req.body.userId;
  if (!userId) return res.status(401).json({ error: 'User not authenticated' });

  try {
    const snapshot = await db.collection('connections').where('userId', '==', userId).get();
    if (snapshot.empty) return res.status(400).json({ error: 'No social accounts connected' });

    const results = {};
    for (const doc of snapshot.docs) {
      const { platform, accessToken, refreshToken } = doc.data();
      try {
        if (platform.toLowerCase() === 'x' || platform.toLowerCase() === 'twitter') {
          results['X'] = await postToTwitter({ content, mediaUrl, accessToken, refreshToken });
        } else if (platform.toLowerCase() === 'linkedin') {
          results['LinkedIn'] = await postToLinkedIn({ content, mediaUrl, accessToken });
        } else if (platform.toLowerCase() === 'facebook') {
          results['Facebook'] = await postToFacebook({ content, mediaUrl, accessToken });
        } else if (platform.toLowerCase() === 'pinterest') {
          results['Pinterest'] = await postToPinterest({ content, mediaUrl, accessToken });
        }
      } catch (err) {
        results[platform] = { error: err.message };
      }
    }
    res.json(results);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// --- Per-platform posting function stubs ---

async function postToTwitter({ content, mediaUrl, accessToken, refreshToken }) {
  // TODO: Implement Twitter media upload and tweet creation
  // Use Twitter API v2 endpoints
  // If mediaUrl is present, upload media first, then post tweet with media_id
  return { message: 'Posted to Twitter (stub)', content, mediaUrl };
}

async function postToLinkedIn({ content, mediaUrl, accessToken }) {
  // TODO: Implement LinkedIn media upload and post creation
  // Use LinkedIn v2 API
  // If mediaUrl is present, upload media first, then post
  return { message: 'Posted to LinkedIn (stub)', content, mediaUrl };
}

async function postToFacebook({ content, mediaUrl, accessToken }) {
  // TODO: Implement Facebook media upload and post creation
  // Use Facebook Graph API
  // If mediaUrl is present, upload media first, then post
  return { message: 'Posted to Facebook (stub)', content, mediaUrl };
}

async function postToPinterest({ content, mediaUrl, accessToken }) {
  // TODO: Implement Pinterest media upload and pin creation
  // Use Pinterest API
  // If mediaUrl is present, upload media first, then post
  return { message: 'Posted to Pinterest (stub)', content, mediaUrl };
}

module.exports = router; 