const express = require('express');
const admin = require('../firebase');
const authenticateToken = require('../middleware/auth');

const router = express.Router();
const db = admin.firestore();

// Schedule a new post
router.post('/', authenticateToken, async (req, res) => {
  const { platform, content, mediaUrl, scheduledAt } = req.body;
  try {
    await db.collection('scheduled_posts').add({
      userId: req.user.uid,
      platform,
      content,
      mediaUrl,
      scheduledAt,
      status: 'pending',
    });
    res.status(201).json({ message: 'Post scheduled' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all scheduled posts for the authenticated user
router.get('/', authenticateToken, async (req, res) => {
  try {
    const snapshot = await db.collection('scheduled_posts').where('userId', '==', req.user.uid).get();
    const posts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json(posts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router; 