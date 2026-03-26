import React, { useState } from "react";
// import Toolbar from './components/Toolbar';
// import SlideEditor from './components/SlideEditor';
// import SlideList from './components/SlideList';
// import PresentationMode from './components/PresentationMode';
// import NewPresentationModal from './components/NewPresentationModal';
// import MediaUploader from './components/MediaUploader';
import usePresentation from "./store/presentationStore";
import { SlideLayout, ContentType } from "./types";
import { PlusCircle } from "lucide-react";
import NewPresentationModal from "./components/NewPresentationModal";
import PresentationMode from "./components/PresentationMode";
import Toolbar from "./components/Toolbar";
import SlideList from "./components/SlideList";
import SlideEditor from "./components/SlideEditor";
import MediaUploader from "./components/MediaUploader";

function CreatePresentation() {
  const [presentationMode, setPresentationMode] = useState(false);
  const [showNewModal, setShowNewModal] = useState(false);
  const [showMediaUploader, setShowMediaUploader] = useState(false);
  const [mediaUploaderType, setMediaUploaderType] = useState<
    "image" | "video" | "audio"
  >("image");

  const {
    currentPresentation,
    currentSlideIndex,
    createPresentation,
    setCurrentSlideIndex,
    addSlide,
    deleteSlide,
    updateSlide,
    updateTheme,
    addMediaToCurrentSlide,
    useMediaInCurrentSlide,
  } = usePresentation();

  const handleAddSlide = (layout: SlideLayout) => {
    addSlide(layout);
  };

  const handleSave = () => {
    // In a real app, this would save to a backend
    const presentationData = JSON.stringify(currentPresentation);
    localStorage.setItem("savedPresentation", presentationData);
    alert("Presentation saved to local storage!");
  };

  const handlePresent = () => {
    setPresentationMode(true);
    sessionStorage.setItem("presentationMode", "true");
    // Dispatch custom event for presentation mode change
    window.dispatchEvent(new Event("presentationModeChange"));
  };

  const handleExitPresentation = () => {
    setPresentationMode(false);
    sessionStorage.setItem("presentationMode", "false");
    // Dispatch custom event for presentation mode change
    window.dispatchEvent(new Event("presentationModeChange"));
  };

  const handleCreatePresentation = (title: string) => {
    createPresentation(title);
    setShowNewModal(false);
  };

  const handleUpdateTitle = (title: string) => {
    if (currentPresentation) {
      updateSlide(currentPresentation.slides[0].id, { title });
    }
  };

  const handleExport = () => {
    // In a real app, this would export to PDF or other formats
    alert("Presentation export feature would be implemented here!");
  };

  const handleAddMedia = (type: "video" | "image" | "audio") => {
    setMediaUploaderType(type);
    setShowMediaUploader(true);
  };

  const handleMediaAdded = (mediaId: string) => {
    useMediaInCurrentSlide(mediaId);
  };

  // Try to load saved presentation from localStorage
  React.useEffect(() => {
    if (!currentPresentation) {
      const savedPresentation = localStorage.getItem("savedPresentation");
      if (savedPresentation) {
        try {
          const parsedPresentation = JSON.parse(savedPresentation);
          createPresentation(parsedPresentation.title);
        } catch (error) {
          console.error("Error loading saved presentation:", error);
        }
      }
    }
  }, [currentPresentation, createPresentation]);

  // // If no presentation exists, show the create new presentation screen
  if (!currentPresentation) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-lg text-center max-w-md">
          <h1 className="text-2xl font-bold mb-4">
            Welcome to Presentation Generator
          </h1>
          <p className="text-gray-600 mb-6">
            Create beautiful presentations with AI-powered features to enhance
            your content.
          </p>
          <button
            className="flex items-center justify-center w-full px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
            onClick={() => setShowNewModal(true)}
          >
            <PlusCircle className="mr-2" size={20} />
            Create New Presentation
          </button>
        </div>
        {showNewModal && (
          <NewPresentationModal
            onClose={() => setShowNewModal(false)}
            onCreatePresentation={handleCreatePresentation}
          />
        )}
      </div>
    );
  }

  const currentSlide = currentPresentation.slides[currentSlideIndex];

  if (presentationMode) {
    return (
      <PresentationMode
        slides={currentPresentation.slides}
        onExit={handleExitPresentation}
        theme={currentPresentation.theme}
      />
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      <Toolbar
        onAddSlide={handleAddSlide}
        onSave={handleSave}
        onPresent={handlePresent}
        presentationTitle={currentPresentation.title}
        onUpdateTitle={handleUpdateTitle}
        onExport={handleExport}
        theme={
          currentPresentation.theme || {
            primaryColor: "#4f46e5",
            secondaryColor: "#818cf8",
            fontFamily: "sans-serif",
            darkMode: false,
          }
        }
        onUpdateTheme={updateTheme}
        onAddMedia={handleAddMedia}
      />

      <div className="flex flex-1 overflow-hidden">
        <div className="w-64 border-r border-gray-200">
          <SlideList
            slides={currentPresentation.slides}
            currentIndex={currentSlideIndex}
            onSelectSlide={setCurrentSlideIndex}
            onDeleteSlide={deleteSlide}
          />
        </div>

        <div className="flex-1 p-8 overflow-auto flex items-center justify-center bg-gray-100">
          <div className="w-full max-w-4xl aspect-[16/9]">
            <SlideEditor slide={currentSlide} />
          </div>
        </div>
      </div>

      {showMediaUploader && (
        <MediaUploader
          type={mediaUploaderType}
          onClose={() => setShowMediaUploader(false)}
          onMediaAdded={handleMediaAdded}
        />
      )}
    </div>
  );
}

export default CreatePresentation;
