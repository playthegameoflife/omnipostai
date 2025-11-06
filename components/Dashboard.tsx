import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ContentCalendar from './ContentCalendar';
import Analytics from './Analytics';
import ContentIdeation from './ContentIdeation';
import { SocialPostForm } from './SocialPostForm';
import { ScheduledPost, Platform, ContentType, PostStatus } from '../types';
import PlatformCard from './PlatformCard';
import { PLATFORM_DATA } from '../constants';
import Spinner from './Spinner';
import EmptyState from './EmptyState';
import { useOnboarding } from '../hooks/useOnboarding';



const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [content, setContent] = useState('');
  const [posts, setPosts] = useState<ScheduledPost[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [connections, setConnections] = useState<{ platform: Platform }[]>([]);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [loadingPlatform, setLoadingPlatform] = useState<Platform | null>(null);
  const { markAccountConnected, markPostCreated, markPostScheduled, progress } = useOnboarding();
  const [expandedSections, setExpandedSections] = useState<{
    connections: boolean;
    ideation: boolean;
    create: boolean;
    calendar: boolean;
    analytics: boolean;
  }>({
    connections: true,
    ideation: true,
    create: true,
    calendar: !progress.onboardingComplete,
    analytics: !progress.onboardingComplete,
  });

  useEffect(() => {
    if (!localStorage.getItem('token')) {
      navigate('/login');
    }
  }, [navigate]);

  const mapBackendPost = (post: any): ScheduledPost => {
    // Handle Firestore Timestamp conversion
    let scheduledAt: string;
    if (post.scheduledAt?.toDate) {
      // Firestore Timestamp
      scheduledAt = post.scheduledAt.toDate().toISOString();
    } else if (post.scheduledAt?.seconds) {
      // Firestore Timestamp as object
      scheduledAt = new Date(post.scheduledAt.seconds * 1000).toISOString();
    } else if (typeof post.scheduledAt === 'string') {
      // ISO string
      scheduledAt = post.scheduledAt;
    } else {
      scheduledAt = new Date().toISOString();
    }
    
    let sentAt: string | undefined;
    if (post.sentAt?.toDate) {
      sentAt = post.sentAt.toDate().toISOString();
    } else if (post.sentAt?.seconds) {
      sentAt = new Date(post.sentAt.seconds * 1000).toISOString();
    } else if (typeof post.sentAt === 'string') {
      sentAt = post.sentAt;
    }
    
    return {
      id: post.id,
      scheduledAt,
      contentType: ContentType.Text,
      baseContent: { 
        description: post.content || '',
        assetUrl: post.mediaUrl || undefined
      },
      platformContent: { [post.platform]: post.content || '' },
      selectedPlatforms: [post.platform as Platform],
      status: (post.status as PostStatus) || PostStatus.Pending,
      error: post.error,
      retryCount: post.retryCount || 0,
      sentAt,
      postId: post.postId,
    };
  };

  const fetchPosts = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/backend/api/schedule', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to fetch posts');
      const data = await res.json();
      setPosts(data.map(mapBackendPost));
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchConnections = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/backend/api/connections', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to fetch connections');
      const data = await res.json();
      setConnections(data);
    } catch (err) {
      // Optionally handle error
    }
  };

  useEffect(() => {
    fetchPosts();
    fetchConnections();
  }, []);

  const schedulePost = async (postData: { 
    platforms?: string[]; 
    platform?: string;
    platformContent?: Record<string, string>;
    content: string; 
    mediaUrl?: string | null;
    scheduledAt: string;
  }) => {
    setError(null);
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/backend/api/schedule', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(postData),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to schedule post');
      }
      setToast({ message: 'Post scheduled successfully!', type: 'success' });
      markPostScheduled();
      fetchPosts();
    } catch (err: any) {
      setError(err.message);
      setToast({ message: err.message, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    // This function is kept for compatibility but the main scheduling is done through schedulePost
  };

  const handleConnect = async (platform: Platform) => {
    const idToken = localStorage.getItem('token');
    if (!idToken) {
      setToast({ message: 'You must be logged in to connect accounts.', type: 'error' });
      return;
    }
    setLoadingPlatform(platform);
    try {
      if (platform === Platform.X) {
        window.location.href = `/backend/api/auth/x/connect?idToken=${encodeURIComponent(idToken)}`;
      } else if (platform === Platform.Facebook) {
        window.location.href = `/backend/api/auth/facebook/connect?idToken=${encodeURIComponent(idToken)}`;
      } else if (platform === Platform.LinkedIn) {
        window.location.href = `/backend/api/auth/linkedin/connect?idToken=${encodeURIComponent(idToken)}`;
      } else if (platform === Platform.Pinterest) {
        window.location.href = `/backend/api/auth/pinterest/connect?idToken=${encodeURIComponent(idToken)}`;
      } else {
        setToast({ message: 'OAuth for this platform coming soon!', type: 'error' });
      }
      // Mark account connected when user initiates connection
      markAccountConnected();
    } finally {
      setTimeout(() => setLoadingPlatform(null), 2000);
    }
  };

  const handleDisconnect = async (platform: Platform) => {
    const token = localStorage.getItem('token');
    if (!token) return;
    setLoadingPlatform(platform);
    try {
      const res = await fetch(`/backend/api/connections/${platform}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setConnections(connections.filter(conn => conn.platform !== platform));
        setToast({ message: `${platform} disconnected.`, type: 'success' });
      } else {
        setToast({ message: 'Failed to disconnect.', type: 'error' });
      }
    } catch {
      setToast({ message: 'Failed to disconnect.', type: 'error' });
    } finally {
      setLoadingPlatform(null);
    }
  };

  const handleRetryPost = async (postId: string) => {
    const token = localStorage.getItem('token');
    if (!token) return;
    try {
      const res = await fetch(`/backend/api/schedule/${postId}/publish`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setToast({ message: 'Post retried successfully.', type: 'success' });
        fetchPosts();
      } else {
        const error = await res.json();
        setToast({ message: error.error || 'Failed to retry post.', type: 'error' });
      }
    } catch (err: any) {
      setToast({ message: err.message || 'Failed to retry post.', type: 'error' });
    }
  };

  const handleDeletePost = async (postId: string) => {
    const token = localStorage.getItem('token');
    if (!token) return;
    if (!confirm('Are you sure you want to delete this post?')) return;
    try {
      const res = await fetch(`/backend/api/schedule/${postId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setToast({ message: 'Post deleted successfully.', type: 'success' });
        fetchPosts();
      } else {
        const error = await res.json();
        setToast({ message: error.error || 'Failed to delete post.', type: 'error' });
      }
    } catch (err: any) {
      setToast({ message: err.message || 'Failed to delete post.', type: 'error' });
    }
  };

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const hasConnections = connections.length > 0;
  const hasPosts = posts.length > 0;

  return (
    <div className="max-w-6xl mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold mb-8 text-gray-900">Dashboard</h1>
      {toast && (
        <div className={`fixed top-6 right-6 z-50 px-6 py-3 rounded-lg shadow-lg text-white transition-all duration-300 ${toast.type === 'success' ? 'bg-green-600' : 'bg-red-600'}`}>
          <div className="flex items-center gap-2">
            {toast.type === 'success' ? (
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            )}
            <span>{toast.message}</span>
          </div>
        </div>
      )}
      
      {/* Social Connections */}
      <section className="mb-8 bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <button
          onClick={() => toggleSection('connections')}
          className="w-full px-6 py-4 flex items-center justify-between bg-gray-50 hover:bg-gray-100 transition-colors"
        >
          <h2 className="text-xl font-semibold text-gray-800">Connect Social Accounts</h2>
          <svg
            className={`w-5 h-5 text-gray-600 transition-transform ${expandedSections.connections ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        {expandedSections.connections && (
          <div className="p-6">
            {!hasConnections ? (
              <EmptyState
                icon={
                  <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                  </svg>
                }
                title="Connect Your First Account"
                description="Link your social media accounts to start creating and scheduling posts. Connect at least one account to get started."
                actionLabel="Connect an Account"
                onAction={() => {
                  // Scroll to first platform card
                  const firstPlatform = document.querySelector('[data-platform-card]');
                  firstPlatform?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }}
                className="py-8"
              />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
                {PLATFORM_DATA.map((p) => (
                  <div key={p.name} data-platform-card>
                    <PlatformCard
                      name={p.name}
                      color={p.color}
                      icon={<p.icon className="w-8 h-8" />}
                      onConnect={() => handleConnect(p.name)}
                    >
                      {connections.some(conn => conn.platform === p.name) ? (
                        <>
                          <span className="mt-2 px-2 py-1 bg-green-600 text-xs rounded">Connected</span>
                          <button
                            className="mt-2 px-2 py-1 bg-red-600 text-xs rounded hover:bg-red-700 transition flex items-center gap-2"
                            onClick={e => { e.stopPropagation(); handleDisconnect(p.name); }}
                            disabled={loadingPlatform === p.name}
                          >
                            {loadingPlatform === p.name && <Spinner className="w-4 h-4" />} Disconnect
                          </button>
                        </>
                      ) : (
                        loadingPlatform === p.name && <Spinner className="mt-2" />
                      )}
                    </PlatformCard>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </section>

      {/* Content Ideation */}
      <section className="mb-8 bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <button
          onClick={() => toggleSection('ideation')}
          className="w-full px-6 py-4 flex items-center justify-between bg-gray-50 hover:bg-gray-100 transition-colors"
        >
          <h2 className="text-xl font-semibold text-gray-800">Content Ideation</h2>
          <svg
            className={`w-5 h-5 text-gray-600 transition-transform ${expandedSections.ideation ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        {expandedSections.ideation && (
          <div className="p-6">
            <ContentIdeation 
              onIdeaSelect={(idea) => setContent(idea)}
              disabled={loading}
            />
          </div>
        )}
      </section>

      {/* Post Creation */}
      <section className="mb-8 bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden" data-post-section>
        <button
          onClick={() => toggleSection('create')}
          className="w-full px-6 py-4 flex items-center justify-between bg-gray-50 hover:bg-gray-100 transition-colors"
        >
          <h2 className="text-xl font-semibold text-gray-800">Create & Schedule Post</h2>
          <svg
            className={`w-5 h-5 text-gray-600 transition-transform ${expandedSections.create ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        {expandedSections.create && (
          <div className="p-6">
            <SocialPostForm onSchedulePost={(post) => {
              const backendPost = {
                platforms: post.selectedPlatforms,
                platformContent: post.platformContent,
                content: post.baseContent.description,
                mediaUrl: post.baseContent.assetUrl || null,
                scheduledAt: post.scheduledAt
              };
              schedulePost(backendPost);
              markPostCreated();
            }} />
          </div>
        )}
      </section>

      {/* Content Calendar */}
      <section className="mb-8 bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <button
          onClick={() => toggleSection('calendar')}
          className="w-full px-6 py-4 flex items-center justify-between bg-gray-50 hover:bg-gray-100 transition-colors"
        >
          <h2 className="text-xl font-semibold text-gray-800">Content Calendar</h2>
          <svg
            className={`w-5 h-5 text-gray-600 transition-transform ${expandedSections.calendar ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        {expandedSections.calendar && (
          <div className="p-6">
            {loading && posts.length === 0 ? (
              <div className="flex items-center justify-center py-12">
                <Spinner className="w-8 h-8" />
                <span className="ml-3 text-gray-600">Loading calendar...</span>
              </div>
            ) : (
              <ContentCalendar 
                scheduledPosts={posts} 
                onRetryPost={handleRetryPost}
                onDeletePost={handleDeletePost}
              />
            )}
          </div>
        )}
      </section>

      {/* Analytics */}
      <section className="mb-8 bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <button
          onClick={() => toggleSection('analytics')}
          className="w-full px-6 py-4 flex items-center justify-between bg-gray-50 hover:bg-gray-100 transition-colors"
        >
          <h2 className="text-xl font-semibold text-gray-800">Analytics</h2>
          <svg
            className={`w-5 h-5 text-gray-600 transition-transform ${expandedSections.analytics ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        {expandedSections.analytics && (
          <div className="p-6">
            <Analytics />
          </div>
        )}
      </section>
    </div>
  );
};

export default Dashboard; 