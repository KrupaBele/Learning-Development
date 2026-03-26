import React, { useState, useEffect } from "react";
import { Slide } from "../types";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import SlideLayouts from "./SlideLayouts";

interface PresentationModeProps {
  slides: Slide[];
  onExit: () => void;
  theme?: {
    fontFamily?: string;
    darkMode?: boolean;
  };
}

const PresentationMode: React.FC<PresentationModeProps> = ({
  slides,
  onExit,
  theme,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [transitioning, setTransitioning] = useState(false);
  const currentSlide = slides[currentIndex];

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === " ") {
        goToNextSlide();
      } else if (e.key === "ArrowLeft") {
        goToPrevSlide();
      } else if (e.key === "Escape") {
        onExit();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [currentIndex]);

  const goToNextSlide = () => {
    if (currentIndex < slides.length - 1 && !transitioning) {
      setTransitioning(true);
      setTimeout(() => {
        setCurrentIndex(currentIndex + 1);
        setTransitioning(false);
      }, 300);
    }
  };

  const goToPrevSlide = () => {
    if (currentIndex > 0 && !transitioning) {
      setTransitioning(true);
      setTimeout(() => {
        setCurrentIndex(currentIndex - 1);
        setTransitioning(false);
      }, 300);
    }
  };

  if (!currentSlide) {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center text-white">
        <p>No slides to present</p>
        <button
          className="absolute top-4 right-4 text-white p-2 rounded-full hover:bg-gray-800"
          onClick={onExit}
        >
          <X size={24} />
        </button>
      </div>
    );
  }

  const transitionClass = transitioning ? "opacity-0" : "opacity-100";
  const background = theme?.darkMode ? "bg-gray-900" : "bg-black";

  return (
    <div className={`fixed inset-0 ${background} flex flex-col`}>
      <div className="absolute top-4 right-4 flex space-x-2">
        <button
          className="text-white p-2 rounded-full hover:bg-gray-800"
          onClick={onExit}
        >
          <X size={24} />
        </button>
      </div>

      <div className="flex-1 flex items-center justify-center p-8">
        <div
          className={`bg-white w-full max-w-5xl aspect-[16/9] rounded-lg shadow-2xl overflow-hidden transition-opacity duration-300 ${transitionClass}`}
          style={{
            fontFamily: theme?.fontFamily || "sans-serif",
            color: theme?.darkMode ? "white" : "black",
          }}
        >
          <SlideLayouts
            layout={currentSlide.layout}
            title={currentSlide.title}
            content={currentSlide.content}
            onUpdateTitle={() => {}}
            onUpdateContent={() => {}}
            background={
              currentSlide.background || (theme?.darkMode ? "#1a1a1a" : "white")
            }
          />
        </div>
      </div>

      <div className="flex items-center justify-between p-4 text-white">
        <div className="flex items-center space-x-4">
          <button
            className={`p-2 rounded-full ${
              currentIndex > 0
                ? "hover:bg-gray-800"
                : "opacity-50 cursor-not-allowed"
            }`}
            onClick={goToPrevSlide}
            disabled={currentIndex === 0 || transitioning}
          >
            <ChevronLeft size={24} />
          </button>

          <button
            className={`p-2 rounded-full ${
              currentIndex < slides.length - 1
                ? "hover:bg-gray-800"
                : "opacity-50 cursor-not-allowed"
            }`}
            onClick={goToNextSlide}
            disabled={currentIndex === slides.length - 1 || transitioning}
          >
            <ChevronRight size={24} />
          </button>
        </div>

        <div>
          {currentIndex + 1} / {slides.length}
        </div>
      </div>
    </div>
  );
};

export default PresentationMode;
