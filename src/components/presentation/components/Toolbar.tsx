import React, { useState } from "react";
import {
  Plus,
  Save,
  Play,
  Settings,
  Download,
  Presentation,
  Palette,
  Video,
  Image,
  AudioLines,
  Library,
} from "lucide-react";
import { SlideLayout, PresentationTheme } from "../types";
import SlideLayoutSelector from "./SlideLayoutSelector";
import ThemeSelector from "./ThemeSelector";
import MediaLibrary from "./MediaLibrary";

interface ToolbarProps {
  onAddSlide: (layout: SlideLayout) => void;
  onSave: () => void;
  onPresent: () => void;
  presentationTitle: string;
  onUpdateTitle: (title: string) => void;
  onExport: () => void;
  theme: PresentationTheme;
  onUpdateTheme: (theme: Partial<PresentationTheme>) => void;
  onAddMedia: (type: "video" | "image" | "audio") => void;
}

const Toolbar: React.FC<ToolbarProps> = ({
  onAddSlide,
  onSave,
  onPresent,
  presentationTitle,
  onUpdateTitle,
  onExport,
  theme,
  onUpdateTheme,
  onAddMedia,
}) => {
  const [showLayoutSelector, setShowLayoutSelector] = useState(false);
  const [showThemeSelector, setShowThemeSelector] = useState(false);
  const [showMediaLibrary, setShowMediaLibrary] = useState(false);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [title, setTitle] = useState(presentationTitle);
  const [showMediaMenu, setShowMediaMenu] = useState(false);

  const handleSelectLayout = (layout: SlideLayout) => {
    onAddSlide(layout);
    setShowLayoutSelector(false);
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value);
  };

  const handleTitleBlur = () => {
    setIsEditingTitle(false);
    onUpdateTitle(title);
  };

  const handleTitleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      setIsEditingTitle(false);
      onUpdateTitle(title);
    }
  };

  return (
    <div className="bg-white border-b border-gray-200 px-4 py-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <Presentation className="text-indigo-600 mr-2" size={24} />
          {isEditingTitle ? (
            <input
              type="text"
              value={title}
              onChange={handleTitleChange}
              onBlur={handleTitleBlur}
              onKeyDown={handleTitleKeyDown}
              className="border-b border-indigo-300 focus:outline-none focus:border-indigo-500 font-semibold text-lg px-1"
              autoFocus
            />
          ) : (
            <h1
              className="font-semibold text-lg cursor-pointer hover:text-indigo-600"
              onClick={() => setIsEditingTitle(true)}
            >
              {presentationTitle || "Untitled Presentation"}
            </h1>
          )}
        </div>

        <div className="flex items-center space-x-2">
          <div className="relative">
            <button
              className="flex items-center px-3 py-1.5 bg-indigo-600 text-white rounded hover:bg-indigo-700"
              onClick={() => setShowLayoutSelector(!showLayoutSelector)}
            >
              <Plus size={16} className="mr-1" />
              Add Slide
            </button>

            {showLayoutSelector && (
              <div className="absolute top-full right-0 mt-3   bg-white rounded-lg shadow-xl z-10 w-[470px]">
                <SlideLayoutSelector onSelectLayout={handleSelectLayout} />
              </div>
            )}
          </div>

          <div className="relative">
            <button
              className="flex items-center px-3 py-1.5 bg-purple-600 text-white rounded hover:bg-purple-700"
              onClick={() => setShowMediaMenu(!showMediaMenu)}
            >
              <Plus size={16} className="mr-1" />
              Add Media
            </button>

            {showMediaMenu && (
              <div className="absolute top-full right-0 mt-1 bg-white rounded-lg shadow-xl z-10 w-48">
                <div className="p-2">
                  <button
                    className="flex items-center w-full px-3 py-2 text-left hover:bg-gray-100 rounded"
                    onClick={() => {
                      onAddMedia("video");
                      setShowMediaMenu(false);
                    }}
                  >
                    <Video size={16} className="mr-2 text-indigo-600" />
                    Add Video
                  </button>
                  <button
                    className="flex items-center w-full px-3 py-2 text-left hover:bg-gray-100 rounded"
                    onClick={() => {
                      onAddMedia("image");
                      setShowMediaMenu(false);
                    }}
                  >
                    <Image size={16} className="mr-2 text-indigo-600" />
                    Add Image
                  </button>
                  <button
                    className="flex items-center w-full px-3 py-2 text-left hover:bg-gray-100 rounded"
                    onClick={() => {
                      onAddMedia("audio");
                      setShowMediaMenu(false);
                    }}
                  >
                    <AudioLines size={16} className="mr-2 text-indigo-600" />
                    Add Audio
                  </button>
                  <div className="border-t my-1"></div>
                  <button
                    className="flex items-center w-full px-3 py-2 text-left hover:bg-gray-100 rounded"
                    onClick={() => {
                      setShowMediaLibrary(true);
                      setShowMediaMenu(false);
                    }}
                  >
                    <Library size={16} className="mr-2 text-indigo-600" />
                    Media Library
                  </button>
                </div>
              </div>
            )}
          </div>

          <button
            className="flex items-center px-3 py-1.5 bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
            onClick={onSave}
          >
            <Save size={16} className="mr-1" />
            Save
          </button>

          <button
            className="flex items-center px-3 py-1.5 bg-green-600 text-white rounded hover:bg-green-700"
            onClick={onPresent}
          >
            <Play size={16} className="mr-1" />
            Present
          </button>

          <button
            className="p-1.5 text-gray-500 hover:text-indigo-600 rounded hover:bg-gray-100"
            onClick={() => setShowThemeSelector(true)}
          >
            <Palette size={18} />
          </button>

          <button
            className="p-1.5 text-gray-500 hover:text-gray-700 rounded hover:bg-gray-100"
            onClick={onExport}
          >
            <Download size={18} />
          </button>
        </div>
      </div>

      {showThemeSelector && (
        <ThemeSelector
          theme={theme}
          onUpdateTheme={onUpdateTheme}
          onClose={() => setShowThemeSelector(false)}
        />
      )}

      {showMediaLibrary && (
        <MediaLibrary onClose={() => setShowMediaLibrary(false)} />
      )}
    </div>
  );
};

export default Toolbar;
