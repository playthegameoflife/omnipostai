
import React, { useState } from 'react';
import { type ScheduledPost, Platform, PostStatus } from '../types';
import { PLATFORM_DATA } from '../constants';
import EmptyState from './EmptyState';

const PlatformIconsMap = PLATFORM_DATA.reduce((acc, p) => {
    acc[p.name] = p.icon;
    return acc;
}, {} as Record<Platform, React.FC<{ className?: string }>>);

interface ContentCalendarProps {
    scheduledPosts: ScheduledPost[];
    onRetryPost?: (postId: string) => void;
    onDeletePost?: (postId: string) => void;
}

const ContentCalendar: React.FC<ContentCalendarProps> = ({ scheduledPosts, onRetryPost, onDeletePost }) => {
    const [currentDate, setCurrentDate] = useState(new Date());

    const changeMonth = (offset: number) => {
        setCurrentDate(prev => {
            const newDate = new Date(prev);
            newDate.setMonth(prev.getMonth() + offset);
            return newDate;
        });
    };

    const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
    const startDate = new Date(startOfMonth);
    startDate.setDate(startDate.getDate() - startOfMonth.getDay());
    const endDate = new Date(endOfMonth);
    endDate.setDate(endDate.getDate() + (6 - endOfMonth.getDay()));

    const days = [];
    let day = new Date(startDate);

    while (day <= endDate) {
        days.push(new Date(day));
        day.setDate(day.getDate() + 1);
    }
    
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  if (scheduledPosts.length === 0) {
    return (
      <EmptyState
        icon={
          <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        }
        title="No Posts Scheduled Yet"
        description="Your content calendar is empty. Schedule your first post to see it here. You can schedule posts for future dates to plan your content in advance."
        actionLabel="Schedule Your First Post"
        onAction={() => {
          // Scroll to post creation section
          const postSection = document.querySelector('[data-post-section]');
          postSection?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }}
        className="bg-gray-800/40 border border-gray-700/60 rounded-lg"
      />
    );
  }

  return (
    <div className="bg-gray-800/40 p-4 sm:p-6 rounded-lg border border-gray-700/60">
            <div className="flex items-center justify-between mb-6">
                <button onClick={() => changeMonth(-1)} className="px-4 py-2 bg-gray-700/80 rounded-md hover:bg-gray-700">&lt;</button>
                <h2 className="text-xl font-bold text-white">
                    {currentDate.toLocaleString('default', { month: 'long' })} {currentDate.getFullYear()}
                </h2>
                <button onClick={() => changeMonth(1)} className="px-4 py-2 bg-gray-700/80 rounded-md hover:bg-gray-700">&gt;</button>
            </div>
            
            <div className="grid grid-cols-7 gap-1 text-center text-sm text-gray-400 mb-2">
                {weekDays.map(d => <div key={d} className="font-semibold">{d}</div>)}
            </div>

            <div className="grid grid-cols-7 gap-1 sm:gap-2">
                {days.map((d, index) => {
                    const isCurrentMonth = d.getMonth() === currentDate.getMonth();
                    const isToday = d.toDateString() === new Date().toDateString();

                    const postsOnDay = scheduledPosts.filter(p => new Date(p.scheduledAt).toDateString() === d.toDateString());

                    return (
                        <div 
                            key={index}
                            className={`h-24 sm:h-32 rounded-lg p-2 flex flex-col transition-colors
                                ${isCurrentMonth ? 'bg-gray-800/50' : 'bg-transparent text-gray-600'}
                                ${isToday ? 'border-2 border-purple-500' : 'border border-transparent'}
                            `}
                        >
                            <div className={`font-bold ${isToday ? 'text-purple-400' : ''}`}>{d.getDate()}</div>
                            <div className="flex-grow overflow-y-auto space-y-1 mt-1 scrollbar-thin">
                                {postsOnDay.map(post => {
                                    const status = post.status || PostStatus.Pending;
                                    const statusColors = {
                                        [PostStatus.Pending]: 'bg-purple-900/60',
                                        [PostStatus.Sent]: 'bg-green-900/60',
                                        [PostStatus.Failed]: 'bg-red-900/60'
                                    };
                                    const statusIcons = {
                                        [PostStatus.Pending]: '⏱️',
                                        [PostStatus.Sent]: '✓',
                                        [PostStatus.Failed]: '✗'
                                    };
                                    return (
                                        <div 
                                            key={post.id} 
                                            className={`${statusColors[status]} p-1.5 rounded text-left text-xs text-white relative group`}
                                            title={post.baseContent.description}
                                        >
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-1">
                                                    <span>{statusIcons[status]}</span>
                                                    <span className="font-semibold">{new Date(post.scheduledAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    {post.selectedPlatforms.slice(0, 3).map(p => {
                                                        const Icon = PlatformIconsMap[p];
                                                        return Icon ? <Icon key={p} className="w-3 h-3"/> : null;
                                                    })}
                                                    {post.selectedPlatforms.length > 3 && <span className="text-xxs">+{post.selectedPlatforms.length-3}</span>}
                                                </div>
                                            </div>
                                            <p className="truncate opacity-80 mt-0.5">{post.baseContent.description}</p>
                                            {status === PostStatus.Failed && post.error && (
                                                <div className="text-red-300 text-xxs mt-1 truncate" title={post.error}>
                                                    {post.error}
                                                </div>
                                            )}
                                            {/* Action buttons */}
                                            <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                                                {status === PostStatus.Failed && onRetryPost && (
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            onRetryPost(post.id);
                                                        }}
                                                        className="bg-green-600 hover:bg-green-700 px-1 py-0.5 rounded text-xxs"
                                                        title="Retry post"
                                                    >
                                                        Retry
                                                    </button>
                                                )}
                                                {status !== PostStatus.Sent && onDeletePost && (
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            onDeletePost(post.id);
                                                        }}
                                                        className="bg-red-600 hover:bg-red-700 px-1 py-0.5 rounded text-xxs"
                                                        title="Delete post"
                                                    >
                                                        Delete
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    );
                })}
            </div>
             <style>{`.scrollbar-thin::-webkit-scrollbar { width: 4px; } .scrollbar-thin::-webkit-scrollbar-thumb { background-color: #6b21a8; border-radius: 20px; }`}</style>
        </div>
    );
}

export default ContentCalendar;
