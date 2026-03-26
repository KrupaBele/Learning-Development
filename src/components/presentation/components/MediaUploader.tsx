import React, { useState } from 'react';
import { X, Upload, Image, Video, AudioLines } from 'lucide-react';
import usePresentation from '../store/presentationStore';

interface MediaUploaderProps {
  onClose: () => void;
  onMediaAdded: (mediaId: string) => void;
  type: 'image' | 'video' | 'audio';
}

const MediaUploader: React.FC<MediaUploaderProps> = ({ onClose, onMediaAdded, type }) => {
  const { addMediaToLibrary } = usePresentation();
  const [url, setUrl] = useState('');
  const [name, setName] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [prompt, setPrompt] = useState('');
  
  const handleAddMedia = () => {
    if (!url.trim() || !name.trim()) return;
    
    const mediaId = addMediaToLibrary({
      type,
      url,
      name,
      thumbnail: type === 'image' ? url : undefined
    });
    
    onMediaAdded(mediaId);
    onClose();
  };
  
  const handleGenerateFromPrompt = async () => {
    if (!prompt.trim()) return;
    
    setIsGenerating(true);
    
    try {
      // In a real app, this would call an AI service
      // For now, we'll simulate with a timeout and sample URLs
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      let generatedUrl = '';
      
      if (type === 'image') {
        // Sample image based on prompt
        generatedUrl = `https://source.unsplash.com/random/800x600/?${encodeURIComponent(prompt)}`;
      } else if (type === 'audio') {
        // Sample audio
        generatedUrl = 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3';
      }
      
      if (generatedUrl) {
        setUrl(generatedUrl);
        if (!name) {
          setName(prompt);
        }
      }
    } catch (error) {
      console.error('Error generating media:', error);
    } finally {
      setIsGenerating(false);
    }
  };
  
  const getTypeIcon = () => {
    switch (type) {
      case 'image': return <Image size={24} className="text-blue-500" />;
      case 'video': return <Video size={24} className="text-red-500" />;
      case 'audio': return <AudioLines size={24} className="text-green-500" />;
    }
  };
  
  const getTitle = () => {
    switch (type) {
      case 'image': return 'Add Image';
      case 'video': return 'Add Video';
      case 'audio': return 'Add Audio';
    }
  };
  
  const showGenerateOption = type === 'image' || type === 'audio';
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-xl font-semibold flex items-center">
            {getTypeIcon()}
            <span className="ml-2">{getTitle()}</span>
          </h2>
          <button 
            className="text-gray-500 hover:text-gray-700"
            onClick={onClose}
          >
            <X size={20} />
          </button>
        </div>
        
        <div className="p-6">
          <div className="mb-4">
            <label htmlFor="mediaName" className="block text-sm font-medium text-gray-700 mb-1">
              Name
            </label>
            <input
              type="text"
              id="mediaName"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder={`Enter a name for this ${type}`}
            />
          </div>
          
          <div className="mb-4">
            <label htmlFor="mediaUrl" className="block text-sm font-medium text-gray-700 mb-1">
              URL
            </label>
            <input
              type="text"
              id="mediaUrl"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder={`Enter ${type} URL`}
            />
          </div>
          
          {showGenerateOption && (
            <div className="mb-6 bg-gray-50 p-4 rounded-lg">
              <h3 className="text-sm font-medium text-gray-700 mb-2">
                {type === 'image' ? 'Generate Image from Prompt' : 'Generate Audio from Text'}
              </h3>
              <div className="flex">
                <input
                  type="text"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder={type === 'image' ? 'Describe the image you want' : 'Enter text to convert to speech'}
                  disabled={isGenerating}
                />
                <button
                  className="px-3 py-2 bg-indigo-600 text-white rounded-r-md hover:bg-indigo-700 disabled:opacity-50 flex items-center"
                  onClick={handleGenerateFromPrompt}
                  disabled={!prompt.trim() || isGenerating}
                >
                  {isGenerating ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-1"></div>
                  ) : (
                    <Upload size={16} className="mr-1" />
                  )}
                  Generate
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {type === 'image' 
                  ? 'AI will generate an image based on your description' 
                  : 'AI will convert your text to spoken audio'}
              </p>
            </div>
          )}
          
          {url && type === 'image' && (
            <div className="mb-4 p-2 border rounded-md">
              <img 
                src={url} 
                alt={name || 'Preview'} 
                className="max-h-[200px] mx-auto object-contain"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://via.placeholder.com/400x300?text=Image+Not+Found';
                }}
              />
            </div>
          )}
          
          {url && type === 'video' && (
            <div className="mb-4 p-2 border rounded-md">
              <div className="aspect-video bg-black flex items-center justify-center text-white">
                <Video size={48} />
              </div>
              <p className="text-xs text-center mt-1 text-gray-500">Video preview not available</p>
            </div>
          )}
          
          {url && type === 'audio' && (
            <div className="mb-4 p-2 border rounded-md">
              <audio controls className="w-full">
                <source src={url} />
                Your browser does not support the audio element.
              </audio>
            </div>
          )}
          
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-white bg-indigo-600 rounded-md hover:bg-indigo-700 disabled:opacity-50"
              onClick={handleAddMedia}
              disabled={!url.trim() || !name.trim()}
            >
              Add to Presentation
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MediaUploader;