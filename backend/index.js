const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const authenticateToken = require('./middleware/auth');

// Health check route
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    services: {
      firebase: 'connected',
      database: 'firestore'
    }
  });
});

const authRouter = require('./routes/auth');
app.use('/api/auth', authRouter);

const xRouter = require('./routes/x');
app.use('/api/auth/x', xRouter);

const connectionsRouter = require('./routes/connections');
app.use('/api/connections', authenticateToken, connectionsRouter);

const postRouter = require('./routes/post');
app.use('/api/post', authenticateToken, postRouter);

const scheduleRouter = require('./routes/schedule');
app.use('/api/schedule', authenticateToken, scheduleRouter);

const linkedinRouter = require('./routes/linkedin');
app.use('/api/auth/linkedin', linkedinRouter);

const pinterestRouter = require('./routes/pinterest');
app.use('/api/auth/pinterest', pinterestRouter);

const facebookRouter = require('./routes/facebook');
app.use('/api/auth/facebook', facebookRouter);

const instagramRouter = require('./routes/instagram');
app.use('/api/auth/instagram', instagramRouter);

const youtubeRouter = require('./routes/youtube');
app.use('/api/auth/youtube', youtubeRouter);

const tiktokRouter = require('./routes/tiktok');
app.use('/api/auth/tiktok', tiktokRouter);

const threadsRouter = require('./routes/threads');
app.use('/api/auth/threads', threadsRouter);

const blueskyRouter = require('./routes/bluesky');
app.use('/api/auth/bluesky', blueskyRouter);

const snapchatRouter = require('./routes/snapchat');
app.use('/api/auth/snapchat', snapchatRouter);

const analyticsRouter = require('./routes/analytics');
app.use('/api/analytics', authenticateToken, analyticsRouter);

const uploadRouter = require('./routes/upload');
app.use('/api/upload', uploadRouter);

const contactRouter = require('./routes/contact');
app.use('/api/contact', contactRouter);

const paymentRouter = require('./routes/payment');
app.use('/api/payment', paymentRouter);

// Start scheduler
require('./scheduler');

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log('Scheduler started - checking for scheduled posts every minute');
}); 