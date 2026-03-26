import React, { useState } from 'react';
import { X, Trash2, Plus, Image, Video, AudioLines, ExternalLink } from 'lucide-react';
import { MediaItem } from '../types';
import usePresentation from '../store/presentationStore';

interface MediaLibraryProps {
  onClose: () => void;
}

const MediaLibrary: React.FC<MediaLibraryProps> = ({ onClose }) => {
  const { currentPresentation, addMediaToLibrary, deleteMediaFromLibrary, useMediaInCurrentSlide } = usePresentation();
  const [newMediaUrl, setNewMediaUrl] = useState('');
  const [newMediaName, setNewMediaName] = useState('');
  const [newMediaType, setNewMediaType] = useState<'image' | 'video' | 'audio'>('image');
  const [showAddForm, setShowAddForm] = useState(false);
  
  const mediaItems = currentPresentation?.mediaLibrary || [];
  
  const handleAddMedia = () => {
    if (!newMediaUrl.trim() || !newMediaName.trim()) return;
    
    addMediaToLibrary({
      type: newMediaType,
      url: newMediaUrl,
      name: newMediaName,
      thumbnail: newMediaType === 'image' ? newMediaUrl : undefined
    });
    
    setNewMediaUrl('');
    setNewMediaName('');
    setShowAddForm(false);
  };
  
  const handleUseMedia = (mediaId: string) => {
    useMediaInCurrentSlide(mediaId);
    onClose();
  };
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };
  
  const getMediaTypeIcon = (type: string) => {
    switch (type) {
      case 'image': return <Image size={16} className="text-blue-500" />;
      case 'video': return <Video size={16} className="text-red-500" />;
      case 'audio': return <AudioLines size={16} className="text-green-500" />;
      default: return null;
    }
  };
  
  const renderThumbnail = (item: MediaItem) => {
    if (item.type === 'image' && item.url) {
      return (
        <div className="w-16 h-16 bg-gray-100 rounded overflow-hidden flex items-center justify-center">
          <img src={item.url} alt={item.name} className="max-w-full max-h-full object-contain" />
        </div>
      );
    } else if (item.type === 'video') {
      return (
        <div className="w-16 h-16 bg-gray-800 rounded overflow-hidden flex items-center justify-center">
          <Video size={24} className="text-white" />
        </div>
      );
    } else if (item.type === 'audio') {
      return (
        <div className="w-16 h-16 bg-gray-100 rounded overflow-hidden flex items-center justify-center">
          <AudioLines size={24} className="text-gray-600" />
        </div>
      );
    }
    
    return (
      <div className="w-16 h-16 bg-gray-100 rounded overflow-hidden flex items-center justify-center">
        <Image size={24} className="text-gray-400" />
      </div>
    );
  };
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[80vh] flex flex-col">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-xl font-semibold">Media Library</h2>
          <button 
            className="text-gray-500 hover:text-gray-700"
            onClick={onClose}
          >
            <X size={20} />
          </button>
        </div>
        
        <div className="p-4 flex-1 overflow-y-auto">
          {mediaItems.length === 0 && !showAddForm ? (
            <div className="text-center py-8">
              <p className="text-gray-500 mb-4">Your media library is empty</p>
              <button
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                onClick={() => setShowAddForm(true)}
              >
                Add Media
              </button>
            </div>
          ) : (
            <>
              {!showAddForm && (
                <div className="mb-4">
                  <button
                    className="flex items-center px-3 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
                    onClick={() => setShowAddForm(true)}
                  >
                    <Plus size={16} className="mr-1" />
                    Add New Media
                  </button>
                </div>
              )}
              
              {showAddForm && (
                <div className="bg-gray-50 p-4 rounded-lg mb-4">
                  <h3 className="font-medium mb-3">Add New Media</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Media Type
                      </label>
                      <div className="flex space-x-2">
                        <button
                          className={`flex items-center px-3 py-1.5 rounded ${newMediaType === 'image' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100'}`}
                          onClick={() => setNewMediaType('image')}
                        >
                          <Image size={16} className="mr-1" />
                          Image
                        </button>
                        <button
                          className={`flex items-center px-3 py-1.5 rounded ${newMediaType === 'video' ? 'bg-red-100 text-red-700' : 'bg-gray-100'}`}
                          onClick={() => setNewMediaType('video')}
                        >
                          <Video size={16} className="mr-1" />
                          Video
                        </button>
                        <button
                          className={`flex items-center px-3 py-1.5 rounded ${newMediaType === 'audio' ? 'bg-green-100 text-green-700' : 'bg-gray-100'}`}
                          onClick={() => setNewMediaType('audio')}
                        >
                          <AudioLines size={16} className="mr-1" />
                          Audio
                        </button>
                      </div>
                    </div>
                    
                    <div>
                      <label htmlFor="mediaName" className="block text-sm font-medium text-gray-700 mb-1">
                        Name
                      </label>
                      <input
                        type="text"
                        id="mediaName"
                        value={newMediaName}
                        onChange={(e) => setNewMediaName(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        placeholder="Enter a name for this media"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="mediaUrl" className="block text-sm font-medium text-gray-700 mb-1">
                        URL
                      </label>
                      <input
                        type="text"
                        id="mediaUrl"
                        value={newMediaUrl}
                        onChange={(e) => setNewMediaUrl(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        placeholder={`Enter ${newMediaType} URL`}
                      />
                    </div>
                    
                    <div className="flex justify-end space-x-2">
                      <button
                        className="px-3 py-1.5 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
                        onClick={() => setShowAddForm(false)}
                      >
                        Cancel
                      </button>
                       <button
  className="px-3 py-1.5 bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:opacity-50"
  onClick={handleAddMedia}
  disabled={!newMediaUrl.trim() || !newMediaName.trim()}
>
  Add to Library
</button>
                    </div>
                  </div>
                </div>
              )}
              
              <div className="space-y-2">
                {mediaItems.map(item => (
                  <div key={item.id} className="flex items-center p-3 border rounded-lg hover:bg-gray-50">
                    {renderThumbnail(item)}
                    
                    <div className="ml-3 flex-1">
                      <div className="flex items-center">
                        {getMediaTypeIcon(item.type)}
                        <span className="font-medium ml-1">{item.name}</span>
                      </div>
                      <div className="text-sm text-gray-500 flex items-center">
                        <span className="truncate max-w-[200px]">{item.url}</span>
                        <a 
                          href={item.url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="ml-1 text-indigo-500 hover:text-indigo-700"
                        >
                          <ExternalLink size={12} />
                        </a>
                      </div>
                      <div className="text-xs text-gray-400">
                        Added: {formatDate(item.dateAdded)}
                      </div>
                    </div>
                    
                    <div className="flex space-x-2">
                      <button
                        className="px-3 py-1.5 bg-indigo-100 text-indigo-700 rounded hover:bg-indigo-200"
                        onClick={() => handleUseMedia(item.id)}
                      >
                        Use
                      </button>
                      <button
                        className="p-1.5 text-gray-400 hover:text-red-500 rounded hover:bg-gray-100"
                        onClick={() => deleteMediaFromLibrary(item.id)}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default MediaLibrary;