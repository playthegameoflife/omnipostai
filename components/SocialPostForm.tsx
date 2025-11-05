
import React, { useState, useCallback, useRef } from 'react';
import { Platform, type PlatformContent, ContentType, type BaseContent, type ScheduledPost } from '../types';
import { PLATFORM_DATA } from '../constants';
import { generateSocialPosts, generateHashtags } from '../services/geminiService';
import ContentIdeation from './ContentIdeation';
import PlatformCard from './PlatformCard';
import Spinner from './Spinner';
import { SparklesIcon, UploadIcon } from './icons';

const ContentTypeSelector: React.FC<{ selected: ContentType; onSelect: (type: ContentType) => void; disabled: boolean; }> = ({ selected, onSelect, disabled }) => {
    const types = [ContentType.Text, ContentType.Image, ContentType.Video];
    return (
        <div className="flex items-center p-1 bg-gray-800/60 rounded-lg space-x-1">
            {types.map(type => (
                <button
                    key={type}
                    onClick={() => onSelect(type)}
                    disabled={disabled}
                    className={`flex-1 px-3 py-2 text-sm font-semibold rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-purple-500 disabled:cursor-not-allowed
                        ${selected === type ? 'bg-purple-600 text-white' : 'bg-transparent text-gray-300 hover:bg-gray-700/50'}`}
                >
                    {type}
                </button>
            ))}
        </div>
    );
};

// Helper to convert file to base64
const toBase64 = (file: File): Promise<string> => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve((reader.result as string).split(',')[1]);
    reader.onerror = error => reject(error);
});

interface SocialPostFormProps {
    onSchedulePost: (post: ScheduledPost) => void;
}

