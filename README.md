# OmniPost AI - Social Media Management Platform

A modern, Buffer-like social media management platform built with React, TypeScript, and Node.js. Features AI-powered content generation, multi-platform scheduling, analytics, and a beautiful responsive UI.

## 🚀 Features

### Core Functionality
- **Multi-Platform Social Media Management**: Support for Facebook, Twitter/X, LinkedIn, and Pinterest
- **AI-Powered Content Generation**: Uses Google Gemini AI for content ideation and hashtag generation
- **Smart Post Scheduling**: Schedule posts across multiple platforms with custom timing
- **Content Calendar**: Visual calendar interface for managing scheduled content
- **Analytics Dashboard**: Track post performance and engagement metrics
- **User Authentication**: Secure Firebase-based authentication system

### AI Features
- **Content Ideation**: Generate post ideas based on topics using AI
- **Hashtag Generation**: AI-powered hashtag suggestions for each platform
- **Multi-Platform Content Adaptation**: Automatically adapt content for different social media platforms
- **Smart Content Optimization**: Platform-specific guidelines and best practices

### User Experience
- **Buffer-like Design**: Clean, modern interface inspired by Buffer.com
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile
- **Real-time Updates**: Live updates for scheduled posts and analytics
- **Toast Notifications**: User-friendly feedback for all actions
- **Loading States**: Smooth loading indicators throughout the app

## 🛠️ Tech Stack

### Frontend
- **React 19** with TypeScript
- **Tailwind CSS v4** for styling
- **React Router** for navigation
- **Firebase Client SDK** for authentication
- **Google Gemini AI** for content generation

### Backend
- **Node.js** with Express
- **Firebase Admin SDK** for server-side operations
- **Firestore** for data storage
- **OAuth Integration** for social media platforms
- **CORS** enabled for cross-origin requests

### Social Media APIs
- **Twitter/X API** for posting and analytics
- **Facebook Graph API** for page management
- **LinkedIn API** for professional networking
- **Pinterest API** for pin management

## 📦 Installation

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Firebase project with Firestore enabled
- Google Gemini AI API key
- Social media platform API credentials

### Frontend Setup
```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Add your GEMINI_API_KEY to .env

# Start development server
npm run dev
```

### Backend Setup
```bash
cd backend

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Add your Firebase service account key and API keys

# Start backend server
npm start
```

## 🔧 Configuration

### Environment Variables

**Frontend (.env)**
```
GEMINI_API_KEY=your_gemini_api_key_here
```

**Backend (.env)**
```
PORT=5001
FIREBASE_PROJECT_ID=your_project_id
TWITTER_API_KEY=your_twitter_api_key
TWITTER_API_SECRET=your_twitter_api_secret
FACEBOOK_APP_ID=your_facebook_app_id
FACEBOOK_APP_SECRET=your_facebook_app_secret
LINKEDIN_CLIENT_ID=your_linkedin_client_id
LINKEDIN_CLIENT_SECRET=your_linkedin_client_secret
PINTEREST_APP_ID=your_pinterest_app_id
PINTEREST_APP_SECRET=your_pinterest_app_secret
```

### Firebase Setup
1. Create a Firebase project
2. Enable Firestore database
3. Set up Authentication (Email/Password)
4. Download service account key and place in `backend/` directory
5. Update `firebase.js` with correct service account file name

## 🚀 Usage

### Getting Started
1. **Sign Up/Login**: Create an account or log in with existing credentials
2. **Connect Social Accounts**: Link your social media profiles through OAuth
3. **Generate Content**: Use AI to generate post ideas and hashtags
4. **Schedule Posts**: Create and schedule content across multiple platforms
5. **Monitor Analytics**: Track performance and engagement metrics

### Content Creation Workflow
1. **Content Ideation**: Enter a topic and let AI generate post ideas
2. **Platform Selection**: Choose which social media platforms to post to
3. **Content Customization**: Edit AI-generated content for each platform
4. **Hashtag Generation**: Get platform-specific hashtag suggestions
5. **Scheduling**: Set the date and time for your posts
6. **Review & Publish**: Preview and schedule your content

### Analytics & Insights
- **Post Performance**: Track likes, shares, comments, and engagement rates
- **Platform Analytics**: Compare performance across different social media platforms
- **Monthly Trends**: View posting patterns and engagement trends
- **Top Content**: Identify your best-performing posts

## 📱 Platform Support

### Currently Supported
- **Facebook**: Page posts, engagement tracking
- **Twitter/X**: Tweets, thread support, hashtag optimization
- **LinkedIn**: Professional posts, company page management
- **Pinterest**: Pin creation, board management

### Coming Soon
- **Instagram**: Stories, Reels, and feed posts
- **TikTok**: Video content and trending hashtags
- **YouTube**: Video descriptions and thumbnails
- **Snapchat**: Story content and filters

## 🔒 Security Features

- **Firebase Authentication**: Secure user authentication and session management
- **OAuth 2.0**: Secure social media platform connections
- **JWT Tokens**: Secure API communication
- **CORS Protection**: Cross-origin request security
- **Input Validation**: Server-side validation for all user inputs

## 📊 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout

### Social Media Connections
- `GET /api/connections` - Get user's connected accounts
- `DELETE /api/connections/:platform` - Disconnect social account

### OAuth Routes
- `GET /api/auth/:platform/connect` - Initiate OAuth flow
- `GET /api/auth/:platform/callback` - OAuth callback handler

### Content Management
- `POST /api/schedule` - Schedule a new post
- `GET /api/schedule` - Get scheduled posts
- `DELETE /api/schedule/:id` - Delete scheduled post

### Analytics
- `GET /api/analytics` - Get user analytics data

## 🎨 UI Components

### Core Components
- **Header**: Navigation and user menu
- **Dashboard**: Main workspace with all features
- **ContentCalendar**: Visual calendar for scheduled posts
- **Analytics**: Performance metrics and insights
- **SocialPostForm**: Advanced post creation interface
- **ContentIdeation**: AI-powered content generation
- **PlatformCard**: Social media platform management

### Design System
- **Color Palette**: Buffer-inspired colors with purple accents
- **Typography**: Clean, readable fonts
- **Spacing**: Consistent spacing system
- **Responsive**: Mobile-first design approach
- **Dark Mode**: Modern dark theme throughout

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Buffer.com** for design inspiration
- **Google Gemini AI** for content generation capabilities
- **Firebase** for authentication and database services
- **Tailwind CSS** for the styling framework

## 📞 Support

For support, email support@omnipost-ai.com or create an issue in this repository.

---

**OmniPost AI** - Making social media management smarter and more efficient with AI-powered tools.
