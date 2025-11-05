const express = require('express');
const admin = require('../firebase');
const authenticateToken = require('../middleware/auth');

const router = express.Router();
const db = admin.firestore();

// Save a new social connection
router.post('/', authenticateToken, async (req, res) => {
  const { platform, accessToken, refreshToken, expiresAt } = req.body;
  try {
    await db.collection('connections').add({
      userId: req.user.uid,
      platform,
      accessToken,
      refreshToken,
      expiresAt,
    });
    res.status(201).json({ message: 'Connection saved' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all connections for the authenticated user
router.get('/', authenticateToken, async (req, res) => {
  try {
    const snapshot = await db.collection('connections').where('userId', '==', req.user.uid).get();
    const connections = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json(connections);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete a connection for a platform
router.delete('/:platform', authenticateToken, async (req, res) => {
  const { platform } = req.params;
  try {
    const snapshot = await db.collection('connections')
      .where('userId', '==', req.user.uid)
      .where('platform', '==', platform)
      .get();
    const batch = db.batch();
    snapshot.forEach(doc => batch.delete(doc.ref));
    await batch.commit();
    res.json({ message: 'Connection deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router; 