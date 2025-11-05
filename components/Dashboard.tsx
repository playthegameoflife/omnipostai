import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ContentCalendar from './ContentCalendar';
import Analytics from './Analytics';
import ContentIdeation from './ContentIdeation';
import { SocialPostForm } from './SocialPostForm';
import { ScheduledPost, Platform, ContentType } from '../types';
import PlatformCard from './PlatformCard';
import { PLATFORM_DATA } from '../constants';
import Spinner from './Spinner';



const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [content, setContent] = useState('');
  const [posts, setPosts] = useState<ScheduledPost[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [connections, setConnections] = useState<{ platform: Platform }[]>([]);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [loadingPlatform, setLoadingPlatform] = useState<Platform | null>(null);

  useEffect(() => {
    if (!localStorage.getItem('token')) {
      navigate('/login');
    }
  }, [navigate]);

  const mapBackendPost = (post: any): ScheduledPost => ({
    id: post.id,
    scheduledAt: post.scheduledAt,
    contentType: ContentType.Text,
    baseContent: { description: post.content || '' },
    platformContent: { [post.platform]: post.content || '' },
    selectedPlatforms: [post.platform as Platform],
  });

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

  const schedulePost = async (postData: { platform: string; content: string; scheduledAt: string }) => {
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
      if (!res.ok) throw new Error('Failed to schedule post');
      fetchPosts();
    } catch (err: any) {
      setError(err.message);
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

  return (
    <div className="max-w-6xl mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold mb-8 text-gray-900">Dashboard</h1>
      {toast && (
        <div className={`fixed top-6 right-6 z-50 px-6 py-3 rounded shadow-lg text-white ${toast.type === 'success' ? 'bg-green-600' : 'bg-red-600'}`}>{toast.message}</div>
      )}
      {/* Social Connections */}
      <section className="mb-12">
        <h2 className="text-xl font-semibold mb-4 text-gray-800">Connect Social Accounts</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          {PLATFORM_DATA.map((p) => (
            <PlatformCard
              key={p.name}
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
          ))}
        </div>
      </section>
      {/* Content Ideation */}
      <section className="mb-12">
        <ContentIdeation 
          onIdeaSelect={(idea) => setContent(idea)}
          disabled={loading}
        />
      </section>

      {/* Post Creation */}
      <section className="mb-12">
        <h2 className="text-xl font-semibold mb-4 text-gray-800">Create & Schedule Post</h2>
        <SocialPostForm onSchedulePost={(post) => {
          // Convert the post to the format expected by the backend
          const backendPost = {
            platform: post.selectedPlatforms[0],
            content: post.platformContent[post.selectedPlatforms[0]] || post.baseContent.description,
            scheduledAt: post.scheduledAt
          };
          // Call the backend API directly
          schedulePost(backendPost);
        }} />
      </section>
      {/* Content Calendar */}
      <section className="mb-12">
        <h2 className="text-xl font-semibold mb-4 text-gray-800">Content Calendar</h2>
        <ContentCalendar scheduledPosts={posts} />
      </section>
      {/* Analytics */}
      <section className="mb-12">
        <h2 className="text-xl font-semibold mb-4 text-gray-800">Analytics</h2>
        <Analytics />
      </section>
    </div>
  );
};

export default Dashboard; 