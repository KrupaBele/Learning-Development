import React, { useRef, useState } from "react";
import {
  Layout,
  Eye,
  Volume2,
  Play,
  Image as ImageIcon,
  Pause,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  X,
  Text,
} from "lucide-react";

export type ChapterLayout = {
  id: string;
  name: string;
  description: string;
  preview: string;
  icon: React.ReactNode;
};

export const chapterLayouts: ChapterLayout[] = [
  {
    id: "layout1",
    name: "Image Left, Content Right",
    description: "Image on the left side with title and content on the right",
    preview:
      "https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&auto=format&fit=crop&q=60",
    icon: <ImageIcon className="w-5 h-5 text-gray-400" />,
  },
  {
    id: "layout2",
    name: "Image Right, Content Left",
    description: "Image on the right side with title and content on the left",
    preview:
      "https://images.unsplash.com/photo-1593720219276-0b1eacd0aef4?w=800&auto=format&fit=crop&q=60",
    icon: <ImageIcon className="w-5 h-5 text-gray-400" />,
  },
  {
    id: "layout3",
    name: "Background Image with Card",
    description: "Full background image with content in a white card overlay",
    preview:
      "https://images.unsplash.com/photo-1627398242454-45a1465c2479?w=800&auto=format&fit=crop&q=60",
    icon: <Layout className="w-5 h-5 text-gray-400" />,
  },
  {
    id: "layout4",
    name: "Centered Header with Image",
    description: "Centered heading with full-width image and content below",
    preview:
      "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&auto=format&fit=crop&q=60",
    icon: <Layout className="w-5 h-5 text-gray-400" />,
  },
  {
    id: "layout5",
    name: "Image Top",
    description: "Full-width image at the top with content below",
    preview:
      "https://images.unsplash.com/photo-1527474305487-b87b222841cc?w=800&auto=format&fit=crop&q=60",
    icon: <ImageIcon className="w-5 h-5 text-gray-400" />,
  },
  {
    id: "layout6",
    name: "Image Bottom",
    description: "Content at the top with full-width image below",
    preview:
      "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&auto=format&fit=crop&q=60",
    icon: <ImageIcon className="w-5 h-5 text-gray-400" />,
  },
  {
    id: "layout7",
    name: "Classic Statement",
    description: "Bold statement with minimal supporting text",
    preview:
      "https://images.unsplash.com/photo-1506784983877-45594efa4cbe?w=800&auto=format&fit=crop&q=60",
    icon: <Text className="w-5 h-5 text-gray-400" />,
  },
  {
    id: "layout8",
    name: "Minimalist Quote",
    description: "Bold statement with minimal supporting text",
    preview:
      "https://images.unsplash.com/photo-1506784983877-45594efa4cbe?w=800&auto=format&fit=crop&q=60",
    icon: <Text className="w-5 h-5 text-gray-400" />,
  },
  {
    id: "layout9",
    name: "Gradient Statement",
    description: "Bold statement with minimal supporting text",
    preview:
      "https://images.unsplash.com/photo-1506784983877-45594efa4cbe?w=800&auto=format&fit=crop&q=60",
    icon: <Text className="w-5 h-5 text-gray-400" />,
  },
  {
    id: "layout10",
    name: "Boxed Statement",
    description: "Bold statement with minimal supporting text",
    preview:
      "https://images.unsplash.com/photo-1506784983877-45594efa4cbe?w=800&auto=format&fit=crop&q=60",
    icon: <Text className="w-5 h-5 text-gray-400" />,
  },
  {
    id: "layout11",
    name: "keynote-spotlight",
    description: "Highlight key information with dramatic typography",
    preview:
      "https://images.unsplash.com/photo-1506784983877-45594efa4cbe?w=800&auto=format&fit=crop&q=60",
    icon: <Text className="w-5 h-5 text-gray-400" />,
  },
];

