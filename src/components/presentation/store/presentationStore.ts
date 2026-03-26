import { create } from "zustand";
import { v4 as uuidv4 } from "uuid";
import {
  Presentation,
  Slide,
  SlideContent,
  SlideLayout,
  PresentationTheme,
  ContentType,
  MediaItem,
} from "../types";

interface PresentationState {
  presentations: Presentation[];
  currentPresentation: Presentation | null;
  currentSlideIndex: number;

  createPresentation: (title: string) => void;
  setCurrentPresentation: (id: string) => void;
  setCurrentSlideIndex: (index: number) => void;

  addSlide: (layout: SlideLayout) => void;
  updateSlide: (slideId: string, updates: Partial<Slide>) => void;
  deleteSlide: (slideId: string) => void;

  addContent: (slideId: string, content: Omit<SlideContent, "id">) => void;
  updateContent: (
    slideId: string,
    contentId: string,
    updates: Partial<SlideContent>
  ) => void;
  deleteContent: (slideId: string, contentId: string) => void;

  updateTheme: (updates: Partial<PresentationTheme>) => void;
  addMediaToCurrentSlide: (type: ContentType) => void;

  // Media library functions
  addMediaToLibrary: (media: Omit<MediaItem, "id" | "dateAdded">) => string;
  deleteMediaFromLibrary: (mediaId: string) => void;
  useMediaInCurrentSlide: (mediaId: string) => void;
}

const defaultTheme: PresentationTheme = {
  primaryColor: "#4f46e5",
  secondaryColor: "#818cf8",
  fontFamily: "sans-serif",
  darkMode: false,
};

