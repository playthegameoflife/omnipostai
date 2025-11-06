import React from 'react';
import { Platform, PlatformConfig } from '../types';
import { HashtagIcon } from './icons';
import Spinner from './Spinner';

interface PlatformSelectorCardProps {
  platform: PlatformConfig;
  isSelected: boolean;
  onToggle: (platformName: Platform, isSelected: boolean) => void;
  content: string;
  onContentChange: (platformName: Platform, content: string) => void;
  isLoading: boolean;
  onHashtagGenerate: (platformName: Platform) => void;
}

const PlatformSelectorCard: React.FC<PlatformSelectorCardProps> = ({
  platform,
  isSelected,
  onToggle,
  content,
  onContentChange,
  isLoading,
  onHashtagGenerate,
}) => {
  const Icon = platform.icon;

  return (
    <div
      className={`p-4 rounded-lg border-2 transition-all ${
        isSelected
          ? `border-purple-500 bg-purple-900/20 ${platform.color}`
          : 'border-gray-700 bg-gray-800/40 hover:border-gray-600'
      }`}
    >
      <div className="flex items-center justify-between mb-3">
        <button
          onClick={() => onToggle(platform.name, !isSelected)}
          disabled={isLoading}
          className="flex items-center gap-2 flex-1"
        >
          <div className={`p-2 rounded-lg ${platform.color} text-white`}>
            {Icon && <Icon className="w-5 h-5" />}
          </div>
          <span className="font-semibold text-white">{platform.name}</span>
        </button>
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={(e) => onToggle(platform.name, e.target.checked)}
            disabled={isLoading}
            className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
          />
        </div>
      </div>

      {isSelected && (
        <div className="space-y-3 mt-3">
          <textarea
            value={content}
            onChange={(e) => onContentChange(platform.name, e.target.value)}
            placeholder={`Enter your ${platform.name} post content...`}
            rows={4}
            className="w-full p-3 bg-gray-800/70 border border-gray-600 rounded-md focus:ring-2 focus:ring-purple-500 focus:outline-none transition-colors text-gray-200 resize-y"
            disabled={isLoading}
          />
          <button
            onClick={() => onHashtagGenerate(platform.name)}
            disabled={isLoading || !content.trim()}
            className="flex items-center justify-center gap-2 px-3 py-2 text-sm font-semibold text-white bg-purple-600 rounded-md hover:bg-purple-700 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? <Spinner className="w-4 h-4" /> : <HashtagIcon className="w-4 h-4" />}
            Generate Hashtags
          </button>
        </div>
      )}
    </div>
  );
};

export default PlatformSelectorCard;


