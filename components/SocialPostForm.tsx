
import React, { useState, useCallback, useRef } from 'react';
import { Platform, type PlatformContent, ContentType, type BaseContent, type ScheduledPost } from '../types';
import { PLATFORM_DATA } from '../constants';
import { generateSocialPosts, generateHashtags } from '../services/geminiService';
import ContentIdeation from './ContentIdeation';
import PlatformSelectorCard from './PlatformSelectorCard';
import Spinner from './Spinner';
import { SparklesIcon, UploadIcon, LightbulbIcon } from './icons';

const ContentTypeSelector: React.FC<{ selected: ContentType; onSelect: (type: ContentType) => void; disabled: boolean; }> = ({ selected, onSelect, disabled }) => {
    const types = [ContentType.Text, ContentType.Image, ContentType.Video];
    return (
        <div className="flex items-center p-1 bg-gray-100 rounded-lg space-x-1 border border-gray-200">
            {types.map(type => (
                <button
                    key={type}
                    onClick={() => onSelect(type)}
                    disabled={disabled}
                    className={`flex-1 px-3 py-2 text-sm font-semibold rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed
                        ${selected === type ? 'bg-blue-600 text-white shadow-sm' : 'bg-transparent text-gray-700 hover:bg-gray-200'}`}
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
  const [showContentIdeation, setShowContentIdeation] = useState(false);
  
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

  const handlePostClick = async () => {
    if (selectedPlatforms.length === 0) {
      setError("Please select at least one platform to post to.");
      return;
    }
    
    // Validate that each platform has content
    for (const platform of selectedPlatforms) {
      const content = platformContent[platform] || baseContent.description;
      if (!content || !content.trim()) {
        setError(`Please provide content for ${platform}.`);
        return;
      }
    }
    
    setIsPosting(true);
    setError(null);
    setSuccessMessage(null);

    try {
      let mediaUrl = null;
      
      // Upload media if present
      if (baseContent.assetFile) {
        try {
          const formData = new FormData();
          formData.append('file', baseContent.assetFile);
          
          const token = localStorage.getItem('token');
          const uploadRes = await fetch('/backend/api/upload', {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${token}`,
            },
            body: formData,
          });
          
          if (!uploadRes.ok) {
            const errorData = await uploadRes.json();
            throw new Error(errorData.error || 'Failed to upload media');
          }
          
          const uploadData = await uploadRes.json();
          mediaUrl = uploadData.url;
        } catch (uploadError: any) {
          setError(`Failed to upload media: ${uploadError.message}`);
          setIsPosting(false);
          return;
        }
      }
      
      // Prepare platform-specific content
      const contentForPlatforms: Record<string, string> = {};
      selectedPlatforms.forEach(platform => {
        contentForPlatforms[platform] = platformContent[platform] || baseContent.description;
      });
      
      // Post to selected platforms
      const token = localStorage.getItem('token');
      const postRes = await fetch('/backend/api/post/all', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          content: baseContent.description, // Fallback content
          platforms: selectedPlatforms,
          platformContent: contentForPlatforms,
          mediaUrl: mediaUrl || null,
        }),
      });
      
      if (!postRes.ok) {
        const errorData = await postRes.json();
        throw new Error(errorData.error || 'Failed to post');
      }
      
      const results = await postRes.json();
      
      // Check for errors in results
      const errors: string[] = [];
      const successes: string[] = [];
      
      Object.keys(results).forEach(platform => {
        const result = results[platform];
        if (result.error) {
          errors.push(`${platform}: ${result.error}`);
        } else if (result.success) {
          successes.push(platform);
        }
      });
      
      if (errors.length > 0 && successes.length === 0) {
        // All failed
        setError(`Failed to post to all platforms: ${errors.join('; ')}`);
      } else if (errors.length > 0) {
        // Some succeeded, some failed
        setSuccessMessage(`Posted to ${successes.join(', ')} successfully!`);
        setError(`Some posts failed: ${errors.join('; ')}`);
      } else {
        // All succeeded
        const postType = contentType === ContentType.Text ? '' : `${contentType} `;
        setSuccessMessage(`Successfully posted your ${postType}to ${successes.join(', ')}!`);
        resetForm();
      }
    } catch (err: any) {
      setError(err.message || 'An unknown error occurred while posting.');
    } finally {
      setIsPosting(false);
    }
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

  const handleScheduleConfirm = async () => {
      if (!scheduleDate) {
          setError('Please select a date and time to schedule the post.');
          return;
      }
      if (selectedPlatforms.length === 0) {
          setError('Please select at least one platform.');
          return;
      }
      
      setIsScheduling(true);
      setError(null);
      setSuccessMessage(null);
      
      try {
          let mediaUrl = null;
          
          // Upload media if present
          if (baseContent.assetFile) {
              try {
                  const formData = new FormData();
                  formData.append('file', baseContent.assetFile);
                  
                  const token = localStorage.getItem('token');
                  const uploadRes = await fetch('/backend/api/upload', {
                      method: 'POST',
                      headers: {
                          Authorization: `Bearer ${token}`,
                      },
                      body: formData,
                  });
                  
                  if (!uploadRes.ok) {
                      throw new Error('Failed to upload media');
                  }
                  
                  const uploadData = await uploadRes.json();
                  mediaUrl = uploadData.url;
              } catch (uploadError: any) {
                  setError(`Failed to upload media: ${uploadError.message}`);
                  setIsScheduling(false);
                  return;
              }
          }
          
          const newPost: ScheduledPost = {
              id: new Date().toISOString(),
              scheduledAt: new Date(scheduleDate).toISOString(),
              contentType,
              baseContent: {
                  description: baseContent.description,
                  assetPreview: baseContent.assetPreview,
                  assetUrl: mediaUrl || undefined,
              },
              platformContent,
              selectedPlatforms,
          };
          onSchedulePost(newPost);
          setSuccessMessage('Post scheduled successfully!');
          resetForm();
      } catch (err: any) {
          setError(err.message || 'Failed to schedule post');
      } finally {
          setIsScheduling(false);
      }
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg flex items-start gap-3">
          <svg className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
          <div className="flex-1">
            <p className="text-sm font-medium text-red-800">{error}</p>
            <button onClick={() => setError(null)} className="text-xs text-red-600 hover:text-red-800 mt-1 underline">
              Dismiss
            </button>
          </div>
        </div>
      )}
      {successMessage && (
        <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded-lg flex items-start gap-3">
          <svg className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          <div className="flex-1">
            <p className="text-sm font-medium text-green-800">{successMessage}</p>
            <button onClick={() => setSuccessMessage(null)} className="text-xs text-green-600 hover:text-green-800 mt-1 underline">
              Dismiss
            </button>
          </div>
        </div>
      )}
      
      {/* Content Ideation - Collapsible */}
      <div className="bg-gray-50 rounded-lg border border-gray-200 overflow-hidden">
        <button
          onClick={() => setShowContentIdeation(!showContentIdeation)}
          className="w-full px-4 py-3 flex items-center justify-between bg-gray-100 hover:bg-gray-200 transition-colors"
          disabled={isLoading || isPosting}
        >
          <div className="flex items-center gap-2">
            <LightbulbIcon className="w-5 h-5 text-yellow-600" />
            <span className="font-medium text-gray-800">Need Content Ideas?</span>
          </div>
          <svg
            className={`w-5 h-5 text-gray-600 transition-transform ${showContentIdeation ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        {showContentIdeation && (
          <div className="p-4">
            <ContentIdeation onIdeaSelect={(idea) => {
              setBaseContent(prev => ({...prev, description: idea}));
              setShowContentIdeation(false); // Auto-collapse after selection
            }} disabled={isLoading || isPosting} />
          </div>
        )}
      </div>

      <div className="space-y-4">
        <div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Create Your Content</h3>
          <p className="text-sm text-gray-600">Start by writing your post or let AI generate ideas for you above.</p>
        </div>
        <div className="p-6 bg-white border border-gray-200 rounded-lg shadow-sm space-y-4">
          <ContentTypeSelector selected={contentType} onSelect={setContentType} disabled={isLoading || isPosting} />
          
          <textarea
            value={baseContent.description}
            onChange={handleDescriptionChange}
            placeholder={contentType === ContentType.Text ? "What's on your mind? Type your main post content here..." : `Describe your ${contentType.toLowerCase()} so the AI can write great content for it...`}
            className="w-full h-36 p-3 bg-gray-50 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition-colors text-gray-900 resize-y"
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
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 font-semibold text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 disabled:bg-gray-100 disabled:cursor-not-allowed transition-colors"
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
      
      <div className="space-y-4">
          <div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Select Platforms & Customize</h3>
            <p className="text-sm text-gray-600">Choose which platforms to post to and customize the content for each one.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {PLATFORM_DATA.map(p => (
              <PlatformSelectorCard
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

      <div className="p-6 bg-gray-50 border border-gray-200 rounded-lg shadow-sm">
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
            <div className="mt-4 p-4 bg-white rounded-lg border border-gray-300 flex flex-col sm:flex-row gap-4 items-center justify-center">
                <label className="flex flex-col gap-2 flex-1 max-w-xs">
                  <span className="text-sm font-medium text-gray-700">Schedule Date & Time</span>
                  <input
                      type="datetime-local"
                      value={scheduleDate}
                      onChange={(e) => setScheduleDate(e.target.value)}
                      className="bg-white border border-gray-300 text-gray-900 px-3 py-2 rounded-md focus:ring-blue-500 focus:border-blue-500 focus:outline-none"
                      min={new Date().toISOString().slice(0, 16)}
                  />
                </label>
                <button
                    onClick={handleScheduleConfirm}
                    className="px-6 py-3 font-semibold text-white bg-green-600 rounded-md hover:bg-green-700 transition-colors shadow-sm"
                >
                    Confirm Schedule
                </button>
            </div>
        )}
      </div>
    </div>
  );
};
