import React from "react";
import { SlideLayout, SlideContent } from "../types";
import ReactPlayer from "react-player";
import { Image, Video, AudioLines } from "lucide-react";
import EditableContent from "./EditableContent";

interface SlideLayoutProps {
  layout: SlideLayout;
  title: string;
  content: SlideContent[];
  onUpdateTitle: (title: string) => void;
  onUpdateContent: (contentId: string, value: string) => void;
  background?: string;
}

const SlideLayouts: React.FC<SlideLayoutProps> = ({
  layout,
  title,
  content,
  onUpdateTitle,
  onUpdateContent,
  background,
}) => {
  const getContentByPosition = (position: string) => {
    return content.find((c) => c.position === position);
  };

  const renderContent = (contentItem: SlideContent | undefined) => {
    if (!contentItem) return null;

    const style = contentItem.style || {};
    const textStyle = {
      color: style.color || "inherit",
      fontSize: style.fontSize || "inherit",
      fontWeight: style.fontWeight || "inherit",
      textAlign: style.textAlign || "inherit",
    };

    switch (contentItem.type) {
      case "text":
        return (
          <EditableContent
            value={contentItem.value}
            onChange={(value) => onUpdateContent(contentItem.id, value)}
            className="min-h-[100px]"
            //@ts-ignore
            style={textStyle}
          />
        );
      case "image":
        return (
          <div className="flex flex-col items-center">
            {contentItem.value ? (
              <div className="relative group">
                <img
                  src={contentItem.value}
                  alt="Slide content"
                  className="max-h-[300px] object-contain rounded"
                />
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all duration-200 rounded"></div>
              </div>
            ) : (
              <div className="w-full h-[200px] bg-gray-200 flex items-center justify-center text-gray-500 rounded">
                <div className="text-center p-4">
                  <Image size={48} className="mx-auto mb-2 text-gray-400" />
                  <p>Enter image URL below or select from library</p>
                </div>
              </div>
            )}
            <EditableContent
              value={contentItem.value}
              onChange={(value) => onUpdateContent(contentItem.id, value)}
              className="text-sm text-gray-500 mt-2 w-full"
              placeholder="Enter image URL or prompt for AI generation"
            />
          </div>
        );
      case "video":
        return (
          <div className="flex flex-col items-center">
            {contentItem.value ? (
              <div className="w-full aspect-video rounded overflow-hidden">
                <ReactPlayer
                  url={contentItem.value}
                  width="100%"
                  height="100%"
                  controls
                  light={true}
                />
              </div>
            ) : (
              <div className="w-full h-[200px] bg-gray-200 flex items-center justify-center text-gray-500 rounded">
                <div className="text-center p-4">
                  <Video size={48} className="mx-auto mb-2 text-gray-400" />
                  <p>Enter video URL below or select from library</p>
                </div>
              </div>
            )}
            <EditableContent
              value={contentItem.value}
              onChange={(value) => onUpdateContent(contentItem.id, value)}
              className="text-sm text-gray-500 mt-2 w-full"
              placeholder="Enter video URL (YouTube, Vimeo, etc.)"
            />
          </div>
        );
      case "audio":
        return (
          <div className="flex flex-col items-center">
            {contentItem.value ? (
              <div className="w-full bg-gray-100 p-4 rounded">
                <audio controls className="w-full">
                  <source src={contentItem.value} />
                  Your browser does not support the audio element.
                </audio>
                <div className="mt-2 flex justify-center">
                  <div className="w-full max-w-[300px] h-[40px] bg-gray-200 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 w-[60%]"></div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="w-full h-[120px] bg-gray-200 flex items-center justify-center text-gray-500 rounded">
                <div className="text-center p-4">
                  <AudioLines
                    size={48}
                    className="mx-auto mb-2 text-gray-400"
                  />
                  <p>Enter audio URL below or select from library</p>
                </div>
              </div>
            )}
            <EditableContent
              value={contentItem.value}
              onChange={(value) => onUpdateContent(contentItem.id, value)}
              className="text-sm text-gray-500 mt-2 w-full"
              placeholder="Enter audio URL or generate from text"
            />
          </div>
        );
      case "graph":
        return (
          <div className="w-full h-[200px] bg-gray-200 flex items-center justify-center text-gray-500">
            Graph Visualization
            <EditableContent
              value={contentItem.value}
              onChange={(value) => onUpdateContent(contentItem.id, value)}
              className="hidden"
            />
          </div>
        );
      case "table":
        return (
          <div className="w-full overflow-x-auto">
            <table className="min-w-full border-collapse border border-gray-300">
              <tbody>
                {contentItem.value.split("\n").map((row, rowIndex) => (
                  <tr key={rowIndex}>
                    {row.split("|").map((cell, cellIndex) => (
                      <td
                        key={cellIndex}
                        className="border border-gray-300 p-2"
                      >
                        {cell.trim()}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
            <EditableContent
              value={contentItem.value}
              onChange={(value) => onUpdateContent(contentItem.id, value)}
              className="hidden"
            />
          </div>
        );
      case "quote":
        return (
          <blockquote className="border-l-4 border-indigo-500 pl-4 italic">
            <EditableContent
              value={contentItem.value}
              onChange={(value) => onUpdateContent(contentItem.id, value)}
              className="min-h-[50px]"
              //@ts-ignore
              style={textStyle}
            />
          </blockquote>
        );
      default:
        return null;
    }
  };

  const containerStyle = {
    backgroundColor: background || "white",
  };

  switch (layout) {
    case "title":
      return (
        <div
          className="flex flex-col items-center justify-center h-full text-center px-12"
          style={containerStyle}
        >
          <EditableContent
            value={title}
            onChange={onUpdateTitle}
            className="text-2xl font-bold mb-6"
          />
          {renderContent(getContentByPosition("center"))}
        </div>
      );

    case "title-content":
      return (
        <div className="flex flex-col h-full px-12 py-8" style={containerStyle}>
          <EditableContent
            value={title}
            onChange={onUpdateTitle}
            className="text-3xl font-bold mb-6"
          />
          <div className="flex-1">
            {renderContent(getContentByPosition("full") || content[0])}
          </div>
        </div>
      );

    case "title-two-columns":
      return (
        <div className="flex flex-col h-full px-12 py-8" style={containerStyle}>
          <EditableContent
            value={title}
            onChange={onUpdateTitle}
            className="text-3xl font-bold mb-6"
          />
          <div className="flex flex-1 gap-8">
            <div className="flex-1">
              {renderContent(getContentByPosition("left"))}
            </div>
            <div className="flex-1">
              {renderContent(getContentByPosition("right"))}
            </div>
          </div>
        </div>
      );

    case "title-image":
      return (
        <div className="flex flex-col h-full px-12 py-8" style={containerStyle}>
          <EditableContent
            value={title}
            onChange={onUpdateTitle}
            className="text-3xl font-bold mb-6"
          />
          <div className="flex-1 flex justify-center">
            {renderContent(
              content.find((c) => c.type === "image") || content[0]
            )}
          </div>
        </div>
      );

    case "image-only":
      return (
        <div
          className="flex items-center justify-center h-full px-12 py-8"
          style={containerStyle}
        >
          <div className="max-w-[80%] max-h-[80%]">
            {renderContent(
              content.find((c) => c.type === "image") || content[0]
            )}
          </div>
        </div>
      );

    case "title-image-text":
      return (
        <div className="flex flex-col h-full px-12 py-8" style={containerStyle}>
          <EditableContent
            value={title}
            onChange={onUpdateTitle}
            className="text-3xl font-bold mb-6"
          />
          <div className="flex gap-8 flex-1">
            <div className="flex-1">
              {renderContent(content.find((c) => c.type === "image"))}
            </div>
            <div className="flex-1">
              {renderContent(content.find((c) => c.type === "text"))}
            </div>
          </div>
        </div>
      );

    case "comparison":
      return (
        <div className="flex flex-col h-full px-12 py-8" style={containerStyle}>
          <EditableContent
            value={title}
            onChange={onUpdateTitle}
            className="text-3xl font-bold mb-6"
          />
          <div className="flex flex-1 gap-8">
            <div className="flex-1 border-r border-gray-300 pr-4">
              <h3 className="text-xl font-semibold mb-4">Option A</h3>
              {renderContent(getContentByPosition("left"))}
            </div>
            <div className="flex-1 pl-4">
              <h3 className="text-xl font-semibold mb-4">Option B</h3>
              {renderContent(getContentByPosition("right"))}
            </div>
          </div>
        </div>
      );

    case "quote":
      return (
        <div
          className="flex flex-col items-center justify-center h-full px-16 py-12 text-center"
          style={containerStyle}
        >
          <div className="text-6xl text-indigo-300 mb-6">"</div>
          {renderContent(content.find((c) => c.type === "quote") || content[0])}
          <EditableContent
            value={title}
            onChange={onUpdateTitle}
            className="text-xl font-medium mt-8"
            placeholder="Source"
          />
        </div>
      );

    case "video":
      return (
        <div className="flex flex-col h-full px-12 py-8" style={containerStyle}>
          <div className="flex-1 flex justify-center items-center">
            {renderContent(
              content.find((c) => c.type === "video") || content[0]
            )}
          </div>
        </div>
      );

    case "title-video":
      return (
        <div className="flex flex-col h-full px-12 py-8" style={containerStyle}>
          <EditableContent
            value={title}
            onChange={onUpdateTitle}
            className="text-3xl font-bold mb-6"
          />
          <div className="flex-1 flex justify-center">
            {renderContent(
              content.find((c) => c.type === "video") || content[0]
            )}
          </div>
        </div>
      );

    default:
      return (
        <div className="flex flex-col h-full px-12 py-8" style={containerStyle}>
          <EditableContent
            value={title}
            onChange={onUpdateTitle}
            className="text-3xl font-bold mb-6"
          />
          <div className="flex-1">
            {content.map((item) => (
              <div key={item.id} className="mb-4">
                {renderContent(item)}
              </div>
            ))}
          </div>
        </div>
      );
  }
};

export default SlideLayouts;
