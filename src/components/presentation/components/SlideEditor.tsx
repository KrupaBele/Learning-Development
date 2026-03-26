import React from 'react';
import { Slide } from '../types';
import SlideLayouts from './SlideLayouts';
import usePresentation from '../store/presentationStore';

interface SlideEditorProps {
  slide: Slide;
}

const SlideEditor: React.FC<SlideEditorProps> = ({ slide }) => {
  const updateSlide = usePresentation(state => state.updateSlide);
  const updateContent = usePresentation(state => state.updateContent);
  const currentPresentation = usePresentation(state => state.currentPresentation);
  
  const handleUpdateTitle = (title: string) => {
    updateSlide(slide.id, { title });
  };
  
  const handleUpdateContent = (contentId: string, value: string) => {
    updateContent(slide.id, contentId, { value });
  };
  
  // Get theme-based background if available
  const background = slide.background || 
    (currentPresentation?.theme?.darkMode ? '#1a1a1a' : 'white');
  
  return (
    <div 
      className="bg-white rounded-lg shadow-lg w-full h-full overflow-hidden"
      style={{ 
        fontFamily: currentPresentation?.theme?.fontFamily || 'sans-serif',
        color: currentPresentation?.theme?.darkMode ? 'white' : 'black'
      }}
    >
      <SlideLayouts
        layout={slide.layout}
        title={slide.title}
        content={slide.content}
        onUpdateTitle={handleUpdateTitle}
        onUpdateContent={handleUpdateContent}
        background={background}
      />
    </div>
  );
};

export default SlideEditor;