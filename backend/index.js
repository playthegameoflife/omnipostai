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
app.use('/api/post', postRouter);

const scheduleRouter = require('./routes/schedule');
app.use('/api/schedule', authenticateToken, scheduleRouter);

const linkedinRouter = require('./routes/linkedin');
app.use('/api/auth/linkedin', linkedinRouter);

const pinterestRouter = require('./routes/pinterest');
app.use('/api/auth/pinterest', pinterestRouter);

const facebookRouter = require('./routes/facebook');
app.use('/api/auth/facebook', facebookRouter);

const analyticsRouter = require('./routes/analytics');
app.use('/api/analytics', authenticateToken, analyticsRouter);

// Placeholder for auth routes
// ...

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 