export const SocialPostForm: React.FC<SocialPostFormProps> = ({ onSchedulePost }) => {
  const [contentType, setContentType] = useState<ContentType>(ContentType.Text);
  const [baseContent, setBaseContent] = useState<BaseContent>({ description: '' });
  const [selectedPlatforms, setSelectedPlatforms] = useState<Platform[]>([]);
  const [platformContent, setPlatformContent] = useState<PlatformContent>({});
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isPosting, setIsPosting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isScheduling, setIsScheduling] = useState(false);
  const [scheduleDate, setScheduleDate] = useState('');
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const resetForm = () => {
    setBaseContent({ description: '' });
    setSelectedPlatforms([]);
    setPlatformContent({});
    setContentType(ContentType.Text);
    setIsScheduling(false);
    setScheduleDate('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  const handlePlatformToggle = (platformName: Platform, isSelected: boolean) => {
    setSelectedPlatforms(prev => 
      isSelected ? [...prev, platformName] : prev.filter(p => p !== platformName)
    );
    if (isSelected && !platformContent[platformName]) {
        setPlatformContent(prev => ({ ...prev, [platformName]: baseContent.description }));
    }
  };

  const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newDescription = e.target.value;
    const oldDescription = baseContent.description;
    
    setBaseContent(prev => ({...prev, description: newDescription}));

    const updatedContent = { ...platformContent };
    selectedPlatforms.forEach(p => {
      if (platformContent[p] === oldDescription || platformContent[p] === '') {
        updatedContent[p] = newDescription;
      }
    });
    setPlatformContent(updatedContent);
  };
  
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const previewUrl = URL.createObjectURL(file);
      const base64Data = await toBase64(file);
      setBaseContent(prev => ({
        ...prev,
        assetFile: file,
        assetPreview: previewUrl,
        assetMimeType: file.type,
        assetData: base64Data
      }));
    }
  }

  const handleGenerateClick = useCallback(async () => {
    if (!baseContent.description.trim()) {
      setError(`Please enter a ${contentType === ContentType.Text ? 'message' : 'description'} to generate posts.`);
      return;
    }
    if (contentType !== ContentType.Text && !baseContent.assetFile) {
        setError(`Please upload a file for the ${contentType.toLowerCase()}.`);
        return;
    }
    if (selectedPlatforms.length === 0) {
      setError('Please select at least one platform.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const generatedPosts = await generateSocialPosts(baseContent, selectedPlatforms, contentType);
      setPlatformContent(prev => ({ ...prev, ...generatedPosts }));
      setSuccessMessage('AI content generated successfully!');
    } catch (err: any) {
      setError(err.message || 'An unknown error occurred.');
    } finally {
      setIsLoading(false);
    }
  }, [baseContent, selectedPlatforms, contentType]);

  const handlePostClick = () => {
    if (selectedPlatforms.length === 0) {
      setError("Please select at least one platform to post to.");
      return;
    }
    
    setIsPosting(true);
    setError(null);
    setSuccessMessage(null);

    setTimeout(() => {
      setIsPosting(false);
      const postType = contentType === ContentType.Text ? '' : `${contentType} `;
      setSuccessMessage(`Successfully posted your ${postType}to ${selectedPlatforms.join(', ')}! (Simulation)`);
      resetForm();
    }, 2000);
  };
  
  const handleHashtagGenerate = useCallback(async (platformName: Platform) => {
    const content = platformContent[platformName];
    if (!content) return;
    try {
        const hashtags = await generateHashtags(content, platformName);
        setPlatformContent(prev => ({
            ...prev,
            [platformName]: `${prev[platformName]}\n\n${hashtags.join(' ')}`
        }));
    } catch (err: any) {
        setError(err.message);
    }
  }, [platformContent]);

  const handleScheduleConfirm = () => {
      if (!scheduleDate) {
          setError('Please select a date and time to schedule the post.');
          return;
      }
      const newPost: ScheduledPost = {
          id: new Date().toISOString(),
          scheduledAt: new Date(scheduleDate).toISOString(),
          contentType,
          baseContent: {
              description: baseContent.description,
              assetPreview: baseContent.assetPreview,
          },
          platformContent,
          selectedPlatforms,
      };
      onSchedulePost(newPost);
      setSuccessMessage('Post scheduled successfully!');
      resetForm();
  }

  return (
    <div className="space-y-8">
      {error && <div className="bg-red-900/50 border border-red-700 text-red-200 p-3 rounded-lg cursor-pointer" onClick={() => setError(null)}>{error}</div>}
      {successMessage && <div className="bg-green-900/50 border border-green-700 text-green-200 p-3 rounded-lg cursor-pointer" onClick={() => setSuccessMessage(null)}>{successMessage}</div>}
      
      <ContentIdeation onIdeaSelect={(idea) => setBaseContent(prev => ({...prev, description: idea}))} disabled={isLoading || isPosting} />

      <div className="space-y-6">
        <h3 className="text-xl font-semibold text-white">Create Your Content</h3>
        <div className="p-6 bg-gray-800/40 border border-gray-700/60 rounded-lg space-y-4">
          <ContentTypeSelector selected={contentType} onSelect={setContentType} disabled={isLoading || isPosting} />
          
          <textarea
            value={baseContent.description}
            onChange={handleDescriptionChange}
            placeholder={contentType === ContentType.Text ? "What's on your mind? Type your main post content here..." : `Describe your ${contentType.toLowerCase()} so the AI can write great content for it...`}
            className="w-full h-36 p-3 bg-gray-800/70 border border-gray-600 rounded-md focus:ring-2 focus:ring-purple-500 focus:outline-none transition-colors text-gray-200 resize-y"
            disabled={isLoading || isPosting}
          />
          
          {contentType !== ContentType.Text && (
              <div>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileChange}
                  className="hidden" 
                  accept={contentType === 'Image' ? 'image/*' : 'video/*'} 
                  disabled={isLoading || isPosting}
                />
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isLoading || isPosting}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 font-semibold text-white bg-gray-700/80 rounded-md hover:bg-gray-700 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors"
                >
                  <UploadIcon className="w-5 h-5"/>
                  {baseContent.assetFile ? `Uploaded: ${baseContent.assetFile.name}` : `Upload ${contentType}`}
                </button>
              </div>
          )}

          {baseContent.assetPreview && (
              <div className="mt-2 text-center">
                  {contentType === ContentType.Image && <img src={baseContent.assetPreview} alt="Preview" className="rounded-lg max-h-48 w-auto mx-auto" />}
                  {contentType === ContentType.Video && <video src={baseContent.assetPreview} controls className="rounded-lg max-h-48 w-auto mx-auto" />}
              </div>
          )}
        </div>
      </div>
      
      <div className="space-y-6">
          <h3 className="text-xl font-semibold text-white">Select Platforms & Customize</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {PLATFORM_DATA.map(p => (
              <PlatformCard
                key={p.name}
                platform={p}
                isSelected={selectedPlatforms.includes(p.name)}
                onToggle={handlePlatformToggle}
                content={platformContent[p.name] || ''}
                onContentChange={(platformName, content) => setPlatformContent(prev => ({...prev, [platformName]: content}))}
                isLoading={isLoading || isPosting}
                onHashtagGenerate={handleHashtagGenerate}
              />
            ))}
          </div>
      </div>

      <div className="p-4 bg-gray-800/40 border border-gray-700/60 rounded-lg">
        <div className="flex flex-col sm:flex-row gap-4 justify-end">
            <button
            onClick={handleGenerateClick}
            disabled={isLoading || isPosting || selectedPlatforms.length === 0}
            className="flex items-center justify-center gap-2 px-5 py-2.5 font-semibold text-white bg-purple-600 rounded-md hover:bg-purple-700 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-purple-500"
            >
            {isLoading ? <><Spinner /> Generating...</> : <><SparklesIcon className="w-5 h-5" /> Generate with AI</>}
            </button>
            <button
            onClick={handlePostClick}
            disabled={isLoading || isPosting || selectedPlatforms.length === 0 || isScheduling}
            className="flex items-center justify-center px-5 py-2.5 font-semibold text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-blue-500"
            >
            {isPosting ? <><Spinner /> Posting...</> : 'Post Now'}
            </button>
            <button
            onClick={() => setIsScheduling(prev => !prev)}
            disabled={isLoading || isPosting || selectedPlatforms.length === 0}
            className="flex items-center justify-center px-5 py-2.5 font-semibold text-white bg-green-600 rounded-md hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-green-500"
            >
            {isScheduling ? 'Cancel Schedule' : 'Schedule Post'}
            </button>
        </div>
        {isScheduling && (
            <div className="mt-4 p-4 bg-gray-800/50 rounded-lg flex flex-col sm:flex-row gap-4 items-center justify-center">
                <input
                    type="datetime-local"
                    value={scheduleDate}
                    onChange={(e) => setScheduleDate(e.target.value)}
                    className="bg-gray-700 text-white px-3 py-2 rounded-md border border-gray-600 focus:ring-purple-500 focus:outline-none"
                    min={new Date().toISOString().slice(0, 16)}
                />
                <button
                    onClick={handleScheduleConfirm}
                    className="px-6 py-2 font-semibold text-white bg-green-600 rounded-md hover:bg-green-700 transition-colors"
                >
                    Confirm Schedule
                </button>
            </div>
        )}
      </div>
    </div>
  );
};
