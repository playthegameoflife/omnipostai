
import React, { useState } from 'react';
import { type ScheduledPost, Platform } from '../types';
import { PLATFORM_DATA } from '../constants';

const PlatformIconsMap = PLATFORM_DATA.reduce((acc, p) => {
    acc[p.name] = p.icon;
    return acc;
}, {} as Record<Platform, React.FC<{ className?: string }>>);

interface ContentCalendarProps {
    scheduledPosts: ScheduledPost[];
}

const ContentCalendar: React.FC<ContentCalendarProps> = ({ scheduledPosts }) => {
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
                                {postsOnDay.map(post => (
                                    <div key={post.id} className="bg-purple-900/60 p-1.5 rounded text-left text-xs text-white" title={post.baseContent.description}>
                                        <div className="flex items-center justify-between">
                                            <span className="font-semibold">{new Date(post.scheduledAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                                            <div className="flex items-center gap-1">
                                                {post.selectedPlatforms.slice(0, 3).map(p => {
                                                    const Icon = PlatformIconsMap[p];
                                                    return Icon ? <Icon key={p} className="w-3 h-3"/> : null;
                                                })}
                                                {post.selectedPlatforms.length > 3 && <span className="text-xxs">+{post.selectedPlatforms.length-3}</span>}
                                            </div>
                                        </div>
                                        <p className="truncate opacity-80 mt-0.5">{post.baseContent.description}</p>
                                    </div>
                                ))}
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
