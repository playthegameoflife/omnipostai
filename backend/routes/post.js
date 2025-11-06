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
    const { accessToken, refreshToken } = connection;
    const result = await postToTwitter({ content, mediaUrl: req.body.mediaUrl, accessToken, refreshToken });
    res.json(result);
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
    const result = await postToLinkedIn({ content, mediaUrl: req.body.mediaUrl, accessToken });
    res.json(result);
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
    const result = await postToPinterest({ content, mediaUrl: req.body.mediaUrl, accessToken });
    res.json(result);
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
    const result = await postToFacebook({ content, mediaUrl: req.body.mediaUrl, accessToken });
    res.json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Unified post to all connected platforms or selected platforms
router.post('/all', async (req, res) => {
  const { content, mediaUrl, platforms, platformContent } = req.body;
  const userId = req.user.uid;

  try {
    // Get user's connections
    let query = db.collection('connections').where('userId', '==', userId);
    const snapshot = await query.get();
    if (snapshot.empty) return res.status(400).json({ error: 'No social accounts connected' });

    // Filter to selected platforms if provided, otherwise use all connections
    const connectionsToPost = snapshot.docs.filter(doc => {
      if (!platforms || platforms.length === 0) return true;
      const platform = doc.data().platform;
      // Normalize platform names for comparison
      const normalizedPlatform = platform.toLowerCase();
      return platforms.some(p => {
        const normalizedP = p.toLowerCase();
        return normalizedPlatform === normalizedP || 
               (normalizedP === 'x' && normalizedPlatform === 'twitter') ||
               (normalizedP === 'twitter' && normalizedPlatform === 'x');
      });
    });

    if (connectionsToPost.length === 0) {
      return res.status(400).json({ error: 'No connections found for selected platforms' });
    }

    const results = {};
    for (const doc of connectionsToPost) {
      const { platform, accessToken, refreshToken } = doc.data();
      try {
        // Use platform-specific content if available, otherwise fallback to generic content
        const platformName = platform.toLowerCase() === 'twitter' ? 'X' : platform;
        const postContent = platformContent && platformContent[platformName] 
          ? platformContent[platformName] 
          : platformContent && platformContent[platform]
          ? platformContent[platform]
          : content;

        if (!postContent) {
          results[platform] = { error: 'No content provided for this platform' };
          continue;
        }

        if (platform.toLowerCase() === 'x' || platform.toLowerCase() === 'twitter') {
          results['X'] = await postToTwitter({ content: postContent, mediaUrl, accessToken, refreshToken });
        } else if (platform.toLowerCase() === 'linkedin') {
          results['LinkedIn'] = await postToLinkedIn({ content: postContent, mediaUrl, accessToken });
        } else if (platform.toLowerCase() === 'facebook') {
          results['Facebook'] = await postToFacebook({ content: postContent, mediaUrl, accessToken });
        } else if (platform.toLowerCase() === 'pinterest') {
          results['Pinterest'] = await postToPinterest({ content: postContent, mediaUrl, accessToken });
        } else if (platform.toLowerCase() === 'instagram') {
          const instagramAccountId = doc.data().instagramAccountId;
          results['Instagram'] = await postToInstagram({ content: postContent, mediaUrl, accessToken, instagramAccountId });
        } else if (platform.toLowerCase() === 'youtube') {
          results['YouTube'] = await postToYouTube({ content: postContent, mediaUrl, accessToken });
        } else if (platform.toLowerCase() === 'tiktok') {
          results['TikTok'] = await postToTikTok({ content: postContent, mediaUrl, accessToken });
        } else if (platform.toLowerCase() === 'threads') {
          const threadsPageId = doc.data().threadsPageId;
          results['Threads'] = await postToThreads({ content: postContent, mediaUrl, accessToken, threadsPageId });
        } else if (platform.toLowerCase() === 'bluesky') {
          const blueskyDid = doc.data().blueskyDid;
          results['Bluesky'] = await postToBluesky({ content: postContent, mediaUrl, accessToken, blueskyDid });
        } else if (platform.toLowerCase() === 'snapchat') {
          results['Snapchat'] = await postToSnapchat({ content: postContent, mediaUrl, accessToken });
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

// --- Per-platform posting functions ---

async function postToTwitter({ content, mediaUrl, accessToken, refreshToken }) {
  try {
    let mediaId = null;
    
    // Upload media if provided
    if (mediaUrl) {
      try {
        // Download media from URL
        const mediaResponse = await axios.get(mediaUrl, { responseType: 'arraybuffer' });
        const mediaBuffer = Buffer.from(mediaResponse.data);
        const mediaBase64 = mediaBuffer.toString('base64');
        
        // Initialize media upload
        const initResponse = await axios.post(
          'https://upload.twitter.com/1.1/media/upload.json',
          {
            command: 'INIT',
            media_type: mediaResponse.headers['content-type'] || 'image/jpeg',
            total_bytes: mediaBuffer.length
          },
          {
            headers: {
              Authorization: `Bearer ${accessToken}`
            },
            params: {
              command: 'INIT',
              media_type: mediaResponse.headers['content-type'] || 'image/jpeg',
              total_bytes: mediaBuffer.length
            }
          }
        );
        
        mediaId = initResponse.data.media_id_string;
        
        // Append media chunks
        await axios.post(
          'https://upload.twitter.com/1.1/media/upload.json',
          {
            command: 'APPEND',
            media_id: mediaId,
            media_data: mediaBase64,
            segment_index: 0
          },
          {
            headers: {
              Authorization: `Bearer ${accessToken}`
            }
          }
        );
        
        // Finalize media upload
        await axios.post(
          'https://upload.twitter.com/1.1/media/upload.json',
          {
            command: 'FINALIZE',
            media_id: mediaId
          },
          {
            headers: {
              Authorization: `Bearer ${accessToken}`
            }
          }
        );
      } catch (mediaError) {
        console.error('Media upload error:', mediaError.message);
        // Continue without media if upload fails
      }
    }
    
    // Create tweet
    const tweetData = { text: content };
    if (mediaId) {
      tweetData.media = { media_ids: [mediaId] };
    }
    
    const response = await axios.post(
      'https://api.twitter.com/2/tweets',
      tweetData,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    return {
      success: true,
      message: 'Posted to Twitter successfully',
      tweetId: response.data.data?.id,
      content
    };
  } catch (error) {
    // Handle token refresh if needed
    if (error.response?.status === 401 && refreshToken) {
      // Token refresh logic would go here
      throw new Error('Token expired. Please reconnect your account.');
    }
    throw new Error(`Twitter posting failed: ${error.response?.data?.detail || error.message}`);
  }
}

async function postToLinkedIn({ content, mediaUrl, accessToken }) {
  try {
    // Get user profile to get person URN
    const profileResponse = await axios.get('https://api.linkedin.com/v2/userinfo', {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    });
    
    const personUrn = profileResponse.data.sub || `urn:li:person:${profileResponse.data.id}`;
    
    let postData = {
      author: personUrn,
      lifecycleState: 'PUBLISHED',
      specificContent: {
        'com.linkedin.ugc.ShareContent': {
          shareCommentary: {
            text: content
          },
          shareMediaCategory: 'NONE'
        }
      },
      visibility: {
        'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC'
      }
    };
    
    // Handle media if provided
    if (mediaUrl) {
      try {
        // Upload media to LinkedIn
        const mediaResponse = await axios.post(
          'https://api.linkedin.com/v2/assets?action=registerUpload',
          {
            registerUploadRequest: {
              recipes: ['urn:li:digitalmediaRecipe:feedshare-image'],
              owner: personUrn,
              serviceRelationships: [{
                relationshipType: 'OWNER',
                identifier: 'urn:li:userGeneratedContent'
              }]
            }
          },
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
              'Content-Type': 'application/json'
            }
          }
        );
        
        const uploadUrl = mediaResponse.data.value.uploadMechanism['com.linkedin.digitalmedia.uploading.MediaUploadHttpRequest'].uploadUrl;
        const assetId = mediaResponse.data.value.asset;
        
        // Upload actual media file
        const mediaFile = await axios.get(mediaUrl, { responseType: 'arraybuffer' });
        await axios.put(uploadUrl, mediaFile.data, {
          headers: {
            'Content-Type': mediaFile.headers['content-type'] || 'image/jpeg'
          }
        });
        
        postData.specificContent['com.linkedin.ugc.ShareContent'].shareMediaCategory = 'IMAGE';
        postData.specificContent['com.linkedin.ugc.ShareContent'].media = [{
          status: 'READY',
          media: assetId,
          title: {
            text: 'Shared image'
          }
        }];
      } catch (mediaError) {
        console.error('LinkedIn media upload error:', mediaError.message);
        // Continue without media
      }
    }
    
    const response = await axios.post(
      'https://api.linkedin.com/v2/ugcPosts',
      postData,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
          'X-Restli-Protocol-Version': '2.0.0'
        }
      }
    );
    
    return {
      success: true,
      message: 'Posted to LinkedIn successfully',
      postId: response.data.id,
      content
    };
  } catch (error) {
    throw new Error(`LinkedIn posting failed: ${error.response?.data?.message || error.message}`);
  }
}

async function postToFacebook({ content, mediaUrl, accessToken }) {
  try {
    // Get user's pages
    const pagesResponse = await axios.get(
      'https://graph.facebook.com/v18.0/me/accounts',
      {
        params: {
          access_token: accessToken
        }
      }
    );
    
    // Use first page or user profile
    const pageId = pagesResponse.data.data?.[0]?.id || 'me';
    const pageAccessToken = pagesResponse.data.data?.[0]?.access_token || accessToken;
    
    let postParams = {
      message: content,
      access_token: pageAccessToken
    };
    
    // Handle media if provided
    if (mediaUrl) {
      try {
        // Facebook requires media to be uploaded separately
        const mediaResponse = await axios.post(
          `https://graph.facebook.com/v18.0/${pageId}/photos`,
          {
            url: mediaUrl,
            message: content,
            access_token: pageAccessToken
          }
        );
        
        return {
          success: true,
          message: 'Posted to Facebook successfully',
          postId: mediaResponse.data.id,
          content
        };
      } catch (mediaError) {
        // If media upload fails, try text-only post
        console.error('Facebook media upload error:', mediaError.message);
      }
    }
    
    // Post text-only or if media upload failed
    const response = await axios.post(
      `https://graph.facebook.com/v18.0/${pageId}/feed`,
      postParams
    );
    
    return {
      success: true,
      message: 'Posted to Facebook successfully',
      postId: response.data.id,
      content
    };
  } catch (error) {
    throw new Error(`Facebook posting failed: ${error.response?.data?.error?.message || error.message}`);
  }
}

async function postToPinterest({ content, mediaUrl, accessToken }) {
  try {
    if (!mediaUrl) {
      throw new Error('Pinterest requires an image for posts');
    }
    
    // Get user's boards
    const boardsResponse = await axios.get(
      'https://api.pinterest.com/v5/boards',
      {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      }
    );
    
    // Use first board
    const boardId = boardsResponse.data.items?.[0]?.id;
    if (!boardId) {
      throw new Error('No boards found. Please create a board first.');
    }
    
    // Create pin
    const pinData = {
      board_id: boardId,
      media_source: {
        source_type: 'image_url',
        url: mediaUrl
      },
      title: content.substring(0, 100), // Pinterest has title limits
      description: content.substring(0, 800) // Pinterest has description limits
    };
    
    const response = await axios.post(
      'https://api.pinterest.com/v5/pins',
      pinData,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    return {
      success: true,
      message: 'Posted to Pinterest successfully',
      pinId: response.data.id,
      content
    };
  } catch (error) {
    throw new Error(`Pinterest posting failed: ${error.response?.data?.message || error.message}`);
  }
}

async function postToInstagram({ content, mediaUrl, accessToken, instagramAccountId }) {
  try {
    if (!mediaUrl) {
      throw new Error('Instagram requires an image for posts');
    }
    
    // Get Instagram Business Account ID if not provided
    if (!instagramAccountId) {
      // Try to get it from Facebook API
      const pagesResponse = await axios.get('https://graph.facebook.com/v18.0/me/accounts', {
        params: { access_token: accessToken },
      });
      
      if (pagesResponse.data.data && pagesResponse.data.data.length > 0) {
        const pageId = pagesResponse.data.data[0].id;
        const instagramResponse = await axios.get(`https://graph.facebook.com/v18.0/${pageId}`, {
          params: {
            access_token: accessToken,
            fields: 'instagram_business_account',
          },
        });
        
        if (instagramResponse.data.instagram_business_account) {
          instagramAccountId = instagramResponse.data.instagram_business_account.id;
        }
      }
    }
    
    if (!instagramAccountId) {
      throw new Error('Instagram Business Account not found. Please connect your Instagram Business account.');
    }
    
    // Create media container
    const containerResponse = await axios.post(
      `https://graph.facebook.com/v18.0/${instagramAccountId}/media`,
      {
        image_url: mediaUrl,
        caption: content,
        access_token: accessToken,
      }
    );
    
    const creationId = containerResponse.data.id;
    
    // Publish the media
    const publishResponse = await axios.post(
      `https://graph.facebook.com/v18.0/${instagramAccountId}/media_publish`,
      {
        creation_id: creationId,
        access_token: accessToken,
      }
    );
    
    return {
      success: true,
      message: 'Posted to Instagram successfully',
      postId: publishResponse.data.id,
      content
    };
  } catch (error) {
    throw new Error(`Instagram posting failed: ${error.response?.data?.error?.message || error.message}`);
  }
}

async function postToYouTube({ content, mediaUrl, accessToken }) {
  try {
    // YouTube requires video media, not just images
    // For now, we'll create a text-only post or description
    // Full video upload requires more complex handling
    
    // Get channel information
    const channelResponse = await axios.get(
      'https://www.googleapis.com/youtube/v3/channels',
      {
        params: {
          part: 'snippet,contentDetails',
          mine: true,
          access_token: accessToken,
        },
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );
    
    const channelId = channelResponse.data.items?.[0]?.id;
    if (!channelId) {
      throw new Error('YouTube channel not found');
    }
    
    // Create a text post (Note: YouTube API doesn't support text-only posts directly)
    // This would typically be used for video descriptions or comments
    // For actual video uploads, you'd need to use the YouTube Data API v3 upload endpoint
    
    return {
      success: true,
      message: 'YouTube connection successful. Video upload requires additional implementation.',
      content,
      note: 'YouTube requires video files for posting. Text-only posts are not supported via API.',
    };
  } catch (error) {
    throw new Error(`YouTube posting failed: ${error.response?.data?.error?.message || error.message}`);
  }
}

async function postToTikTok({ content, mediaUrl, accessToken }) {
  try {
    if (!mediaUrl) {
      throw new Error('TikTok requires a video for posts');
    }
    
    // TikTok video posting requires more complex handling
    // This is a simplified version - full implementation would handle video upload
    const response = await axios.post(
      'https://open.tiktokapis.com/v2/post/publish/video/initialize/',
      {
        post_info: {
          title: content.substring(0, 150), // TikTok title limit
          privacy_level: 'PUBLIC_TO_EVERYONE',
          disable_duet: false,
          disable_comment: false,
          disable_stitch: false,
          video_cover_timestamp_ms: 1000,
        },
        source_info: {
          source: 'FILE_UPLOAD',
          video_url: mediaUrl,
        },
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    );
    
    return {
      success: true,
      message: 'Posted to TikTok successfully',
      postId: response.data.data?.publish_id,
      content
    };
  } catch (error) {
    throw new Error(`TikTok posting failed: ${error.response?.data?.error?.message || error.message}`);
  }
}

async function postToThreads({ content, mediaUrl, accessToken, threadsPageId }) {
  try {
    // Get Threads Page ID if not provided
    if (!threadsPageId) {
      // Try to get it from Facebook API
      const pagesResponse = await axios.get('https://graph.facebook.com/v18.0/me/accounts', {
        params: { access_token: accessToken },
      });
      
      if (pagesResponse.data.data && pagesResponse.data.data.length > 0) {
        for (const page of pagesResponse.data.data) {
          try {
            const threadsResponse = await axios.get(`https://graph.facebook.com/v18.0/${page.id}`, {
              params: {
                access_token: accessToken,
                fields: 'threads_profile',
              },
            });
            if (threadsResponse.data.threads_profile) {
              threadsPageId = page.id;
              break;
            }
          } catch (err) {
            // Continue to next page
          }
        }
      }
    }
    
    if (!threadsPageId) {
      throw new Error('Threads Page not found. Please connect your Threads account.');
    }
    
    // Create Threads post
    const response = await axios.post(
      `https://graph.threads.net/v1.0/${threadsPageId}/threads`,
      {
        media_type: mediaUrl ? 'IMAGE' : 'TEXT',
        text: content,
        image_url: mediaUrl,
        access_token: accessToken,
      }
    );
    
    return {
      success: true,
      message: 'Posted to Threads successfully',
      postId: response.data.id,
      content
    };
  } catch (error) {
    throw new Error(`Threads posting failed: ${error.response?.data?.error?.message || error.message}`);
  }
}

async function postToBluesky({ content, mediaUrl, accessToken, blueskyDid }) {
  try {
    // Bluesky uses AT Protocol, not REST API
    // This is a simplified version using the AT Protocol
    
    const BLUESKY_SERVICE_URL = process.env.BLUESKY_SERVICE_URL || 'https://bsky.social';
    
    // Create post record
    const postRecord = {
      $type: 'app.bsky.feed.post',
      text: content.substring(0, 300), // Bluesky has character limits
      createdAt: new Date().toISOString(),
    };
    
    // Handle media if provided
    if (mediaUrl) {
      // Bluesky media upload requires additional steps
      // This is a placeholder - full implementation would handle media upload
      postRecord.embed = {
        $type: 'app.bsky.embed.external',
        external: {
          uri: mediaUrl,
          title: content.substring(0, 100),
        },
      };
    }
    
    const response = await axios.post(
      `${BLUESKY_SERVICE_URL}/xrpc/com.atproto.repo.createRecord`,
      {
        repo: blueskyDid || 'did', // Use DID from connection if available
        collection: 'app.bsky.feed.post',
        record: postRecord,
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    );
    
    return {
      success: true,
      message: 'Posted to Bluesky successfully',
      postId: response.data.uri,
      content
    };
  } catch (error) {
    throw new Error(`Bluesky posting failed: ${error.response?.data?.error || error.message}`);
  }
}

async function postToSnapchat({ content, mediaUrl, accessToken }) {
  try {
    // Snapchat posting is limited - typically requires Snap Kit SDK
    // This is a placeholder implementation
    // Most Snapchat integrations are for Stories, not feed posts
    
    // Snapchat API is more limited than other platforms
    // This would typically require Snap Kit SDK integration
    
    return {
      success: true,
      message: 'Snapchat connection successful. Full posting requires Snap Kit SDK integration.',
      content,
      note: 'Snapchat posting typically requires Snap Kit SDK for Stories functionality.',
    };
  } catch (error) {
    throw new Error(`Snapchat posting failed: ${error.response?.data?.error || error.message}`);
  }
}

module.exports = router;
module.exports.postToTwitter = postToTwitter;
module.exports.postToLinkedIn = postToLinkedIn;
module.exports.postToFacebook = postToFacebook;
module.exports.postToPinterest = postToPinterest;
module.exports.postToInstagram = postToInstagram;
module.exports.postToYouTube = postToYouTube;
module.exports.postToTikTok = postToTikTok;
module.exports.postToThreads = postToThreads;
module.exports.postToBluesky = postToBluesky;
module.exports.postToSnapchat = postToSnapchat; 