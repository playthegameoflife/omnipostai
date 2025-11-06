const express = require('express');
const admin = require('../firebase');
const authenticateToken = require('../middleware/auth');

const router = express.Router();
const db = admin.firestore();

// Schedule a new post
router.post('/', authenticateToken, async (req, res) => {
  const { platform, content, mediaUrl, scheduledAt, platforms } = req.body;
  try {
    // Support both single platform and multiple platforms
    const platformsToSchedule = platforms && platforms.length > 0 ? platforms : [platform];
    
    // Convert scheduledAt to Firestore Timestamp
    const scheduledTimestamp = scheduledAt 
      ? admin.firestore.Timestamp.fromDate(new Date(scheduledAt))
      : admin.firestore.Timestamp.now();
    
    // Create a post for each platform
    const postPromises = platformsToSchedule.map(async (platformName) => {
      const postData = {
        userId: req.user.uid,
        platform: platformName,
        content: platforms && platforms.length > 0 
          ? (req.body.platformContent?.[platformName] || content)
          : content,
        mediaUrl: mediaUrl || null,
        scheduledAt: scheduledTimestamp,
        status: 'pending',
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      };
      return await db.collection('scheduled_posts').add(postData);
    });
    
    await Promise.all(postPromises);
    res.status(201).json({ 
      message: platformsToSchedule.length > 1 
        ? `Posts scheduled to ${platformsToSchedule.length} platforms` 
        : 'Post scheduled' 
    });
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

// Get a specific scheduled post
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const doc = await db.collection('scheduled_posts').doc(req.params.id).get();
    if (!doc.exists) {
      return res.status(404).json({ error: 'Post not found' });
    }
    const post = doc.data();
    // Verify post belongs to user
    if (post.userId !== req.user.uid) {
      return res.status(403).json({ error: 'Unauthorized' });
    }
    res.json({ id: doc.id, ...post });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update a scheduled post
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { platform, content, mediaUrl, scheduledAt } = req.body;
    const docRef = db.collection('scheduled_posts').doc(req.params.id);
    const doc = await docRef.get();
    
    if (!doc.exists) {
      return res.status(404).json({ error: 'Post not found' });
    }
    
    const post = doc.data();
    // Verify post belongs to user
    if (post.userId !== req.user.uid) {
      return res.status(403).json({ error: 'Unauthorized' });
    }
    
    // Don't allow editing posts that have already been sent
    if (post.status === 'sent') {
      return res.status(400).json({ error: 'Cannot edit a post that has already been sent' });
    }
    
    // Update post
    const updateData = {
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };
    
    if (platform) updateData.platform = platform;
    if (content !== undefined) updateData.content = content;
    if (mediaUrl !== undefined) updateData.mediaUrl = mediaUrl;
    if (scheduledAt) {
      // Convert to Firestore Timestamp
      updateData.scheduledAt = admin.firestore.Timestamp.fromDate(new Date(scheduledAt));
    }
    
    await docRef.update(updateData);
    res.json({ message: 'Post updated successfully', id: req.params.id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete a scheduled post
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const docRef = db.collection('scheduled_posts').doc(req.params.id);
    const doc = await docRef.get();
    
    if (!doc.exists) {
      return res.status(404).json({ error: 'Post not found' });
    }
    
    const post = doc.data();
    // Verify post belongs to user
    if (post.userId !== req.user.uid) {
      return res.status(403).json({ error: 'Unauthorized' });
    }
    
    // Don't allow deleting posts that have already been sent
    if (post.status === 'sent') {
      return res.status(400).json({ error: 'Cannot delete a post that has already been sent' });
    }
    
    await docRef.delete();
    res.json({ message: 'Post deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Post now (immediate posting)
router.post('/:id/publish', authenticateToken, async (req, res) => {
  try {
    const docRef = db.collection('scheduled_posts').doc(req.params.id);
    const doc = await docRef.get();
    
    if (!doc.exists) {
      return res.status(404).json({ error: 'Post not found' });
    }
    
    const post = doc.data();
    // Verify post belongs to user
    if (post.userId !== req.user.uid) {
      return res.status(403).json({ error: 'Unauthorized' });
    }
    
    // Don't allow posting if already sent
    if (post.status === 'sent') {
      return res.status(400).json({ error: 'Post has already been sent' });
    }
    
    // Import posting functions
    const { postToTwitter, postToLinkedIn, postToFacebook, postToPinterest } = require('./post');
    
    // Get user's connection for this platform
    const connectionSnapshot = await db.collection('connections')
      .where('userId', '==', req.user.uid)
      .where('platform', '==', post.platform)
      .limit(1)
      .get();
    
    if (connectionSnapshot.empty) {
      return res.status(400).json({ error: `No connection found for ${post.platform}` });
    }
    
    const connection = connectionSnapshot.docs[0].data();
    const { accessToken, refreshToken } = connection;
    
    // Post to platform
    let result;
    switch (post.platform.toLowerCase()) {
      case 'x':
      case 'twitter':
        result = await postToTwitter({ content: post.content, mediaUrl: post.mediaUrl, accessToken, refreshToken });
        break;
      case 'linkedin':
        result = await postToLinkedIn({ content: post.content, mediaUrl: post.mediaUrl, accessToken });
        break;
      case 'facebook':
        result = await postToFacebook({ content: post.content, mediaUrl: post.mediaUrl, accessToken });
        break;
      case 'pinterest':
        result = await postToPinterest({ content: post.content, mediaUrl: post.mediaUrl, accessToken });
        break;
      default:
        return res.status(400).json({ error: `Unsupported platform: ${post.platform}` });
    }
    
    // Update post status
    if (result.success) {
      await docRef.update({
        status: 'sent',
        sentAt: admin.firestore.FieldValue.serverTimestamp(),
        postId: result.tweetId || result.postId || result.pinId,
        result: result
      });
      res.json({ message: 'Post published successfully', result });
    } else {
      throw new Error(result.message || 'Posting failed');
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router; 