const usePresentation = create<PresentationState>((set, get) => ({
  presentations: [],
  currentPresentation: null,
  currentSlideIndex: 0,

  createPresentation: (title) => {
    const newPresentation: Presentation = {
      id: uuidv4(),
      title,
      theme: defaultTheme,
      slides: [
        {
          id: uuidv4(),
          layout: "title",
          title: "New Presentation",
          content: [
            {
              id: uuidv4(),
              type: "text",
              value: "Click to edit",
              position: "center",
            },
          ],
        },
      ],
      mediaLibrary: [],
    };

    set((state) => ({
      presentations: [...state.presentations, newPresentation],
      currentPresentation: newPresentation,
      currentSlideIndex: 0,
    }));
  },

  setCurrentPresentation: (id) => {
    const presentation = get().presentations.find((p) => p.id === id) || null;
    set({ currentPresentation: presentation, currentSlideIndex: 0 });
  },

  setCurrentSlideIndex: (index) => {
    set({ currentSlideIndex: index });
  },

  addSlide: (layout) => {
    const { currentPresentation } = get();
    if (!currentPresentation) return;

    const newSlide: Slide = {
      id: uuidv4(),
      layout,
      title: "New Slide",
      content: [],
    };

    // Add appropriate content based on layout
    switch (layout) {
      case "title":
      case "title-content":
        newSlide.content.push({
          id: uuidv4(),
          type: "text",
          value: "Click to edit",
          position: "center",
        });
        break;
      case "title-two-columns":
        newSlide.content.push({
          id: uuidv4(),
          type: "text",
          value: "Left column content",
          position: "left",
        });
        newSlide.content.push({
          id: uuidv4(),
          type: "text",
          value: "Right column content",
          position: "right",
        });
        break;
      case "title-image":
        newSlide.content.push({
          id: uuidv4(),
          type: "image",
          value: "",
          position: "center",
        });
        break;
      case "image-only":
        newSlide.content.push({
          id: uuidv4(),
          type: "image",
          value: "",
          position: "center",
        });
        break;
      case "title-image-text":
        newSlide.content.push({
          id: uuidv4(),
          type: "image",
          value: "",
          position: "left",
        });
        newSlide.content.push({
          id: uuidv4(),
          type: "text",
          value: "Click to edit",
          position: "right",
        });
        break;
      case "comparison":
        newSlide.content.push({
          id: uuidv4(),
          type: "text",
          value: "Option A details",
          position: "left",
        });
        newSlide.content.push({
          id: uuidv4(),
          type: "text",
          value: "Option B details",
          position: "right",
        });
        break;
      case "quote":
        newSlide.content.push({
          id: uuidv4(),
          type: "quote",
          value: "Enter your quote here",
          position: "center",
        });
        break;
      case "video":
        newSlide.content.push({
          id: uuidv4(),
          type: "video",
          value: "",
          position: "center",
        });
        break;
      case "title-video":
        newSlide.content.push({
          id: uuidv4(),
          type: "video",
          value: "",
          position: "center",
        });
        break;
      default:
        newSlide.content.push({
          id: uuidv4(),
          type: "text",
          value: "Click to edit",
          position: "full",
        });
    }

    const updatedSlides = [...currentPresentation.slides, newSlide];
    const updatedPresentation = {
      ...currentPresentation,
      slides: updatedSlides,
    };

    set((state) => ({
      presentations: state.presentations.map((p) =>
        p.id === currentPresentation.id ? updatedPresentation : p
      ),
      currentPresentation: updatedPresentation,
      currentSlideIndex: updatedSlides.length - 1,
    }));
  },

  updateSlide: (slideId, updates) => {
    const { currentPresentation } = get();
    if (!currentPresentation) return;

    const updatedSlides = currentPresentation.slides.map((slide) =>
      slide.id === slideId ? { ...slide, ...updates } : slide
    );

    const updatedPresentation = {
      ...currentPresentation,
      slides: updatedSlides,
    };

    set((state) => ({
      presentations: state.presentations.map((p) =>
        p.id === currentPresentation.id ? updatedPresentation : p
      ),
      currentPresentation: updatedPresentation,
    }));
  },

  deleteSlide: (slideId) => {
    const { currentPresentation, currentSlideIndex } = get();
    if (!currentPresentation) return;

    const updatedSlides = currentPresentation.slides.filter(
      (slide) => slide.id !== slideId
    );
    const updatedPresentation = {
      ...currentPresentation,
      slides: updatedSlides,
    };

    const newIndex = Math.min(currentSlideIndex, updatedSlides.length - 1);

    set((state) => ({
      presentations: state.presentations.map((p) =>
        p.id === currentPresentation.id ? updatedPresentation : p
      ),
      currentPresentation: updatedPresentation,
      currentSlideIndex: Math.max(0, newIndex),
    }));
  },

  addContent: (slideId, content) => {
    const { currentPresentation } = get();
    if (!currentPresentation) return;

    const newContent: SlideContent = {
      id: uuidv4(),
      ...content,
    };

    const updatedSlides = currentPresentation.slides.map((slide) => {
      if (slide.id === slideId) {
        return {
          ...slide,
          content: [...slide.content, newContent],
        };
      }
      return slide;
    });

    const updatedPresentation = {
      ...currentPresentation,
      slides: updatedSlides,
    };

    set((state) => ({
      presentations: state.presentations.map((p) =>
        p.id === currentPresentation.id ? updatedPresentation : p
      ),
      currentPresentation: updatedPresentation,
    }));
  },

  updateContent: (slideId, contentId, updates) => {
    const { currentPresentation } = get();
    if (!currentPresentation) return;

    const updatedSlides = currentPresentation.slides.map((slide) => {
      if (slide.id === slideId) {
        return {
          ...slide,
          content: slide.content.map((content) =>
            content.id === contentId ? { ...content, ...updates } : content
          ),
        };
      }
      return slide;
    });

    const updatedPresentation = {
      ...currentPresentation,
      slides: updatedSlides,
    };

    set((state) => ({
      presentations: state.presentations.map((p) =>
        p.id === currentPresentation.id ? updatedPresentation : p
      ),
      currentPresentation: updatedPresentation,
    }));
  },

  deleteContent: (slideId, contentId) => {
    const { currentPresentation } = get();
    if (!currentPresentation) return;

    const updatedSlides = currentPresentation.slides.map((slide) => {
      if (slide.id === slideId) {
        return {
          ...slide,
          content: slide.content.filter((content) => content.id !== contentId),
        };
      }
      return slide;
    });

    const updatedPresentation = {
      ...currentPresentation,
      slides: updatedSlides,
    };

    set((state) => ({
      presentations: state.presentations.map((p) =>
        p.id === currentPresentation.id ? updatedPresentation : p
      ),
      currentPresentation: updatedPresentation,
    }));
  },

  updateTheme: (updates) => {
    const { currentPresentation } = get();
    if (!currentPresentation) return;

    const updatedTheme = {
      ...currentPresentation.theme,
      ...updates,
    };

    const updatedPresentation = {
      ...currentPresentation,
      theme: updatedTheme,
    };

    //@ts-ignore
    set((state) => ({
      presentations: state.presentations.map((p) =>
        p.id === currentPresentation.id ? updatedPresentation : p
      ),
      currentPresentation: updatedPresentation,
    }));
  },

  addMediaToCurrentSlide: (type) => {
    const { currentPresentation, currentSlideIndex } = get();
    if (!currentPresentation) return;

    const currentSlide = currentPresentation.slides[currentSlideIndex];

    const newContent: SlideContent = {
      id: uuidv4(),
      type,
      value: "",
      position: "center",
    };

    const updatedSlide = {
      ...currentSlide,
      content: [...currentSlide.content, newContent],
    };

    const updatedSlides = currentPresentation.slides.map((slide, index) =>
      index === currentSlideIndex ? updatedSlide : slide
    );

    const updatedPresentation = {
      ...currentPresentation,
      slides: updatedSlides,
    };

    set((state) => ({
      presentations: state.presentations.map((p) =>
        p.id === currentPresentation.id ? updatedPresentation : p
      ),
      currentPresentation: updatedPresentation,
    }));
  },

  // Media library functions
  addMediaToLibrary: (media) => {
    const { currentPresentation } = get();
    if (!currentPresentation) return "";

    const newMedia: MediaItem = {
      id: uuidv4(),
      ...media,
      dateAdded: new Date().toISOString(),
    };

    const mediaLibrary = currentPresentation.mediaLibrary || [];
    const updatedMediaLibrary = [...mediaLibrary, newMedia];

    const updatedPresentation = {
      ...currentPresentation,
      mediaLibrary: updatedMediaLibrary,
    };

    set((state) => ({
      presentations: state.presentations.map((p) =>
        p.id === currentPresentation.id ? updatedPresentation : p
      ),
      currentPresentation: updatedPresentation,
    }));

    return newMedia.id;
  },

  deleteMediaFromLibrary: (mediaId) => {
    const { currentPresentation } = get();
    if (!currentPresentation || !currentPresentation.mediaLibrary) return;

    const updatedMediaLibrary = currentPresentation.mediaLibrary.filter(
      (media) => media.id !== mediaId
    );

    const updatedPresentation = {
      ...currentPresentation,
      mediaLibrary: updatedMediaLibrary,
    };

    set((state) => ({
      presentations: state.presentations.map((p) =>
        p.id === currentPresentation.id ? updatedPresentation : p
      ),
      currentPresentation: updatedPresentation,
    }));
  },

  useMediaInCurrentSlide: (mediaId) => {
    const { currentPresentation, currentSlideIndex } = get();
    if (!currentPresentation || !currentPresentation.mediaLibrary) return;

    const media = currentPresentation.mediaLibrary.find(
      (m) => m.id === mediaId
    );
    if (!media) return;

    const currentSlide = currentPresentation.slides[currentSlideIndex];

    const newContent: SlideContent = {
      id: uuidv4(),
      type: media.type as ContentType,
      value: media.url,
      position: "center",
    };

    const updatedSlide = {
      ...currentSlide,
      content: [...currentSlide.content, newContent],
    };

    const updatedSlides = currentPresentation.slides.map((slide, index) =>
      index === currentSlideIndex ? updatedSlide : slide
    );

    const updatedPresentation = {
      ...currentPresentation,
      slides: updatedSlides,
    };

    set((state) => ({
      presentations: state.presentations.map((p) =>
        p.id === currentPresentation.id ? updatedPresentation : p
      ),
      currentPresentation: updatedPresentation,
    }));
  },
}));

export default usePresentation;
