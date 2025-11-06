# Complete Setup Guide for OmniPost AI

This guide will walk you through setting up OmniPost AI from scratch. Follow these steps in order to get your application running.

## Prerequisites

- Node.js 18+ installed ([Download](https://nodejs.org/))
- npm or yarn package manager
- A code editor (VS Code recommended)
- Git (if cloning from repository)

## Step 1: Clone/Download the Project

If you haven't already, download or clone the project to your local machine.

## Step 2: Install Dependencies

```bash
# Install all dependencies (frontend and backend)
npm run install-all

# Or install separately:
npm install                    # Frontend dependencies
cd backend && npm install      # Backend dependencies
```

## Step 3: Firebase Setup

1. **Create a Firebase Project**
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Click "Add project"
   - Enter a project name and follow the setup wizard

2. **Enable Firestore Database**
   - In Firebase Console, go to "Firestore Database"
   - Click "Create database"
   - Start in **production mode** (you can add security rules later)
   - Choose a location for your database

3. **Enable Authentication**
   - Go to "Authentication" in Firebase Console
   - Click "Get started"
   - Enable "Email/Password" sign-in method

4. **Enable Storage (Optional - for media uploads)**
   - Go to "Storage" in Firebase Console
   - Click "Get started"
   - Use default security rules for now

5. **Download Service Account Key**
   - Go to Project Settings (gear icon) > Service Accounts
   - Click "Generate new private key"
   - Save the JSON file to `backend/` directory
   - **Important**: The filename should match what's in `backend/firebase.js`
     - Default filename: `promptifyai-6j2zl-firebase-adminsdk-fbsvc-d667afb62b.json`
     - Or update `backend/firebase.js` to use your filename

## Step 4: Google Gemini AI Setup

1. **Get API Key**
   - Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
   - Sign in with your Google account
   - Click "Create API Key"
   - Copy your API key

2. **Configure Frontend Environment**
   ```bash
   # Copy the example file
   cp env.example.frontend .env
   
   # Edit .env and add your API key
   GEMINI_API_KEY=your_actual_api_key_here
   ```

## Step 5: Social Media OAuth Setup

You need to create OAuth applications for each platform you want to connect. For each platform:

### X/Twitter Setup

1. **Create Twitter Developer Account**
   - Go to [Twitter Developer Portal](https://developer.twitter.com/en/portal/dashboard)
   - Apply for a developer account (if you don't have one)
   - Create a new app

2. **Configure OAuth 2.0**
   - Go to your app settings
   - Enable OAuth 2.0
   - Set callback URL: `http://localhost:5001/api/auth/x/callback`
   - For production: `https://yourdomain.com/api/auth/x/callback`
   - Request these scopes: `tweet.read`, `tweet.write`, `users.read`, `offline.access`

3. **Get Credentials**
   - Copy Client ID and Client Secret
   - Add to backend `.env` file

### Facebook Setup

1. **Create Facebook App**
   - Go to [Facebook Developers](https://developers.facebook.com/)
   - Click "My Apps" > "Create App"
   - Choose "Business" type

2. **Add Facebook Login**
   - Go to "Add Products"
   - Add "Facebook Login"
   - Configure OAuth redirect URI: `http://localhost:5001/api/auth/facebook/callback`

3. **Get App Credentials**
   - Go to Settings > Basic
   - Copy App ID and App Secret
   - Add to backend `.env` file

### LinkedIn Setup

1. **Create LinkedIn App**
   - Go to [LinkedIn Developers](https://www.linkedin.com/developers/)
   - Click "Create app"
   - Fill in app details

2. **Configure OAuth**
   - Go to "Auth" tab
   - Add redirect URL: `http://localhost:5001/api/auth/linkedin/callback`
   - Request these products: `Sign In with LinkedIn`, `Share on LinkedIn`
   - Request scopes: `r_liteprofile`, `r_emailaddress`, `w_member_social`

3. **Get Credentials**
   - Copy Client ID and Client Secret
   - Add to backend `.env` file

### Pinterest Setup

1. **Create Pinterest App**
   - Go to [Pinterest Developers](https://developers.pinterest.com/)
   - Create a new app

2. **Configure OAuth**
   - Set redirect URI: `http://localhost:5001/api/auth/pinterest/callback`
   - Request scopes: `read_public`, `write_public`

3. **Get Credentials**
   - Copy App ID and App Secret
   - Add to backend `.env` file

### Instagram Setup

1. **Create Facebook App** (if not already created)
   - Instagram uses Facebook Graph API
   - Go to [Facebook Developers](https://developers.facebook.com/)
   - Create a new app or use existing Facebook app

2. **Configure Instagram Product**
   - Add "Instagram Graph API" product to your app
   - Configure OAuth redirect URI: `http://localhost:5001/api/auth/instagram/callback`
   - Request scopes: `instagram_basic`, `instagram_content_publish`, `pages_show_list`, `pages_read_engagement`

3. **Get Credentials**
   - Use same Client ID and Client Secret as Facebook app
   - Or create separate credentials if needed
   - Add to backend `.env` file

**Note**: Instagram requires an Instagram Business account connected to a Facebook Page.

### YouTube Setup

1. **Create Google Cloud Project**
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select existing one

2. **Enable YouTube Data API**
   - Go to APIs & Services > Library
   - Search for "YouTube Data API v3"
   - Click Enable

3. **Create OAuth 2.0 Credentials**
   - Go to APIs & Services > Credentials
   - Click "Create Credentials" > "OAuth client ID"
   - Choose "Web application"
   - Set redirect URI: `http://localhost:5001/api/auth/youtube/callback`
   - Request scopes: `https://www.googleapis.com/auth/youtube.upload`, `https://www.googleapis.com/auth/youtube.readonly`

4. **Get Credentials**
   - Copy Client ID and Client Secret
   - Add to backend `.env` file

### TikTok Setup

1. **Create TikTok App**
   - Go to [TikTok Developers](https://developers.tiktok.com/)
   - Create a new app

2. **Configure OAuth**
   - Set redirect URI: `http://localhost:5001/api/auth/tiktok/callback`
   - Request scopes: `user.info.basic`, `video.upload`, `video.publish`

3. **Get Credentials**
   - Copy Client Key and Client Secret
   - Add to backend `.env` file

### Threads Setup

1. **Create Facebook App** (if not already created)
   - Threads uses Meta/Facebook Graph API
   - Go to [Facebook Developers](https://developers.facebook.com/)
   - Create a new app or use existing Facebook app

2. **Configure Threads Product**
   - Add "Threads API" product to your app
   - Configure OAuth redirect URI: `http://localhost:5001/api/auth/threads/callback`
   - Request scopes: `threads_basic`, `threads_content_publish`, `pages_show_list`

3. **Get Credentials**
   - Use same Client ID and Client Secret as Facebook app
   - Or create separate credentials if needed
   - Add to backend `.env` file

**Note**: Threads requires a Threads account connected to a Facebook Page.

### Bluesky Setup

1. **Bluesky uses AT Protocol, not traditional OAuth**
   - Users will need to provide their Bluesky handle and app password
   - Go to [Bluesky](https://bsky.app/) and create an account
   - Generate an app password in account settings

2. **Configure Bluesky**
   - Set `BLUESKY_SERVICE_URL=https://bsky.social` in backend `.env`
   - Connection will be handled through app password authentication

**Note**: Bluesky requires users to manually enter their handle and app password.

### Snapchat Setup

1. **Create Snapchat App**
   - Go to [Snapchat Developers](https://developers.snapchat.com/)
   - Create a new app

2. **Configure OAuth**
   - Set redirect URI: `http://localhost:5001/api/auth/snapchat/callback`
   - Request scopes: `user.bitmoji`, `user.display_name`, `user.external_id`

3. **Get Credentials**
   - Copy Client ID and Client Secret
   - Add to backend `.env` file

**Note**: Snapchat posting is limited and typically requires Snap Kit SDK for full functionality.

## Step 6: Configure Backend Environment

1. **Copy Environment Template**
   ```bash
   cd backend
   cp env.example.backend .env
   ```

2. **Edit `.env` file** with all your credentials:
   ```env
   PORT=5001
   
   # Firebase (already configured via service account key file)
   
   # X/Twitter
   X_CLIENT_ID=your_x_client_id
   X_CLIENT_SECRET=your_x_client_secret
   X_REDIRECT_URI=http://localhost:5001/api/auth/x/callback
   
   # Facebook
   FACEBOOK_CLIENT_ID=your_facebook_client_id
   FACEBOOK_CLIENT_SECRET=your_facebook_client_secret
   FACEBOOK_REDIRECT_URI=http://localhost:5001/api/auth/facebook/callback
   
   # LinkedIn
   LINKEDIN_CLIENT_ID=your_linkedin_client_id
   LINKEDIN_CLIENT_SECRET=your_linkedin_client_secret
   LINKEDIN_REDIRECT_URI=http://localhost:5001/api/auth/linkedin/callback
   
   # Pinterest
   PINTEREST_CLIENT_ID=your_pinterest_client_id
   PINTEREST_CLIENT_SECRET=your_pinterest_client_secret
   PINTEREST_REDIRECT_URI=http://localhost:5001/api/auth/pinterest/callback
   
   # Instagram (uses Facebook app credentials)
   INSTAGRAM_CLIENT_ID=your_facebook_client_id
   INSTAGRAM_CLIENT_SECRET=your_facebook_client_secret
   INSTAGRAM_REDIRECT_URI=http://localhost:5001/api/auth/instagram/callback
   
   # YouTube
   YOUTUBE_CLIENT_ID=your_youtube_client_id
   YOUTUBE_CLIENT_SECRET=your_youtube_client_secret
   YOUTUBE_REDIRECT_URI=http://localhost:5001/api/auth/youtube/callback
   
   # TikTok
   TIKTOK_CLIENT_KEY=your_tiktok_client_key
   TIKTOK_CLIENT_SECRET=your_tiktok_client_secret
   TIKTOK_REDIRECT_URI=http://localhost:5001/api/auth/tiktok/callback
   
   # Threads (uses Facebook app credentials)
   THREADS_CLIENT_ID=your_facebook_client_id
   THREADS_CLIENT_SECRET=your_facebook_client_secret
   THREADS_REDIRECT_URI=http://localhost:5001/api/auth/threads/callback
   
   # Bluesky
   BLUESKY_SERVICE_URL=https://bsky.social
   
   # Snapchat
   SNAPCHAT_CLIENT_ID=your_snapchat_client_id
   SNAPCHAT_CLIENT_SECRET=your_snapchat_client_secret
   SNAPCHAT_REDIRECT_URI=http://localhost:5001/api/auth/snapchat/callback
   ```

## Step 7: Start the Application

### Option 1: Start Both Servers (Recommended)
```bash
# From project root
npm start
```

This will start:
- Frontend on `http://localhost:5173`
- Backend on `http://localhost:5001`

### Option 2: Start Separately
```bash
# Terminal 1 - Frontend
npm run dev

# Terminal 2 - Backend
npm run backend
```

## Step 8: Test the Setup

1. **Open the application**
   - Navigate to `http://localhost:5173`

2. **Create an account**
   - Click "Sign Up"
   - Create a new account with email/password

3. **Connect a social account**
   - Go to Dashboard
   - Click "Connect" on any platform
   - Complete OAuth flow
   - Verify connection appears

4. **Test AI features**
   - Try "Content Ideation" to generate post ideas
   - Create a post and test hashtag generation

5. **Test scheduling**
   - Create a post
   - Schedule it for a future time
   - Verify it appears in Content Calendar

## Troubleshooting

### Common Issues

**1. Firebase Connection Error**
- Verify service account key file is in `backend/` directory
- Check filename matches what's in `backend/firebase.js`
- Verify Firestore is enabled in Firebase Console

**2. OAuth Errors**
- Verify redirect URIs match exactly (including http/https)
- Check that OAuth apps are configured correctly
- Ensure environment variables are set correctly

**3. Gemini AI Not Working**
- Verify `GEMINI_API_KEY` is set in `.env` file
- Check API key is valid at [Google AI Studio](https://makersuite.google.com/app/apikey)
- Ensure API key has proper permissions

**4. Port Already in Use**
- Change `PORT` in backend `.env` file
- Or stop the process using the port

**5. CORS Errors**
- Backend CORS is configured to allow all origins in development
- For production, update CORS settings in `backend/index.js`

## Production Deployment

### Before Deploying

1. **Update Redirect URIs**
   - Update all OAuth redirect URIs to use production domain
   - Update `X_REDIRECT_URI`, `FACEBOOK_REDIRECT_URI`, etc. in backend `.env`

2. **Firebase Security Rules**
   - Set up proper Firestore security rules
   - Configure Storage security rules if using media uploads

3. **Environment Variables**
   - Use environment variables on your hosting platform
   - Never commit `.env` files to version control

4. **HTTPS**
   - Ensure your production site uses HTTPS
   - OAuth requires HTTPS in production

### Recommended Hosting

- **Frontend**: Vercel, Netlify, or similar
- **Backend**: Heroku, Railway, DigitalOcean, or AWS
- **Database**: Firebase Firestore (already configured)

## Security Best Practices

1. **Never commit `.env` files** - They contain sensitive credentials
2. **Use environment variables** in production
3. **Rotate API keys** regularly
4. **Set up Firebase security rules** properly
5. **Enable HTTPS** in production
6. **Keep dependencies updated** - Run `npm audit` regularly

## Additional Resources

- [Firebase Documentation](https://firebase.google.com/docs)
- [Google Gemini AI Documentation](https://ai.google.dev/docs)
- [X/Twitter API Documentation](https://developer.twitter.com/en/docs)
- [Facebook Graph API](https://developers.facebook.com/docs/graph-api)
- [LinkedIn API Documentation](https://docs.microsoft.com/en-us/linkedin/)
- [Pinterest API Documentation](https://developers.pinterest.com/docs/api/v5/)

## Support

If you encounter issues:
1. Check this guide first
2. Review error messages in browser console and server logs
3. Verify all environment variables are set correctly
4. Ensure all OAuth apps are properly configured

---

**Setup Complete!** 🎉

You should now have a fully functional OmniPost AI application. Start creating and scheduling your social media content!

