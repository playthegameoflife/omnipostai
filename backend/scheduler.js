const cron = require('node-cron');
const admin = require('./firebase');
const db = admin.firestore();

// Run every minute
cron.schedule('* * * * *', async () => {
  console.log('Scheduler running...');
  const now = new Date();
  try {
    const snapshot = await db.collection('scheduled_posts')
      .where('scheduledAt', '<=', now.toISOString())
      .where('status', '==', 'pending')
      .get();
    for (const doc of snapshot.docs) {
      const post = doc.data();
      // TODO: Call posting logic for the appropriate platform (e.g., /api/post/x)
      // Example: await postToX(post)
      // On success:
      await doc.ref.update({ status: 'sent', sentAt: admin.firestore.FieldValue.serverTimestamp() });
      // On failure, you could update status: 'failed'
    }
  } catch (error) {
    console.error('Scheduler error:', error);
  }
}); 