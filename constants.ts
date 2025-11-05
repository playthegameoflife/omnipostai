
import { Platform, type PlatformConfig } from './types';
import { FacebookIcon, InstagramIcon, LinkedInIcon, TikTokIcon, YouTubeIcon, SnapchatIcon, XIcon, PinterestIcon, ThreadsIcon, BlueskyIcon } from './components/icons';

export const PLATFORM_DATA: PlatformConfig[] = [
  { 
    name: Platform.Facebook, 
    icon: FacebookIcon, 
    color: 'bg-brand-facebook', 
    description: 'Casual & engaging posts for a broad audience.'
  },
  { 
    name: Platform.Instagram, 
    icon: InstagramIcon, 
    color: 'bg-brand-instagram',
    description: 'Visually-driven captions with popular hashtags.'
  },
  { 
    name: Platform.LinkedIn, 
    icon: LinkedInIcon, 
    color: 'bg-brand-linkedin',
    description: 'Professional content for your business network.'
  },
  { 
    name: Platform.TikTok, 
    icon: TikTokIcon, 
    color: 'bg-brand-tiktok',
    description: 'Short, punchy captions for viral video content.'
  },
  { 
    name: Platform.YouTube, 
    icon: YouTubeIcon, 
    color: 'bg-brand-youtube',
    description: 'Catchy titles and detailed video descriptions.'
  },
  { 
    name: Platform.Snapchat, 
    icon: SnapchatIcon, 
    color: 'bg-brand-snapchat',
    description: 'Short, fun, and informal captions for snaps.'
  },
  { 
    name: Platform.X, 
    icon: XIcon, 
    color: 'bg-brand-x', 
    description: 'Short, impactful posts for a fast-paced feed.'
  },
  { 
    name: Platform.Pinterest, 
    icon: PinterestIcon, 
    color: 'bg-brand-pinterest',
    description: 'Keyword-rich descriptions for visual pins.'
  },
  { 
    name: Platform.Threads, 
    icon: ThreadsIcon, 
    color: 'bg-brand-threads',
    description: 'Conversational posts to engage your community.'
  },
  { 
    name: Platform.Bluesky, 
    icon: BlueskyIcon, 
    color: 'bg-brand-bluesky',
    description: 'Short, conversational posts for a decentralized feed.'
  },
];