const admin = require('./firebase');

const demoData = {
  scheduled_posts: [
    {
      userId: 'demo-user-1',
      platform: 'Facebook',
      content: '🚀 Excited to share our latest product launch! Check out the amazing features we\'ve been working on. #ProductLaunch #Innovation',
      scheduledAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Tomorrow
      createdAt: new Date().toISOString()
    },
    {
      userId: 'demo-user-1',
      platform: 'Twitter/X',
      content: 'Just shipped our biggest update yet! 🎉 What feature are you most excited about? #TechNews #ProductUpdate',
      scheduledAt: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(), // Day after tomorrow
      createdAt: new Date().toISOString()
    },
    {
      userId: 'demo-user-1',
      platform: 'LinkedIn',
      content: 'Proud to announce our team has grown to 50+ amazing professionals! 🎊 Here\'s to building the future together. #TeamGrowth #CompanyCulture',
      scheduledAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
      createdAt: new Date().toISOString()
    }
  ],
  connections: [
    {
      userId: 'demo-user-1',
      platform: 'Facebook',
      accessToken: 'demo-token-facebook',
      refreshToken: 'demo-refresh-facebook',
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      createdAt: new Date().toISOString()
    },
    {
      userId: 'demo-user-1',
      platform: 'Twitter/X',
      accessToken: 'demo-token-twitter',
      refreshToken: 'demo-refresh-twitter',
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      createdAt: new Date().toISOString()
    }
  ]
};

async function seedDemoData() {
  try {
    const db = admin.firestore();
    
    console.log('🌱 Seeding demo data...');
    
    // Add demo scheduled posts
    for (const post of demoData.scheduled_posts) {
      await db.collection('scheduled_posts').add(post);
      console.log(`✅ Added demo post for ${post.platform}`);
    }
    
    // Add demo connections
    for (const connection of demoData.connections) {
      await db.collection('connections').add(connection);
      console.log(`✅ Added demo connection for ${connection.platform}`);
    }
    
    console.log('🎉 Demo data seeded successfully!');
  } catch (error) {
    console.error('❌ Error seeding demo data:', error);
  }
}

// Run if called directly
if (require.main === module) {
  seedDemoData();
}

module.exports = { seedDemoData }; 