interface ChapterLayoutSelectorProps {
  selectedLayout: string;
  onLayoutSelect: (layoutId: string) => void;
  layoutImage: string;
  layoutTitle: string;
  layoutContent: string;
  layoutAudio: string;
  onClick?: () => void;
}

export const ChapterLayoutSelector: React.FC<ChapterLayoutSelectorProps> = ({
  selectedLayout,
  onLayoutSelect,
  layoutImage,
  layoutTitle,
  layoutContent,
  layoutAudio,
  onClick,
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [previewLayout, setPreviewLayout] = useState<string | null>(null);

  const handlePreviewClick = (e: React.MouseEvent, layoutId: string) => {
    e.stopPropagation(); // Prevent the parent button click
    setPreviewLayout(layoutId);
  };

  const selectedLayoutData = chapterLayouts.find(
    (l) => l.id === selectedLayout
  );

  return (
    <div className="space-y-4">
      {/* Dropdown Layout Selector */}
      {/* <div className="relative">
        <button
          type="button"
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          className="w-full flex items-center justify-between px-4 py-3 bg-white dark:bg-dark-800 border border-gray-300 dark:border-dark-700 rounded-lg hover:bg-gray-50 dark:hover:bg-dark-700 transition-colors"
        >
          <div className="flex items-center space-x-3">
            <Layout className="w-5 h-5 text-gray-500" />
            <span className="text-gray-900 dark:text-white">
              {selectedLayoutData ? selectedLayoutData.name : "Select a layout"}
            </span>
          </div>
          <ChevronDown
            className={`w-5 h-5 text-gray-500 transition-transform ${
              isDropdownOpen ? "transform rotate-180" : ""
            }`}
          />
        </button>

        {isDropdownOpen && (
          <div className="absolute z-10 w-full mt-2 bg-white dark:bg-dark-800 border border-gray-200 dark:border-dark-700 rounded-lg shadow-lg">
            {chapterLayouts.map((layout) => (
              <div
                key={layout.id}
                className={`w-full px-4 py-3 hover:bg-gray-50 dark:hover:bg-dark-700 flex items-center justify-between group ${
                  selectedLayout === layout.id
                    ? "bg-blue-50 dark:bg-blue-900/30"
                    : ""
                }`}
              >
                <button
                  onClick={() => {
                    onLayoutSelect(layout.name);
                    setIsDropdownOpen(false);
                  }}
                  className="flex-1 flex items-center space-x-3 text-left"
                >
                  <Layout
                    className={`w-5 h-5 ${
                      selectedLayout === layout.id
                        ? "text-blue-500"
                        : "text-gray-400"
                    }`}
                  />
                  <div>
                    <p
                      className={`font-medium ${
                        selectedLayout === layout.id
                          ? "text-blue-600"
                          : "text-gray-900 dark:text-white"
                      }`}
                    >
                      {layout.name}
                    </p>
                    <p className="text-sm text-gray-500">
                      {layout.description}
                    </p>
                  </div>
                </button>
                <button
                  onClick={(e) => handlePreviewClick(e, layout.id)}
                  className="p-2 text-gray-400 hover:text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Eye className="w-5 h-5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div> */}

      {/* Layout Previews without Pagination */}
      <div
        className="bg-gray-50 dark:bg-dark-800 rounded-lg p-6 "
        onClick={onClick}
      >
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
          Layout Preview
        </h3>
        <div className="h-[400px] overflow-y-auto space-y-4 pr-2">
          {chapterLayouts.map((layout) => (
            <div
              key={layout.id}
              className={`relative rounded-lg border-2 overflow-hidden cursor-pointer transition-all ${
                selectedLayout === layout.id
                  ? "border-blue-500 ring-2 ring-blue-500 ring-opacity-50"
                  : "border-gray-200 dark:border-dark-700 hover:border-blue-200"
              }`}
              onClick={() => onLayoutSelect(layout.name)}
            >
              <div className="aspect-video relative">
                <img
                  src={layout.preview}
                  alt={layout.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                  <Layout className="w-8 h-8 text-white" />
                </div>
              </div>
              <div className="p-4">
                <h3 className="font-medium text-gray-900 dark:text-white">
                  {layout.name}
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                  {layout.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Layout Preview Modal */}
      {previewLayout && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-dark-800 rounded-xl w-full max-w-6xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white dark:bg-dark-800 p-4 border-b border-gray-200 dark:border-dark-700 flex items-center justify-between">
              <div className="flex items-center">
                <Eye className="w-5 h-5 text-gray-500 mr-2" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  Preview:{" "}
                  {chapterLayouts.find((l) => l.id === previewLayout)?.name}
                </h3>
              </div>
              <button
                onClick={() => setPreviewLayout(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4">
              <ChapterContent
                layout={previewLayout}
                title={layoutTitle}
                content={layoutContent}
                image={layoutImage}
                audio={layoutAudio}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

interface AudioControlsProps {
  isPlaying?: boolean;
  onPlayPause?: () => void;
}

const AudioControls: React.FC<AudioControlsProps> = ({
  isPlaying,
  onPlayPause,
}) => {
  return (
    <div className="absolute top-15 right-10 flex items-center space-x-2 bg-white/90 dark:bg-dark-700 backdrop-blur-sm rounded-xl px-1 h-7  shadow-lg">
      <button onClick={onPlayPause}>
        {isPlaying ? (
          <Pause className="w-5 h-5" />
        ) : (
          <Volume2 className="w-5 h-5" />
        )}
      </button>
    </div>
  );
};

interface ChapterContentProps {
  layout: string;
  title: string;
  content: string;
  image?: string;
  video?: string;
  audio?: string;
  editable?: boolean; // Add this flag
  onTitleChange?: (newTitle: string) => void;
  onContentChange?: (newContent: string) => void;
}

export const ChapterContent: React.FC<ChapterContentProps> = ({
  layout,
  title,
  content,
  image,
  video,
  audio,
  editable = false,
  onTitleChange,
  onContentChange,
}) => {
  const [editableTitle, setEditableTitle] = useState(title);
  const [editableContent, setEditableContent] = useState(content);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [isEditingContent, setIsEditingContent] = useState(false);

  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const togglePlayPause = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleTitleBlur = () => {
    setIsEditingTitle(false);
    if (onTitleChange) {
      onTitleChange(editableTitle);
    }
  };

  const handleContentBlur = () => {
    setIsEditingContent(false);
    if (onContentChange) {
      onContentChange(editableContent);
    }
  };

  const renderTitle = () => {
    // If not editable, return static title
    if (!editable) {
      return (
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
          {title}
        </h1>
      );
    }

    // Original editable implementation
    return isEditingTitle ? (
      <input
        type="text"
        value={editableTitle}
        onChange={(e) => setEditableTitle(e.target.value)}
        onBlur={handleTitleBlur}
        autoFocus
        className="text-3xl font-bold text-gray-900 dark:text-white mb-6 bg-transparent border-b border-gray-300 focus:border-blue-500 focus:outline-none"
      />
    ) : (
      <h1
        className="text-3xl font-bold text-gray-900 dark:text-white mb-6 cursor-text"
        onClick={() => setIsEditingTitle(true)}
      >
        {editableTitle}
      </h1>
    );
  };

  const renderContent = () => {
    // If not editable, return static content
    if (!editable) {
      return (
        <div
          className="prose prose-lg dark:prose-dark"
          dangerouslySetInnerHTML={{ __html: content }}
        />
      );
    }

    // Original editable implementation
    return isEditingContent ? (
      <textarea
        value={editableContent}
        onChange={(e) => setEditableContent(e.target.value)}
        onBlur={handleContentBlur}
        autoFocus
        className="w-full h-48 p-2 text-gray-900 dark:text-white bg-transparent border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
      />
    ) : (
      <div
        className="prose prose-lg dark:prose-dark cursor-text"
        onClick={() => setIsEditingContent(true)}
        dangerouslySetInnerHTML={{ __html: editableContent }}
      />
    );
  };

  const renderLayout = () => {
    switch (layout) {
      case "layout1":
        return (
          <div className="flex flex-col lg:flex-row min-h-[600px] relative">
            <div className="lg:w-1/2 relative">
              {image && (
                <img
                  src={image}
                  alt={editableTitle}
                  className="w-full h-full object-cover"
                />
              )}
              {/* {video && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                  <Play className="w-12 h-12 text-white" />
                </div>
              )} */}
            </div>
            <div className="lg:w-1/2 p-8">
              {renderTitle()}
              {renderContent()}
            </div>
          </div>
        );

      case "layout2":
        return (
          <div className="flex flex-col lg:flex-row min-h-[600px] relative">
            <div className="lg:w-1/2 p-8">
              {renderTitle()}
              {renderContent()}
            </div>
            <div className="lg:w-1/2 relative">
              {image && (
                <img
                  src={image}
                  alt={editableTitle}
                  className="w-full h-full object-cover"
                />
              )}
              {/* {video && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                  <Play className="w-12 h-12 text-white" />
                </div>
              )} */}
            </div>
          </div>
        );

      case "layout3":
        return (
          <div className="relative min-h-[600px]">
            {image && (
              <img
                src={image}
                alt={editableTitle}
                className="absolute inset-0 w-full h-full object-cover"
              />
            )}
            <div className="absolute inset-0 bg-black/50" />
            <div className="relative z-10 max-w-4xl mx-auto p-8">
              <div className="bg-white dark:bg-dark-700 rounded-xl shadow-xl p-8">
                {renderTitle()}
                {renderContent()}
              </div>
            </div>
          </div>
        );

      case "layout4":
        return (
          <div className="min-h-[600px] relative">
            <div className="text-center p-8 text-gray-900 dark:text-white overflow-hidden rounded-t-xl">
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
                {renderTitle()}
              </h1>
            </div>
            {image && (
              <div className="relative h-96">
                <img
                  src={image}
                  alt={editableTitle}
                  className="w-full h-full object-cover"
                />
                {/* {video && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                    <Play className="w-12 h-12 text-white" />
                  </div>
                )} */}
              </div>
            )}
            <div className="max-w-4xl mx-auto p-8">{renderContent()}</div>
          </div>
        );

      case "layout5":
        return (
          <div className="min-h-[600px] relative">
            {image && (
              <div className="relative h-96">
                <img
                  src={image}
                  alt={editableTitle}
                  className="w-full h-full object-cover"
                />
                {/* {video && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                    <Play className="w-12 h-12 text-white" />
                  </div>
                )} */}
              </div>
            )}
            <div className="max-w-4xl mx-auto p-8">
              {renderTitle()}
              {renderContent()}
            </div>
          </div>
        );

      case "layout6":
        return (
          <div className="min-h-[600px] relative">
            <div className="max-w-4xl mx-auto p-8">
              {renderTitle()}
              {renderContent()}
            </div>
            {image && (
              <div className="relative h-96">
                <img
                  src={image}
                  alt={editableTitle}
                  className="w-full h-full object-cover"
                />
                {/* {video && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                    <Play className="w-12 h-12 text-white" />
                  </div>
                )} */}
              </div>
            )}
          </div>
        );

      case "layout7":
        return (
          <div className="min-h-[600px] flex items-center justify-center bg-gray-100 dark:bg-dark-700 p-8">
            <div className="max-w-3xl text-center">
              {renderTitle()}
              {renderContent()}
            </div>
          </div>
        );

      case "layout8":
        return (
          <div className="min-h-[600px] flex items-center justify-center relative bg-white dark:bg-dark-800 p-8">
            <div className="max-w-3xl text-center">
              {isEditingContent ? (
                <textarea
                  value={editableContent}
                  onChange={(e) => setEditableContent(e.target.value)}
                  onBlur={handleContentBlur}
                  autoFocus
                  className="w-full h-48 p-2 italic text-3xl text-gray-700 dark:text-gray-300 bg-transparent border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                />
              ) : (
                <div
                  className="italic text-3xl text-gray-700 dark:text-gray-300 border-l-4 border-blue-500 pl-4 cursor-text"
                  onClick={() => setIsEditingContent(true)}
                  dangerouslySetInnerHTML={{ __html: editableContent }}
                />
              )}
              {isEditingTitle ? (
                <input
                  type="text"
                  value={editableTitle}
                  onChange={(e) => setEditableTitle(e.target.value)}
                  onBlur={handleTitleBlur}
                  autoFocus
                  className="text-2xl font-bold text-gray-900 dark:text-white mt-4 bg-transparent border-b border-gray-300 focus:border-blue-500 focus:outline-none"
                />
              ) : (
                <h1
                  className="text-2xl font-bold text-gray-900 dark:text-white mt-4 cursor-text"
                  onClick={() => setIsEditingTitle(true)}
                >
                  —{editableTitle}
                </h1>
              )}
            </div>
          </div>
        );
      case "layout9":
        return (
          <div className="min-h-[600px] flex items-center relative justify-center bg-gray-50 dark:bg-dark-900 p-8">
            <div className="max-w-4xl text-center">
              {isEditingTitle ? (
                <input
                  type="text"
                  value={editableTitle}
                  onChange={(e) => setEditableTitle(e.target.value)}
                  onBlur={handleTitleBlur}
                  autoFocus
                  className="text-6xl font-extrabold text-gray-900 dark:text-white mb-6 bg-transparent border-b border-gray-300 focus:border-blue-500 focus:outline-none"
                />
              ) : (
                <h1
                  className="text-6xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-blue-500 cursor-text"
                  onClick={() => setIsEditingTitle(true)}
                >
                  {editableTitle}
                </h1>
              )}
              {isEditingContent ? (
                <textarea
                  value={editableContent}
                  onChange={(e) => setEditableContent(e.target.value)}
                  onBlur={handleContentBlur}
                  autoFocus
                  className="w-full h-48 p-2 text-gray-600 dark:text-gray-300 bg-transparent border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                />
              ) : (
                <div
                  className="text-2xl text-gray-600 dark:text-gray-300 mt-4 cursor-text prose prose-lg dark:prose-invert"
                  onClick={() => setIsEditingContent(true)}
                  dangerouslySetInnerHTML={{
                    __html: editableContent || "<p>Click to edit content</p>",
                  }}
                />
              )}
            </div>
          </div>
        );
      case "layout10":
        return (
          <div className="min-h-[600px] flex items-center relative justify-center bg-gray-200 dark:bg-dark-800 p-8">
            <div className="max-w-3xl bg-white dark:bg-dark-700 p-6 shadow-xl rounded-lg text-center">
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
                {renderTitle()}
              </h1>
              <p className="text-xl text-gray-600 dark:text-gray-300">
                {renderContent()}
              </p>
            </div>
          </div>
        );

      case "layout11":
        return (
          <div className="min-h-[600px] relative bg-gradient-to-br from-gray-900 to-blue-900 p-16">
            <div className="max-w-5xl mx-auto">
              {isEditingTitle ? (
                <input
                  type="text"
                  value={editableTitle}
                  onChange={(e) => setEditableTitle(e.target.value)}
                  onBlur={handleTitleBlur}
                  autoFocus
                  className="text-6xl font-extrabold text-white dark:text-white mb-6 bg-transparent border-b border-gray-300 focus:border-blue-500 focus:outline-none"
                />
              ) : (
                <h1
                  className="text-8xl font-bold mb-8 text-center bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400"
                  onClick={() => setIsEditingTitle(true)}
                >
                  {editableTitle}
                </h1>
              )}

              <div className="text-3xl font-light text-center text-blue-100 leading-relaxed">
                {renderContent()}
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="bg-white dark:bg-dark-800 rounded-xl shadow-sm overflow-hidden">
      {audio && (
        <>
          <audio
            ref={audioRef}
            src={audio}
            onEnded={() => setIsPlaying(false)}
            className="hidden"
          />
          <AudioControls isPlaying={isPlaying} onPlayPause={togglePlayPause} />
        </>
      )}
      {renderLayout()}
    </div>
  );
};

interface ChapterPreviewProps {
  layout: string;
  onClose: () => void;
  layoutImage: string;
  layoutTitle: string;
  layoutContent: string;
  layoutAudio: string;
  onTitleChange: (newTitle: string) => void;
  onContentChange: (newContent: string) => void;
}

export const ChapterPreview: React.FC<ChapterPreviewProps> = ({
  layout,
  onClose,
  layoutImage,
  layoutTitle,
  layoutContent,
  layoutAudio,
  onTitleChange,
  onContentChange,
}) => {
  const [currentLayout, setCurrentLayout] = useState(layout);
  const selectedLayout = chapterLayouts.find((l) => l.name === currentLayout);

  const handleNext = () => {
    const currentIndex = chapterLayouts.findIndex(
      (l) => l.name === currentLayout
    );
    const nextIndex =
      currentIndex < chapterLayouts.length - 1 ? currentIndex + 1 : 0;
    setCurrentLayout(chapterLayouts[nextIndex].name);
  };

  const handlePrev = () => {
    const currentIndex = chapterLayouts.findIndex(
      (l) => l.name === currentLayout
    );
    const prevIndex =
      currentIndex > 0 ? currentIndex - 1 : chapterLayouts.length - 1;
    setCurrentLayout(chapterLayouts[prevIndex].name);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-dark-800 rounded-xl w-full max-w-6xl max-h-[90vh] flex flex-col">
        <div className="sticky top-0 bg-white dark:bg-dark-800 p-4 border-b border-gray-200 dark:border-dark-700 flex items-center justify-between z-10">
          <div className="flex items-center">
            <Eye className="w-5 h-5 text-gray-500 mr-2" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              Preview: {selectedLayout?.name}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          <ChapterContent
            editable={true}
            layout={selectedLayout?.id || ""}
            title={layoutTitle || "Sample Chapter Title"}
            content={
              layoutContent ||
              "This is a preview of how your content will look with this layout. The actual content will be replaced with your chapter content."
            }
            image={
              layoutImage ||
              "https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&auto=format&fit=crop&q=60"
            }
            audio={layoutAudio}
            onTitleChange={onTitleChange}
            onContentChange={onContentChange}
          />
        </div>

        {/* Navigation buttons */}
        <div className="sticky bottom-0 bg-white dark:bg-dark-800 p-3 border-t border-gray-200 dark:border-dark-700 flex items-center justify-between z-10">
          <button
            onClick={handlePrev}
            className="flex items-center space-x-2 px-4 py-2 bg-gray-100 dark:bg-dark-700 rounded-lg hover:bg-gray-200 dark:hover:bg-dark-600 transition-colors"
          >
            <ChevronLeft className="w-5 h-3" />
            <span>Previous</span>
          </button>

          <button
            onClick={handleNext}
            className="flex items-center space-x-2 px-4 py-2 bg-gray-100 dark:bg-dark-700 rounded-lg hover:bg-gray-200 dark:hover:bg-dark-600 transition-colors"
          >
            <span>Next</span>
            <ChevronRight className="w-5 h-3" />
          </button>
        </div>
      </div>
    </div>
  );
};
