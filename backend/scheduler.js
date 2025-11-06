const cron = require('node-cron');
const admin = require('./firebase');
const db = admin.firestore();
const { 
  postToTwitter, 
  postToLinkedIn, 
  postToFacebook, 
  postToPinterest,
  postToInstagram,
  postToYouTube,
  postToTikTok,
  postToThreads,
  postToBluesky,
  postToSnapchat
} = require('./routes/post');

// Run every minute
cron.schedule('* * * * *', async () => {
  console.log('Scheduler running...');
  const now = admin.firestore.Timestamp.now();
  try {
    const snapshot = await db.collection('scheduled_posts')
      .where('scheduledAt', '<=', now)
      .where('status', '==', 'pending')
      .get();
    
    for (const doc of snapshot.docs) {
      const post = doc.data();
      const { platform, content, mediaUrl, userId } = post;
      
      try {
        // Get user's connection for this platform
        const connectionSnapshot = await db.collection('connections')
          .where('userId', '==', userId)
          .where('platform', '==', platform)
          .limit(1)
          .get();
        
        if (connectionSnapshot.empty) {
          await doc.ref.update({
            status: 'failed',
            error: `No connection found for ${platform}`,
            failedAt: admin.firestore.FieldValue.serverTimestamp()
          });
          continue;
        }
        
        const connection = connectionSnapshot.docs[0].data();
        const { accessToken, refreshToken, instagramAccountId, threadsPageId, blueskyDid } = connection;
        
        let result;
        // Call appropriate posting function based on platform
        switch (platform.toLowerCase()) {
          case 'x':
          case 'twitter':
            result = await postToTwitter({ content, mediaUrl, accessToken, refreshToken });
            break;
          case 'linkedin':
            result = await postToLinkedIn({ content, mediaUrl, accessToken });
            break;
          case 'facebook':
            result = await postToFacebook({ content, mediaUrl, accessToken });
            break;
          case 'pinterest':
            result = await postToPinterest({ content, mediaUrl, accessToken });
            break;
          case 'instagram':
            result = await postToInstagram({ content, mediaUrl, accessToken, instagramAccountId });
            break;
          case 'youtube':
            result = await postToYouTube({ content, mediaUrl, accessToken });
            break;
          case 'tiktok':
            result = await postToTikTok({ content, mediaUrl, accessToken });
            break;
          case 'threads':
            result = await postToThreads({ content, mediaUrl, accessToken, threadsPageId });
            break;
          case 'bluesky':
            result = await postToBluesky({ content, mediaUrl, accessToken, blueskyDid });
            break;
          case 'snapchat':
            result = await postToSnapchat({ content, mediaUrl, accessToken });
            break;
          default:
            throw new Error(`Unsupported platform: ${platform}`);
        }
        
        // Update post status on success
        if (result.success) {
          await doc.ref.update({
            status: 'sent',
            sentAt: admin.firestore.FieldValue.serverTimestamp(),
            postId: result.tweetId || result.postId || result.pinId || result.id || result.uri,
            result: result
          });
          console.log(`Successfully posted to ${platform} for user ${userId}`);
        } else {
          throw new Error(result.message || 'Posting failed');
        }
      } catch (error) {
        console.error(`Error posting to ${platform} for user ${userId}:`, error.message);
        // Update post status on failure
        await doc.ref.update({
          status: 'failed',
          error: error.message,
          failedAt: admin.firestore.FieldValue.serverTimestamp(),
          retryCount: (post.retryCount || 0) + 1
        });
      }
    }
  } catch (error) {
    console.error('Scheduler error:', error);
  }
}); 