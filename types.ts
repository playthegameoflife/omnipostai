
import type React from 'react';

export enum Platform {
  Facebook = 'Facebook',
  Instagram = 'Instagram',
  LinkedIn = 'LinkedIn',
  TikTok = 'TikTok',
  YouTube = 'YouTube',
  Snapchat = 'Snapchat',
  X = 'X',
  Pinterest = 'Pinterest',
  Threads = 'Threads',
  Bluesky = 'Bluesky',
}

export enum ContentType {
  Text = 'Text',
  Image = 'Image',
  Video = 'Video',
}

export interface BaseContent {
  description: string; // The core text, or a description of the media
  assetUrl?: string; // URL for image or video
  assetFile?: File; // For direct file uploads
  assetPreview?: string; // For client-side preview of uploaded file
  assetMimeType?: string;
  assetData?: string; // base64 encoded data
}

export interface PlatformConfig {
  name: Platform;
  icon: React.FC<{ className?: string }>;
  color: string;
  description: string;
}

export type PlatformContent = {
  [key in Platform]?: string;
};

export type GeneratedPosts = {
  [key: string]: string;
};

export enum PostStatus {
  Pending = 'pending',
  Sent = 'sent',
  Failed = 'failed'
}

export interface ScheduledPost {
  id: string;
  scheduledAt: string; // ISO string
  contentType: ContentType;
  baseContent: {
    description: string;
    assetPreview?: string;
    assetUrl?: string;
  };
  platformContent: PlatformContent;
  selectedPlatforms: Platform[];
  status?: PostStatus;
  error?: string;
  retryCount?: number;
  sentAt?: string;
  postId?: string;
}
