
import React, { useState } from 'react';
import { generatePostIdeas, generateHashtags } from '../services/geminiService';
import { Platform } from '../types';
import { PLATFORM_DATA } from '../constants';
import Spinner from './Spinner';
import { LightbulbIcon } from './icons';

interface ContentIdeationProps {
    onIdeaSelect: (idea: string) => void;
    disabled: boolean;
}

const ContentIdeation: React.FC<ContentIdeationProps> = ({ onIdeaSelect, disabled }) => {
    const [topic, setTopic] = useState('');
    const [ideas, setIdeas] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [selectedPlatform, setSelectedPlatform] = useState<Platform>(Platform.Facebook);
    const [postContent, setPostContent] = useState('');
    const [hashtags, setHashtags] = useState<string[]>([]);
    const [hashtagLoading, setHashtagLoading] = useState(false);
    const [showHashtagGenerator, setShowHashtagGenerator] = useState(false);

    const handleGenerateIdeas = async () => {
        if (!topic.trim()) {
            setError('Please enter a topic.');
            return;
        }
        setIsLoading(true);
        setError(null);
        setIdeas([]);
        try {
            const generatedIdeas = await generatePostIdeas(topic);
            setIdeas(generatedIdeas);
        } catch (err: any) {
            setError(err.message || 'An unknown error occurred.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleGenerateHashtags = async () => {
        if (!postContent.trim()) return;
        
        setHashtagLoading(true);
        try {
            const generatedHashtags = await generateHashtags(postContent, selectedPlatform);
            setHashtags(generatedHashtags);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setHashtagLoading(false);
        }
    };

    return (
        <div className="p-6 bg-gray-800/40 border border-gray-700/60 rounded-lg space-y-4">
            <div className="flex items-center gap-3">
                <LightbulbIcon className="w-6 h-6 text-yellow-300" />
                <h2 className="text-xl font-semibold text-white">Need Inspiration?</h2>
            </div>
            
            <p className="text-gray-400 text-sm">Enter a topic and let AI generate some post ideas for you.</p>

            <div className="flex flex-col sm:flex-row gap-2">
                <input
                    type="text"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    placeholder="e.g., healthy breakfast recipes"
                    className="flex-grow p-3 bg-gray-800/70 border border-gray-600 rounded-md focus:ring-2 focus:ring-purple-500 focus:outline-none transition-colors text-gray-200"
                    disabled={disabled || isLoading}
                />
                <button
                    onClick={handleGenerateIdeas}
                    disabled={disabled || isLoading}
                    className="flex items-center justify-center gap-2 px-5 py-2.5 font-semibold text-white bg-yellow-600 rounded-md hover:bg-yellow-700 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-yellow-500"
                >
                    {isLoading ? <Spinner /> : 'Get Ideas'}
                </button>
            </div>
            
            {error && <div className="text-red-300 text-sm">{error}</div>}

            {ideas.length > 0 && (
                <div className="space-y-3 pt-4">
                    <h3 className="font-semibold text-gray-200">Click an idea to use it:</h3>
                    <ul className="flex flex-col items-start gap-2">
                        {ideas.map((idea, index) => (
                           <li key={index}>
                               <button 
                                onClick={() => onIdeaSelect(idea)}
                                disabled={disabled}
                                className="text-left text-gray-300 p-2.5 bg-gray-700/40 rounded-md hover:bg-gray-700/70 w-full transition-colors disabled:text-gray-500 disabled:bg-gray-800"
                               >
                                 {idea}
                               </button>
                           </li>
                        ))}
                    </ul>
                </div>
            )}

            {/* Hashtag Generator */}
            <div className="border-t border-gray-700/60 pt-4">
                <button
                    onClick={() => setShowHashtagGenerator(!showHashtagGenerator)}
                    className="text-gray-300 hover:text-white transition-colors text-sm"
                >
                    {showHashtagGenerator ? 'Hide' : 'Show'} Hashtag Generator
                </button>
                
                {showHashtagGenerator && (
                    <div className="space-y-4 mt-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-2">
                                Platform
                            </label>
                            <select
                                value={selectedPlatform}
                                onChange={(e) => setSelectedPlatform(e.target.value as Platform)}
                                className="w-full p-3 bg-gray-800/70 border border-gray-600 rounded-md focus:ring-2 focus:ring-purple-500 focus:outline-none text-gray-200"
                            >
                                {PLATFORM_DATA.map((platform) => (
                                    <option key={platform.name} value={platform.name}>
                                        {platform.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                        
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-2">
                                Post Content
                            </label>
                            <textarea
                                value={postContent}
                                onChange={(e) => setPostContent(e.target.value)}
                                placeholder="Paste your post content here..."
                                rows={3}
                                className="w-full p-3 bg-gray-800/70 border border-gray-600 rounded-md focus:ring-2 focus:ring-purple-500 focus:outline-none text-gray-200"
                            />
                        </div>
                        
                        <button
                            onClick={handleGenerateHashtags}
                            disabled={hashtagLoading || !postContent.trim()}
                            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {hashtagLoading ? <Spinner className="w-4 h-4" /> : 'Generate Hashtags'}
                        </button>

                        {/* Generated Hashtags */}
                        {hashtags.length > 0 && (
                            <div className="mt-4">
                                <h5 className="text-sm font-medium text-gray-400 mb-2">Suggested Hashtags:</h5>
                                <div className="flex flex-wrap gap-2">
                                    {hashtags.map((hashtag, index) => (
                                        <span
                                            key={index}
                                            className="px-2 py-1 bg-purple-900/60 text-purple-200 text-sm rounded-md cursor-pointer hover:bg-purple-900/80"
                                            onClick={() => {
                                                navigator.clipboard.writeText(hashtag);
                                            }}
                                            title="Click to copy"
                                        >
                                            {hashtag}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ContentIdeation;
