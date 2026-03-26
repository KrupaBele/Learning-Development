import React from 'react';
import { Slide } from '../types';
import { Trash2 } from 'lucide-react';

interface SlideListProps {
  slides: Slide[];
  currentIndex: number;
  onSelectSlide: (index: number) => void;
  onDeleteSlide: (id: string) => void;
}

const SlideList: React.FC<SlideListProps> = ({
  slides,
  currentIndex,
  onSelectSlide,
  onDeleteSlide
}) => {
  return (
    <div className="bg-gray-100 p-4 overflow-y-auto h-full">
      <h2 className="text-lg font-semibold mb-4">Slides</h2>
      <div className="space-y-2">
        {slides.map((slide, index) => (
          <div
            key={slide.id}
            className={`flex items-center justify-between p-2 rounded cursor-pointer ${
              index === currentIndex ? 'bg-indigo-100 border-l-4 border-indigo-500' : 'bg-white hover:bg-gray-50'
            }`}
            onClick={() => onSelectSlide(index)}
          >
            <div className="flex items-center">
              <span className="w-6 h-6 flex items-center justify-center bg-indigo-600 text-white rounded-full text-xs mr-2">
                {index + 1}
              </span>
              <span className="truncate">{slide.title || `Slide ${index + 1}`}</span>
            </div>
            {slides.length > 1 && (
              <button
                className="text-gray-400 hover:text-red-500 p-1"
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteSlide(slide.id);
                }}
              >
                <Trash2 size={16} />
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default SlideList;