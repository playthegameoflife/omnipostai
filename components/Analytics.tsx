import React, { useEffect, useState } from 'react';
import { PLATFORM_DATA } from '../constants';
import Spinner from './Spinner';
import EmptyState from './EmptyState';

interface AnalyticsData {
  totalPosts: number;
  recentPosts: number;
  topPlatforms: { platform: string; count: number }[];
  monthlyTrends: { month: string; count: number }[];
  postsByPlatform: Record<string, number>;
  engagement: {
    totalLikes: number;
    totalShares: number;
    totalComments: number;
    averageEngagement: number;
  };
}

const Analytics: React.FC = () => {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/backend/api/analytics', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to fetch analytics');
      const data = await res.json();
      setAnalytics(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white p-8 rounded-lg shadow text-center">
        <Spinner className="w-8 h-8 mx-auto" />
        <p className="mt-4 text-gray-600">Loading analytics...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white p-8 rounded-lg shadow text-center">
        <p className="text-red-600">Error loading analytics: {error}</p>
        <button 
          onClick={fetchAnalytics}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!analytics) return null;

  // Show empty state if no posts exist
  if (analytics.totalPosts === 0) {
    return (
      <EmptyState
        icon={
          <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        }
        title="No Analytics Data Yet"
        description="Once you start posting, you'll see engagement metrics, platform performance, and trends here. Create and publish your first post to get started!"
        actionLabel="Create Your First Post"
        onAction={() => {
          // Scroll to post creation section
          const postSection = document.querySelector('[data-post-section]');
          postSection?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }}
        className="bg-white rounded-lg shadow border border-gray-200"
      />
    );
  }

  const getPlatformIcon = (platformName: string) => {
    const platform = PLATFORM_DATA.find(p => p.name === platformName);
    return platform ? platform.icon : null;
  };

  const getPlatformColor = (platformName: string) => {
    const platform = PLATFORM_DATA.find(p => p.name === platformName);
    return platform ? platform.color : 'bg-gray-500';
  };

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Posts</p>
              <p className="text-2xl font-bold text-gray-900">{analytics.totalPosts}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Recent Posts (30d)</p>
              <p className="text-2xl font-bold text-gray-900">{analytics.recentPosts}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Likes</p>
              <p className="text-2xl font-bold text-gray-900">{analytics.engagement.totalLikes.toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-orange-100 rounded-lg">
              <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Shares</p>
              <p className="text-2xl font-bold text-gray-900">{analytics.engagement.totalShares.toLocaleString()}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Platform Performance */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Platforms</h3>
        <div className="space-y-4">
          {analytics.topPlatforms.map((platform, index) => {
            const Icon = getPlatformIcon(platform.platform);
            const color = getPlatformColor(platform.platform);
            const percentage = analytics.totalPosts > 0 ? Math.round((platform.count / analytics.totalPosts) * 100) : 0;
            
            return (
              <div key={platform.platform} className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className={`p-2 rounded-lg ${color} text-white mr-3`}>
                    {Icon && <Icon className="w-4 h-4" />}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{platform.platform}</p>
                    <p className="text-sm text-gray-600">{platform.count} posts</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900">{percentage}%</p>
                  <div className="w-24 bg-gray-200 rounded-full h-2 mt-1">
                    <div 
                      className={`h-2 rounded-full ${color}`}
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Monthly Trends */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Monthly Trends</h3>
        <div className="space-y-3">
          {analytics.monthlyTrends.map((trend) => (
            <div key={trend.month} className="flex items-center justify-between">
              <span className="text-gray-700">{trend.month}</span>
              <div className="flex items-center">
                <div className="w-32 bg-gray-200 rounded-full h-2 mr-3">
                  <div 
                    className="bg-blue-600 h-2 rounded-full"
                    style={{ 
                      width: `${Math.min((trend.count / Math.max(...analytics.monthlyTrends.map(t => t.count))) * 100, 100)}%` 
                    }}
                  ></div>
                </div>
                <span className="font-medium text-gray-900">{trend.count}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Engagement Metrics */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Engagement Overview</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <p className="text-2xl font-bold text-blue-600">{analytics.engagement.totalLikes.toLocaleString()}</p>
            <p className="text-sm text-gray-600">Total Likes</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-green-600">{analytics.engagement.totalShares.toLocaleString()}</p>
            <p className="text-sm text-gray-600">Total Shares</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-purple-600">{analytics.engagement.totalComments.toLocaleString()}</p>
            <p className="text-sm text-gray-600">Total Comments</p>
          </div>
        </div>
        <div className="mt-6 text-center">
          <p className="text-lg font-semibold text-gray-900">
            Average Engagement Rate: {analytics.engagement.averageEngagement}%
          </p>
        </div>
      </div>
    </div>
  );
};

export default Analytics; 