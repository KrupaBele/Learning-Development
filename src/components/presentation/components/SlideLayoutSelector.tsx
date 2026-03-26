import React from 'react';
import { SlideLayout } from '../types';
import { 
  LayoutTemplate, 
  Type, 
  Columns2, 
  Image, 
  ImagePlus, 
  Split, 
  Quote,
  Video,
  AudioLines
} from 'lucide-react';

interface SlideLayoutSelectorProps {
  onSelectLayout: (layout: SlideLayout) => void;
}

const layouts: Array<{ id: SlideLayout; name: string; icon: React.ReactNode }> = [
  { id: 'title', name: 'Title Slide', icon: <Type size={24} /> },
  { id: 'title-content', name: 'Title and Content', icon: <LayoutTemplate size={24} /> },
  { id: 'title-two-columns', name: 'Two Columns', icon: <Columns2 size={24} /> },
  { id: 'title-image', name: 'Title and Image', icon: <Image size={24} /> },
  { id: 'image-only', name: 'Image Only', icon: <Image size={24} /> },
  { id: 'title-image-text', name: 'Image and Text', icon: <ImagePlus size={24} /> },
  { id: 'comparison', name: 'Comparison', icon: <Split size={24} /> },
  { id: 'quote', name: 'Quote', icon: <Quote size={24} /> },
  { id: 'video', name: 'Video', icon: <Video size={24} /> },
  { id: 'title-video', name: 'Title and Video', icon: <Video size={24} /> }
];

const SlideLayoutSelector: React.FC<SlideLayoutSelectorProps> = ({ onSelectLayout }) => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 p-4">
      {layouts.map(layout => (
        <button
          key={layout.id}
          className="flex flex-col items-center justify-center p-4 border border-gray-200 rounded-lg hover:bg-indigo-50 hover:border-indigo-300 transition-colors"
          onClick={() => onSelectLayout(layout.id)}
        >
          <div className="text-indigo-600 mb-2">{layout.icon}</div>
          <span className="text-sm text-center">{layout.name}</span>
        </button>
      ))}
    </div>
  );
};

export default SlideLayoutSelector;