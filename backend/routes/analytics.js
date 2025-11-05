const express = require('express');
const router = express.Router();
const admin = require('../firebase');

// Get analytics data for a user
router.get('/', async (req, res) => {
  try {
    const userId = req.user.uid;
    const db = admin.firestore();

    // Get scheduled posts for analytics
    const postsSnapshot = await db.collection('scheduled_posts')
      .where('userId', '==', userId)
      .get();

    const posts = [];
    postsSnapshot.forEach(doc => {
      posts.push({ id: doc.id, ...doc.data() });
    });

    // Calculate basic analytics
    const totalPosts = posts.length;
    const postsByPlatform = {};
    const postsByMonth = {};
    const recentPosts = posts
      .filter(post => new Date(post.scheduledAt) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000))
      .length;

    posts.forEach(post => {
      // Count by platform
      const platform = post.platform;
      postsByPlatform[platform] = (postsByPlatform[platform] || 0) + 1;

      // Count by month
      const month = new Date(post.scheduledAt).toLocaleString('default', { month: 'long', year: 'numeric' });
      postsByMonth[month] = (postsByMonth[month] || 0) + 1;
    });

    // Get top platforms
    const topPlatforms = Object.entries(postsByPlatform)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([platform, count]) => ({ platform, count }));

    // Get monthly trends
    const monthlyTrends = Object.entries(postsByMonth)
      .sort(([a], [b]) => new Date(a) - new Date(b))
      .map(([month, count]) => ({ month, count }));

    res.json({
      totalPosts,
      recentPosts,
      topPlatforms,
      monthlyTrends,
      postsByPlatform,
      engagement: {
        totalLikes: Math.floor(Math.random() * 1000) + 100, // Placeholder data
        totalShares: Math.floor(Math.random() * 500) + 50,
        totalComments: Math.floor(Math.random() * 200) + 20,
        averageEngagement: Math.floor(Math.random() * 5) + 2
      }
    });
  } catch (error) {
    console.error('Analytics error:', error);
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
});

module.exports = router; 