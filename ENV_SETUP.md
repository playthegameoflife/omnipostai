# Environment Variables Setup Guide

This guide will help you configure all required environment variables for OmniPost AI.

## Frontend Setup

1. Copy the example environment file:
   ```bash
   cp .env.example .env
   ```

2. Update `.env` with your actual values:
   - `GEMINI_API_KEY`: Get from [Google AI Studio](https://makersuite.google.com/app/apikey)

## Backend Setup

1. Copy the example environment file:
   ```bash
   cd backend
   cp .env.example .env
   ```

2. Update `.env` with your actual values:

### Required Configuration

#### Firebase Setup
1. Create a Firebase project at [Firebase Console](https://console.firebase.google.com/)
2. Enable Firestore Database
3. Enable Authentication (Email/Password)
4. Enable Storage (for media uploads)
5. Download service account key:
   - Go to Project Settings > Service Accounts
   - Click "Generate New Private Key"
   - Save the JSON file as `promptifyai-6j2zl-firebase-adminsdk-fbsvc-d667afb62b.json` in the `backend/` directory
   - Or update the filename in `backend/firebase.js` to match your file

#### Social Media API Keys

**X/Twitter:**
1. Create a Twitter Developer account at [developer.twitter.com](https://developer.twitter.com/)
2. Create a new app and generate API keys
3. Set up OAuth 2.0 with callback URL: `http://localhost:5001/api/auth/x/callback`

**Facebook:**
1. Create a Facebook App at [developers.facebook.com](https://developers.facebook.com/)
2. Add Facebook Login product
3. Configure OAuth redirect URI: `http://localhost:5001/api/auth/facebook/callback`
4. Get App ID and App Secret

**LinkedIn:**
1. Create a LinkedIn App at [developer.linkedin.com](https://www.linkedin.com/developers/)
2. Configure OAuth 2.0 redirect URL: `http://localhost:5001/api/auth/linkedin/callback`
3. Request necessary permissions (r_liteprofile, r_emailaddress, w_member_social)

**Pinterest:**
1. Create a Pinterest app at [developers.pinterest.com](https://developers.pinterest.com/)
2. Configure OAuth redirect URI: `http://localhost:5001/api/auth/pinterest/callback`
3. Get App ID and App Secret

### Optional Configuration

#### Email Service (for contact form)
You can use any email service provider:
- SendGrid: Get API key from [sendgrid.com](https://sendgrid.com/)
- Mailgun: Get API key from [mailgun.com](https://www.mailgun.com/)
- AWS SES: Configure AWS credentials

Set `EMAIL_SERVICE_URL` and `EMAIL_API_KEY` accordingly.

## Production Deployment

For production deployment, update:
- All redirect URIs to use your production domain
- Firebase service account key path
- Email service configuration
- CORS settings in backend if needed

## Security Notes

- Never commit `.env` files to version control
- Keep API keys secure and rotate them regularly
- Use environment-specific configurations for development and production
- Consider using a secrets management service for production


