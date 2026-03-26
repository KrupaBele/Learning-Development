import React, { useState, useRef, useEffect } from "react";
import {
  Trash2,
  Upload,
  X,
  Edit,
  Layout,
  Pen,
  Sparkles,
  SpellCheck,
  BookOpen,
  Wand2,
  Volume2,
  MoreVertical,
  ChevronLeft,
  ChevronRight,
  Image,
  Text,
  Columns,
  AlignLeft,
  Eye,
} from "lucide-react";
//@ts-ignore
import { uploadImage } from "../../utils/api.js";
import {
  ChapterLayoutSelector,
  ChapterPreview,
  chapterLayouts,
} from "./ChapterLayouts";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { marked } from "marked";
import { getWritingPrompt, WritingPromptKey } from "../../utils/prompts.js";
import { LLMClient } from "../../services/llm-api-client.js";
import { MdContentCopy, MdOutlineReplay } from "react-icons/md";
import ImageSelectionModal from "../common/ImageSelectionModal";
import toast, { Toaster } from "react-hot-toast";
import DOMPurify from "dompurify";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { GripVertical } from "lucide-react";
// Consider standardizing your data structure:
interface Chapter {
  id: string;
  title: string;
  description: string; // Always use this field for content
  duration?: string;
  content?: {
    imgUrl?: string;
    audioUrl?: string;
  };
  layout: string;
  subChapters?: Chapter[];
}

const ChapterCreation = ({ chapters, onUpdate }: any) => {
  const [leftCollapsed, setLeftCollapsed] = useState(true);
  const [rightCollapsed, setRightCollapsed] = useState(true);
  const [leftHovered, setLeftHovered] = useState(false);
  const [rightHovered, setRightHovered] = useState(false);
  const [showMediaOptions, setShowMediaOptions] = useState(false);
  const [showImagePopup, setShowImagePopup] = useState(false);
  const [showAudioPopup, setShowAudioPopup] = useState(false);

  const handleMediaOptionSelect = (type: "image" | "audio") => {
    setShowMediaOptions(false);
    if (type === "image") {
      setShowImagePopup(true);
    } else {
      setShowAudioPopup(true); // Show audio popup instead of directly triggering file input
    }
  };
  const onDragEnd = (result: any) => {
    if (!result.destination) return;

    const items = Array.from(normalizedChapters);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    onUpdate(items);
  };
  // State to manage the dropdown menu for each chapter
  const [dropdownOpen, setDropdownOpen] = useState<{ [key: string]: boolean }>(
    {}
  );

  // Toggle dropdown for a specific chapter
  const toggleDropdown = (chapterId: string) => {
    setDropdownOpen((prev) => ({
      ...prev,
      [chapterId]: !prev[chapterId],
    }));
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!(event.target as HTMLElement).closest(".dropdown-menu")) {
        setDropdownOpen({});
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const [newChapter, setNewChapter] = useState({
    title: "",
    content: "",
    duration: "",
    image: "",
    audio: "",
    layout: "",
  });

  const [editingChapterId, setEditingChapterId] = useState(null);
  console.log(editingChapterId);

  const [loading, setLoading] = useState(false);
  const [loading2, setLoading2] = useState(false);
  const [showLayoutSelector, setShowLayoutSelector] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [imagePrompt, setImagePrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [isConverting, setIsConverting] = useState(false);
  const [isAddingSubChapter, setIsAddingSubChapter] = useState(false);
  const [parentChapterId, setParentChapterId] = useState<string | null>(null);

  const imageInputRef = useRef(null);
  const audioInputRef = useRef(null);
  const quillRef = useRef<ReactQuill & { getEditor: () => any }>(null);
  const [contextMenu, setContextMenu] = useState<{
    visible: boolean;
    top: number;
    left: number;
  }>({ visible: false, top: 0, left: 0 });
  const [selectedText, setSelectedText] = useState<string>("");
  //@ts-ignore
  const [selectedRange, setSelectedRange] = useState<any>(null);
  const [modal, setModal] = useState<{
    visible: boolean;
    content: string;
    top: number;
    left: number;
  }>({ visible: false, content: "", top: 0, left: 0 });
  const [lastAction, setLastAction] = useState<WritingPromptKey | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [generatedImages, setGeneratedImages] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);

  const normalizedChapters = (chapters || []).map((chapter: any) => ({
    ...chapter,
    id: chapter.id || chapter._id, // Standardize on 'id'
    subChapters: (chapter.subChapters || []).map((subChapter: any) => ({
      ...subChapter,
      id: subChapter.id || subChapter._id, // Standardize subchapter IDs
    })),
  }));

  const handleTitleChange = (newTitle: string) => {
    setNewChapter((prev) => ({ ...prev, title: newTitle }));
  };

  const handleContentChange = (newContent: string) => {
    setNewChapter((prev) => ({ ...prev, content: newContent }));
  };

  const handleAddOrUpdateChapter = () => {
    if (newChapter.title && newChapter.content && newChapter.layout) {
      const sanitizedContent = DOMPurify.sanitize(newChapter.content);

      if (editingChapterId !== null) {
        // Update existing chapter or sub-chapter
        onUpdate(
          normalizedChapters.map((chapter: any) => {
            if (chapter.id === editingChapterId) {
              return {
                ...chapter,
                title: newChapter.title,
                description: sanitizedContent,
                duration: newChapter.duration,
                content: {
                  imgUrl: newChapter.image || "",
                  audioUrl: newChapter.audio || "",
                },
                layout: newChapter.layout,
              };
            }

            // Check if this chapter has the sub-chapter we're editing
            if (
              chapter.subChapters?.some((sc: any) => sc.id === editingChapterId)
            ) {
              return {
                ...chapter,
                subChapters: chapter.subChapters.map((sc: any) =>
                  sc.id === editingChapterId
                    ? {
                        ...sc,
                        title: newChapter.title,
                        description: sanitizedContent,
                        duration: newChapter.duration,
                        content: {
                          imgUrl: newChapter.image || "",
                          audioUrl: newChapter.audio || "",
                        },
                        layout: newChapter.layout,
                      }
                    : sc
                ),
              };
            }

            return chapter;
          })
        );
        setEditingChapterId(null);
        setIsAddingSubChapter(false);
        setParentChapterId(null);
      } else if (isAddingSubChapter && parentChapterId) {
        // Add new sub-chapter
        const newSubChapter = {
          id: Date.now().toString(),
          title: newChapter.title,
          description: sanitizedContent,
          duration: newChapter.duration,
          content: {
            imgUrl: newChapter.image || "",
            audioUrl: newChapter.audio || "",
          },
          layout: newChapter.layout,
        };

        onUpdate(
          normalizedChapters.map((chapter: any) =>
            chapter.id === parentChapterId
              ? {
                  ...chapter,
                  subChapters: [...(chapter.subChapters || []), newSubChapter],
                }
              : chapter
          )
        );
        setIsAddingSubChapter(false);
        setParentChapterId(null);
      } else {
        // Add new chapter
        onUpdate([
          ...normalizedChapters,
          {
            id: Date.now().toString(),
            title: newChapter.title,
            description: sanitizedContent,
            duration: newChapter.duration,
            content: {
              imgUrl: newChapter.image || "",
              audioUrl: newChapter.audio || "",
            },
            layout: newChapter.layout,
            subChapters: [],
          },
        ]);
      }

      setNewChapter({
        title: "",
        content: "",
        duration: "",
        image: "",
        audio: "",
        layout: "",
      });
    } else {
      toast.error("Please fill in all required fields and select a layout");
    }
  };

  const handleRemoveChapter = (id: string) => {
    // Check if it's a sub-chapter
    let isSubChapter = false;
    const updatedChapters = normalizedChapters.map((chapter: any) => {
      if (chapter.subChapters?.some((sc: any) => sc.id === id)) {
        isSubChapter = true;
        return {
          ...chapter,
          subChapters: chapter.subChapters.filter((sc: any) => sc.id !== id),
        };
      }
      return chapter;
    });

    // If not a sub-chapter, filter main chapters
    if (!isSubChapter) {
      onUpdate(updatedChapters.filter((chapter: any) => chapter.id !== id));
    } else {
      onUpdate(updatedChapters);
    }

    if (editingChapterId === id) {
      setEditingChapterId(null);
      setIsAddingSubChapter(false);
      setParentChapterId(null);
      setNewChapter({
        title: "",
        content: "",
        duration: "",
        image: "",
        audio: "",
        layout: "",
      });
    }
  };

  const handleEditChapter = (id: string) => {
    if (!id) {
      console.error("No ID provided for editing");
      return;
    }

    // First check main chapters
    let chapterToEdit = normalizedChapters.find(
      (chapter: any) => chapter.id === id || chapter._id === id
    );

    let isSubChapter = false;
    let parentId = null;

    // If not found in main chapters, check sub-chapters
    if (!chapterToEdit) {
      for (const chapter of normalizedChapters) {
        const subChapter = chapter.subChapters?.find(
          (sc: any) => sc.id === id || sc._id === id
        );
        if (subChapter) {
          chapterToEdit = subChapter;
          isSubChapter = true;
          parentId = chapter.id || chapter._id;
          break;
        }
      }
    }

    if (!chapterToEdit) {
      console.error("No chapter found with ID:", id);
      return;
    }

    console.log("Editing chapter:", {
      id,
      isSubChapter,
      parentId,
      chapterToEdit,
    });

    // Set all state updates in one batch
    setEditingChapterId(chapterToEdit.id || chapterToEdit._id);
    setIsAddingSubChapter(isSubChapter);
    setParentChapterId(parentId);

    // Create a complete new chapter object to prevent partial updates
    const updatedChapter = {
      title: chapterToEdit.title || "",
      content: chapterToEdit.description || "",
      duration: chapterToEdit.duration || "",
      image: chapterToEdit.content?.imgUrl || "",
      audio: chapterToEdit.content?.audioUrl || "",
      layout: chapterToEdit.layout || chapterToEdit.template || "",
    };

    console.log("Setting chapter state:", updatedChapter);
    setNewChapter((prev) => ({
      ...prev, // Keep any existing state
      ...updatedChapter, // Apply the updates
    }));
  };
  console.log(newChapter);

  const handleCancelEdit = () => {
    setEditingChapterId(null);
    setIsAddingSubChapter(false);
    setParentChapterId(null);
    setNewChapter({
      title: "",
      content: "",
      duration: "",
      image: "",
      audio: "",
      layout: "",
    });
  };

  const handleImageChange = async (e: any) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert("Image size should be less than 5MB");
        return;
      }
      setLoading(true);
      try {
        const uploadResponse = await uploadImage(file);
        setNewChapter((prev) => ({
          ...prev,
          image: uploadResponse.fileUrl,
        }));
        toast.success("Image uploaded successfully!");
      } catch (error) {
        toast.error("Image upload failed");
      } finally {
        setLoading(false);
      }
    }
  };

  const handleAudioChange = async (e: any) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        alert("Audio file size should be less than 10MB");
        return;
      }
      setLoading2(true);
      try {
        const uploadResponse = await uploadImage(file);
        setNewChapter((prev) => ({
          ...prev,
          audio: uploadResponse.fileUrl,
        }));
      } catch (error) {
        alert("Audio upload failed");
      } finally {
        setLoading2(false);
      }
    }
  };

  // Original function remains unchanged for direct calls
  const generateImageUnsplash = async (page = 1) => {
    if (!imagePrompt.trim()) {
      toast.error("Please enter a prompt for image generation");
      return;
    }

    setIsGenerating(true);
    try {
      const pageNumber = Number(page) || 1;
      const response = await fetch(
        `https://api.unsplash.com/search/photos?query=${encodeURIComponent(
          imagePrompt
        )}&per_page=9&page=${pageNumber}`,
        {
          headers: {
            Authorization: `Client-ID ${
              import.meta.env.VITE_UNSPLASH_ACCESS_KEY
            }`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch images");
      }

      const data = await response.json();
      const newImages = data.results.map((result: any) => result.urls.regular);

      if (pageNumber === 1) {
        setGeneratedImages(newImages);
      } else {
        setGeneratedImages((prev) => [...prev, ...newImages]);
      }

      setIsModalOpen(true);
      setCurrentPage(pageNumber);
      setHasMore(pageNumber < data.total_pages);
    } catch (error) {
      toast.error("Failed to generate images. Please try again.");
      console.error(error);
    } finally {
      setIsGenerating(false);
    }
  };

  // Add a new handler specifically for button clicks
  const handleGenerateClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    await generateImageUnsplash(1); // Always start with page 1 for button clicks
  };

  const handleLoadMore = () => {
    // Ensure we pass the next page number
    const nextPage = currentPage + 1;
    generateImageUnsplash(nextPage);
  };

  const handleImageSelect = async (imageUrl: string) => {
    // Show selection toast first
    toast.success("Image selected! Starting upload...", {
      duration: 2000,
      //@ts-ignore
      position: "top-center",
      style: {
        backgroundColor: "#2196F3",
        color: "white",
        padding: "16px",
        borderRadius: "8px",
        textAlign: "center",
        minWidth: "300px",
      },
    });

    // Close modal immediately after selection
    setIsModalOpen(false);

    setLoading(true);
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const file = new File([blob], "image.jpg", { type: "image/jpeg" });

      if (imageInputRef.current) {
        const dataTransfer = new DataTransfer();
        dataTransfer.items.add(file);
        //@ts-ignore
        imageInputRef.current.files = dataTransfer.files;
      }

      // Upload the image
      const uploadResponse = await uploadImage(file);
      setNewChapter((prev) => ({
        ...prev,
        image: uploadResponse.fileUrl,
      }));
      setImagePrompt("");

      toast.success("Image uploaded successfully!", {
        duration: 3000,
        //@ts-ignore
        position: "top-center",
        style: {
          backgroundColor: "#4CAF50",
          color: "white",
          padding: "16px",
          borderRadius: "8px",
          textAlign: "center",
          minWidth: "300px",
        },
      });
    } catch (error) {
      console.error(error);
      toast.error("Failed to upload image. Please try again.", {
        duration: 3000,
        //@ts-ignore
        position: "top-center",
        style: {
          backgroundColor: "#f44336",
          color: "white",
          padding: "16px",
          borderRadius: "8px",
          textAlign: "center",
          minWidth: "300px",
        },
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveAudio = () => {
    setNewChapter((prev) => ({
      ...prev,
      audio: "",
    }));
  };

  const handleContextMenu = (event: React.MouseEvent<HTMLDivElement>) => {
    event.preventDefault();

    const selection = window.getSelection();
    if (selection && selection.toString().trim() !== "") {
      const selectedContent = selection.toString().trim();
      setSelectedText(selectedContent);

      // Get the editor's container
      const editorContainer = event.currentTarget;
      const editorRect = editorContainer.getBoundingClientRect();

      // Calculate the position relative to the editor's container
      const top = event.clientY - editorRect.top + editorContainer.scrollTop;
      const left = event.clientX - editorRect.left + editorContainer.scrollLeft;

      setContextMenu({
        visible: true,
        top,
        left,
      });

      // Store the Quill selection range
      const quill = quillRef.current?.getEditor();
      if (quill) {
        const range = quill.getSelection();
        if (range && range.length > 0) {
          setSelectedRange(range);
        }
      }
    }
  };

  const handleActionSelect = async (action: WritingPromptKey) => {
    setContextMenu({ ...contextMenu, visible: false });
    if (!selectedText) return;
    setLastAction(action);
    try {
      await handleOptionClick(action);
    } catch (error) {
      console.error("Error processing text:", error);
    }
  };

  const removeMarkdownDelimiters = (text: string) => {
    // Remove ```markdown from the beginning
    text = text.replace(/^```markdown\s*/, "");
    // Remove ``` from the end
    text = text.replace(/```$/, "");
    return text.trim();
  };

  const formatResponse = async (text: string): Promise<string> => {
    // const cleanedText: string = cleanMarkdownOutput(text);
    const planeText = removeMarkdownDelimiters(text);
    const markedText: string = await marked.parse(planeText);
    // console.log("text is => ", markedText);
    return markedText;
    // return DOMPurify.sanitize(markedText);
  };

  const handleOptionClick = async (promptKey: WritingPromptKey) => {
    try {
      const { prompt, systemMessage } = getWritingPrompt(
        promptKey,
        selectedText
      );

      let response = "";
      const client = new LLMClient();

      for await (const chunk of client.streamResponse(prompt, systemMessage)) {
        response += chunk;
        const formattedResponse: string = await formatResponse(response);
        setModal({
          visible: true,
          content: formattedResponse,
          top: contextMenu.top,
          left: contextMenu.left,
        });
      }
    } catch (error) {
      console.error("Error details:", error);
    }
  };

  const insertResponse = () => {
    const quillInstance = quillRef.current?.getEditor();
    if (!quillInstance || !modal.content) return;

    try {
      if (selectedRange) {
        // Delete the selected text
        quillInstance.deleteText(selectedRange.index, selectedRange.length);

        // Insert the HTML content at the selection point
        quillInstance.clipboard.dangerouslyPasteHTML(
          selectedRange.index,
          modal.content
        );

        // Get the length of the inserted content
        const tempDiv = document.createElement("div");
        tempDiv.innerHTML = modal.content;
        const insertedLength = quillInstance.getText(
          selectedRange.index,
          tempDiv.textContent?.length || 0
        ).length;

        // Apply red color to the inserted text
        quillInstance.formatText(selectedRange.index, insertedLength);

        // Move cursor to end of inserted text
        quillInstance.setSelection(selectedRange.index + insertedLength, 0);
      } else {
        // If no selection, insert at the end
        const length = quillInstance.getLength();
        quillInstance.clipboard.dangerouslyPasteHTML(length, modal.content);
      }
    } catch (e) {
      console.warn("Error replacing selected text:", e);
    }
    setModal((prevState) => ({ ...prevState, visible: false }));
    setSelectedRange(null);
  };

  const retryResponse = async () => {
    if (!lastAction || !selectedText) return;

    try {
      await handleOptionClick(lastAction);
    } catch (error) {
      console.error("Error retrying action:", error);
    }
  };

  const cancelResponse = () => {
    setModal((prevState) => ({ ...prevState, visible: false }));
  };

  const handleCopy = () => {
    const contentContainer = document.getElementById("content-container");
    if (contentContainer) {
      const range = document.createRange();
      range.selectNode(contentContainer);

      const selection = window.getSelection();
      if (selection) {
        selection.removeAllRanges();
        selection.addRange(range);

        try {
          const clipboardItem = new ClipboardItem({
            "text/html": new Blob([contentContainer.innerHTML], {
              type: "text/html",
            }),
            "text/plain": new Blob([contentContainer.innerText], {
              type: "text/plain",
            }),
          });
          navigator.clipboard.write([clipboardItem]).then(() => {
            selection.removeAllRanges();
          });
        } catch (err) {
          document.execCommand("copy");
          selection.removeAllRanges();
        }
      }
    }
  };

  const handleLayoutSelect = (layoutName: any) => {
    setNewChapter((prev) => ({
      ...prev,
      layout: layoutName,
    }));
    setShowLayoutSelector(false);
  };

  // Function to strip HTML tags and decode HTML entities
  const stripHtml = (html: string) => {
    const doc = new DOMParser().parseFromString(html, "text/html");
    return doc.body.textContent || "";
  };

  const convertTextToSpeech = async (text: string) => {
    if (!text) {
      alert("Please enter some text to convert to speech");
      return;
    }

    setIsConverting(true);
    try {
      const cleanText = stripHtml(text);

      const params = new URLSearchParams({
        text: cleanText,
        voice: "en-GB-SoniaNeural",
      });

      const response = await fetch(
        `https://audio-api.elevatics.cloud/tts?${params.toString()}`,
        {
          method: "GET",
          headers: {
            accept: "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to convert text to speech");
      }

      // The API returns audio/mpeg data directly
      const audioBlob = await response.blob();
      const audioFile = new File([audioBlob], "speech.mp3", {
        type: "audio/mpeg",
      });

      const uploadResponse = await uploadImage(audioFile);
      setNewChapter((prev) => ({
        ...prev,
        audio: uploadResponse.fileUrl,
      }));
    } catch (error) {
      console.error("Error converting text to speech:", error);
      alert("Failed to convert text to speech. Please try again.");
    } finally {
      setIsConverting(false);
    }
  };

  const generateImageWithAI = async () => {
    if (!imagePrompt.trim()) {
      toast.error("Please enter an image prompt");
      return;
    }

    setIsGeneratingAI(true);
    try {
      const response = await fetch(
        "https://api.stability.ai/v1/generation/stable-diffusion-xl-1024-v1-0/text-to-image",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${import.meta.env.VITE_STABILITY_API_KEY}`,
          },
          body: JSON.stringify({
            text_prompts: [{ text: imagePrompt }],
            cfg_scale: 7,
            height: 1024,
            width: 1024,
            steps: 30,
            samples: 1,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      const base64Image = result.artifacts[0].base64;

      // Convert base64 to blob
      const byteCharacters = atob(base64Image);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: "image/png" });

      // Create a File object
      const file = new File([blob], "generated-image.png", {
        type: "image/png",
      });

      // Upload the generated image
      const uploadResponse = await uploadImage(file);
      setNewChapter((prev) => ({
        ...prev,
        image: uploadResponse.fileUrl,
      }));
      toast.success("AI image generated and uploaded successfully!");
    } catch (error) {
      console.error("Error generating image:", error);
      toast.error("Failed to generate image with AI");
    } finally {
      setIsGeneratingAI(false);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      // Check if the click is on a button
      if (target.tagName === "BUTTON") {
        return;
      }

      if (contextMenu.visible) {
        setContextMenu({ ...contextMenu, visible: false });
      }
      // Ensure it doesn't close when clicking inside the context menu or modal
      if (target.closest("#ai-response-modal")) {
        return;
      }

      setModal((prevState) => ({ ...prevState, visible: false }));
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [contextMenu, modal]);

  return (
    <div className="space-y-15">
      <div className="space-y-15 flex flex-row w-full">
        {/* Chapter List */}
        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId="chapters">
            {(provided) => (
              <div
                {...provided.droppableProps}
                ref={provided.innerRef}
                className={`transition-all duration-300 ease-in-out ${
                  leftCollapsed ? "w-16 hover:w-1/4" : "w-1/4"
                }`}
                onMouseEnter={() => setLeftHovered(true)}
                onMouseLeave={() => setLeftHovered(false)}
              >
                {/* Scrollable chapter list container - now applies to both states */}
                <div
                  className={`h-[500px] overflow-y-auto ${
                    leftCollapsed ? "flex flex-col items-center" : ""
                  }`}
                >
                  {leftCollapsed && !leftHovered ? (
                    /* Collapsed state - scrollable BookOpen icons */
                    <div className="space-y-2">
                      {normalizedChapters.length > 0 ? (
                        normalizedChapters.map((chapter: any) => (
                          <div key={chapter.id} className="relative pb-5">
                            <BookOpen className="w-5 h-5 text-gray-400" />
                          </div>
                        ))
                      ) : (
                        <BookOpen className="w-5 h-5 text-gray-400" />
                      )}
                    </div>
                  ) : normalizedChapters.length > 0 ? (
                    /* Expanded state with chapters */
                    normalizedChapters.map((chapter: any, index: number) => (
                      <Draggable
                        key={chapter.id.toString()}
                        draggableId={chapter.id.toString()}
                        index={index}
                      >
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            className={`mb-2 ${
                              snapshot.isDragging ? "shadow-lg bg-blue-50" : ""
                            }`}
                          >
                            {/* Main Chapter */}
                            <div
                              {...provided.dragHandleProps}
                              className={`bg-white dark:bg-dark-800 p-4 rounded-lg border border-gray-200 dark:border-dark-700 flex items-center justify-between`}
                            >
                              <div className="flex items-center gap-3 flex-1 overflow-hidden">
                                <GripVertical className="w-5 h-5 text-gray-400 flex-shrink-0" />

                                {chapter.content?.imgUrl && (
                                  <img
                                    src={chapter.content.imgUrl}
                                    alt={chapter.title}
                                    className="w-16 h-16 object-contain rounded mr-4 border flex-shrink-0"
                                  />
                                )}

                                <div className="flex-1 min-w-0">
                                  <h4 className="font-medium text-gray-900 dark:text-white truncate">
                                    {chapter.title}
                                  </h4>
                                  <p className="text-sm text-gray-500">
                                    {chapter.duration}
                                  </p>
                                </div>
                              </div>

                              {/* Three-dot menu */}
                              <div className="relative">
                                <button
                                  onClick={() => toggleDropdown(chapter.id)}
                                  className="p-2 text-gray-400 hover:text-gray-600"
                                >
                                  <MoreVertical className="w-5 h-5" />
                                </button>

                                {/* Dropdown menu */}
                                {dropdownOpen[chapter.id] && (
                                  <div className="dropdown-menu absolute right-0 mt-2 w-48 bg-white dark:bg-dark-800 rounded-lg shadow-lg border border-gray-200 dark:border-dark-700 z-50">
                                    <button
                                      onClick={() => {
                                        setIsAddingSubChapter(true);
                                        setParentChapterId(chapter.id);
                                        setDropdownOpen({});
                                      }}
                                      className="w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-dark-700 flex items-center gap-2"
                                    >
                                      <BookOpen className="w-4 h-4" />
                                      Add Sub-Chapter
                                    </button>
                                    <button
                                      onClick={() => {
                                        handleEditChapter(chapter.id);
                                        setDropdownOpen({});
                                      }}
                                      className="w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-dark-700 flex items-center gap-2"
                                    >
                                      <Edit className="w-4 h-4" />
                                      Edit
                                    </button>
                                    <button
                                      onClick={() => {
                                        handleRemoveChapter(chapter.id);
                                        setDropdownOpen({});
                                      }}
                                      className="w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-dark-700 flex items-center gap-2"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                      Delete
                                    </button>
                                    <button
                                      onClick={() => {
                                        setDropdownOpen({});
                                      }}
                                      className="w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-dark-700 flex items-center gap-2"
                                    >
                                      <Volume2 className="w-4 h-4" />
                                      Audio
                                    </button>
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Sub-chapters */}
                            {chapter.subChapters?.length > 0 && (
                              <Droppable
                                droppableId={`subchapters-${chapter.id}`}
                              >
                                {(subProvided) => (
                                  <div
                                    {...subProvided.droppableProps}
                                    ref={subProvided.innerRef}
                                    className="ml-6 mt-2 space-y-2"
                                  >
                                    {chapter.subChapters.map(
                                      (subChapter: any, subIndex: number) => (
                                        <Draggable
                                          key={subChapter?.id?.toString()}
                                          draggableId={subChapter?.id?.toString()}
                                          index={subIndex}
                                        >
                                          {(subProvided, subSnapshot) => (
                                            <div
                                              ref={subProvided.innerRef}
                                              {...subProvided.draggableProps}
                                              className={`bg-gray-50 dark:bg-dark-700 p-3 rounded-lg border border-gray-200 dark:border-dark-600 flex items-center justify-between ${
                                                subSnapshot.isDragging
                                                  ? "shadow-md bg-blue-50"
                                                  : ""
                                              }`}
                                            >
                                              <div className="flex items-center gap-3 flex-1 overflow-hidden">
                                                <GripVertical
                                                  className="w-4 h-4 text-gray-400 flex-shrink-0"
                                                  {...subProvided.dragHandleProps}
                                                />
                                                {subChapter.content?.imgUrl ? (
                                                  <img
                                                    src={
                                                      subChapter.content.imgUrl
                                                    }
                                                    className="w-16 h-16 object-contain rounded mr-4 border flex-shrink-0"
                                                    alt={subChapter.title}
                                                  />
                                                ) : null}

                                                <div className="flex-1 min-w-0">
                                                  <h4 className="font-medium text-gray-800 dark:text-gray-200 truncate text-sm">
                                                    {subChapter.title}
                                                  </h4>
                                                  {subChapter.duration && (
                                                    <p className="text-xs text-gray-500">
                                                      {subChapter.duration}
                                                    </p>
                                                  )}
                                                </div>
                                              </div>

                                              <div className="flex space-x-1">
                                                <button
                                                  onClick={() =>
                                                    handleEditChapter(
                                                      subChapter.id ||
                                                        subChapter._id
                                                    )
                                                  }
                                                  className="text-blue-500 hover:text-blue-700 p-1"
                                                >
                                                  <Edit className="w-3 h-3" />
                                                </button>
                                                <button
                                                  onClick={() => {
                                                    handleRemoveChapter(
                                                      subChapter.id
                                                    );
                                                  }}
                                                  className="text-red-500 hover:text-red-700 p-1"
                                                >
                                                  <Trash2 className="w-3 h-3" />
                                                </button>
                                              </div>
                                            </div>
                                          )}
                                        </Draggable>
                                      )
                                    )}
                                    {subProvided.placeholder}
                                  </div>
                                )}
                              </Droppable>
                            )}
                          </div>
                        )}
                      </Draggable>
                    ))
                  ) : (
                    /* Expanded state with no chapters */
                    <div className="bg-white dark:bg-dark-800 p-4 rounded-lg border border-gray-200 dark:border-dark-700">
                      <p className="text-gray-500 dark:text-gray-400 text-center">
                        No chapters available
                      </p>
                    </div>
                  )}
                  {provided.placeholder}
                </div>
              </div>
            )}
          </Droppable>
        </DragDropContext>
        <div
          className={`transition-all duration-300 ease-in-out ${
            leftCollapsed && rightCollapsed
              ? "w-[calc(100%-8rem)]"
              : leftCollapsed
              ? "w-[calc(100%-8rem-25%)]"
              : rightCollapsed
              ? "w-[calc(100%-8rem-25%)]"
              : "w-1/2"
          } px-4`}
        >
          <Toaster position="top-center" />
          <div className="bg-gray-50 dark:bg-dark-800 p-6 rounded-lg">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              {editingChapterId
                ? "Edit " + (isAddingSubChapter ? "Sub-Chapter" : "Chapter")
                : isAddingSubChapter
                ? "Add New Sub-Chapter"
                : "Add New Chapter"}
            </h3>
            <div className="space-y-14">
              <input
                type="text"
                value={newChapter.title}
                onChange={(e) =>
                  setNewChapter({ ...newChapter, title: e.target.value })
                }
                placeholder="Chapter Title"
                className="w-full px-4 py-2 border border-gray-300 dark:border-dark-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-dark-800 text-gray-900 dark:text-white"
              />
              <div onContextMenu={handleContextMenu}>
                <label className="block text-md font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Chapter Content
                </label>
                <ReactQuill
                  style={{
                    marginTop: "20px",
                    marginBottom: "10px",
                    height: "200px",
                  }}
                  value={newChapter.content}
                  onChange={(value) => {
                    // Ensure we're properly handling HTML content
                    const cleanedValue = DOMPurify.sanitize(value);
                    setNewChapter({ ...newChapter, content: cleanedValue });
                  }}
                  theme="snow"
                  className="w-full border-gray-300 dark:border-dark-700 rounded-lg  dark:bg-dark-800 text-gray-900 dark:text-white"
                  ref={quillRef}
                  //@ts-ignore
                  onContextMenu={handleContextMenu}
                  key={editingChapterId || "new-chapter"}
                />
                {contextMenu.visible && (
                  <div
                    className="dark:bg-[#1e293b] bg-white"
                    style={{
                      position: "absolute",
                      top: contextMenu.top + 400,
                      left: contextMenu.left + 300,
                      zIndex: 100,
                      borderRadius: "15px",
                      boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
                    }}
                  >
                    <div className="flex flex-col">
                      <button
                        className="px-4 py-2 text-left flex items-center"
                        onClick={() => handleActionSelect("explain")}
                      >
                        <BookOpen className="w-4 h-4 mr-2" />
                        Explain
                      </button>
                      <button
                        className="px-4 py-2 text-left flex items-center"
                        onClick={() => handleActionSelect("improve")}
                      >
                        <Sparkles className="w-4 h-4 mr-2" />
                        Improve Writing
                      </button>
                      <button
                        className="px-4 py-2 text-left flex items-center"
                        onClick={() => handleActionSelect("grammar")}
                      >
                        <SpellCheck className="w-4 h-4 mr-2" />
                        Fix Grammar
                      </button>
                      <button
                        className="px-4 py-2 text-left flex items-center"
                        onClick={() => handleActionSelect("concise")}
                      >
                        <Pen className="w-4 h-4 mr-2" />
                        Make Concise
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-6">
                <div className="relative inline-block mt-6">
                  <button
                    type="button"
                    onClick={() => setShowMediaOptions(!showMediaOptions)}
                    className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 focus:ring-4 focus:ring-purple-500"
                    title="Magic Media"
                  >
                    <Wand2 className="w-5 h-5 mr-2" />
                    Magic Media
                  </button>

                  {showMediaOptions && (
                    <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-dark-800 rounded-lg shadow-lg border border-gray-200 dark:border-dark-700 z-50">
                      <button
                        onClick={() => handleMediaOptionSelect("image")}
                        className="w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-dark-700 flex items-center gap-2"
                      >
                        <Image className="w-4 h-4" />
                        Add Image
                      </button>
                      <button
                        onClick={() => handleMediaOptionSelect("audio")}
                        className="w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-dark-700 flex items-center gap-2"
                      >
                        <Volume2 className="w-4 h-4" />
                        Add Audio
                      </button>
                    </div>
                  )}
                </div>
              </div>
              {/* Layout Selection */}
              {/* <div className="space-y-2">
                <label className="block text-md font-medium text-gray-700 dark:text-gray-300">
                  Chapter Layout
                </label>
                <div className="flex items-center space-x-4">
                  <button
                    type="button"
                    onClick={() => setShowLayoutSelector(true)}
                    className="px-4 py-2 border border-gray-300 dark:border-dark-700 rounded-lg hover:bg-gray-50 dark:hover:bg-dark-700 flex items-center space-x-2"
                  >
                    <Layout className="w-5 h-5" />
                    <span>
                      {newChapter.layout ? "Change Layout" : "Select Layout"}
                    </span>
                  </button>
                  {newChapter.layout && (
                    <button
                      type="button"
                      onClick={() => setShowPreview(true)}
                      className="px-4 py-2 text-blue-600 hover:text-blue-700"
                    >
                      Preview Layout
                    </button>
                  )}
                </div>
              </div> */}
              {/* <input
                type="text"
                value={newChapter.duration}
                onChange={(e) =>
                  setNewChapter({ ...newChapter, duration: e.target.value })
                }
                placeholder="Duration (e.g., 15 mins)"
                className="w-full px-4 py-2 border border-gray-300 dark:border-dark-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-dark-800 text-gray-900 dark:text-white"
              /> */}
            </div>
          </div>
          {modal.visible && (
            <div
              className="dark:bg-[#1e293b] bg-white"
              id="ai-response-modal"
              style={{
                position: "absolute",
                top: modal.top + 425,
                left: modal.left + 200,
                zIndex: 1000,
                borderRadius: "15px",
                boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
                border: "1px solid #e0e0e0",
                width: "670px",
                fontFamily: "Arial, sans-serif",
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div
                style={{
                  padding: "12px 16px",
                  borderBottom: "1px solid #e0e0e0",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <span style={{ fontWeight: "bold", fontSize: "15px" }}>
                  AI Suggestion
                </span>
                <button
                  onClick={() => setModal({ ...modal, visible: false })}
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    padding: "0",
                  }}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Modal Content */}
              <div
                id="content-container"
                style={{
                  padding: "16px",
                  fontSize: "14px",
                  color: "dark:white",
                }}
                dangerouslySetInnerHTML={{ __html: modal.content }}
              />

              {/* Modal Footer */}
              <div className="flex justify-between items-center mt-9">
                <div className="flex space-x-3 mb-3">
                  <button
                    onClick={retryResponse}
                    className="px-5 py-2 text-[#172b4d] dark:text-white dark:hover:bg-slate-700 hover:bg-gray-200 text-md"
                  >
                    <MdOutlineReplay size={20} />
                  </button>
                  <button
                    onClick={handleCopy}
                    className="px-1 py-1 text-[#172b4d]  dark:text-white dark:hover:bg-slate-700 hover:bg-gray-200 text-md"
                  >
                    <MdContentCopy size={20} />
                  </button>
                </div>
                <div className="flex space-x-3 mr-5 mb-3">
                  <button
                    onClick={cancelResponse}
                    className="hover:bg-gray-200 dark:hover:bg-slate-700 dark:text-white text-md font-semibold text-[#192d4e] px-5 py-1 rounded-md"
                  >
                    Discard
                  </button>
                  <button
                    onClick={insertResponse}
                    className="bg-blue-600 text-md text-white font-semibold px-3 py-1 rounded-md border-4 border-white outline outline-3.5 outline-blue-500 shadow-md hover:bg-blue-800 transition duration-200"
                  >
                    Replace
                  </button>
                </div>
              </div>
            </div>
          )}
          {/* Layout Selector Modal */}
          {showLayoutSelector && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
              <div className="bg-white dark:bg-dark-800 rounded-xl p-6 w-full max-w-4xl">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                    Select Chapter Layout
                  </h3>
                  <button
                    onClick={() => setShowLayoutSelector(false)}
                    className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          )}
          {showImagePopup && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
              <div className="bg-white dark:bg-dark-800 rounded-xl p-6 w-full max-w-2xl">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                    Add Chapter Image
                  </h3>
                  <button
                    onClick={() => setShowImagePopup(false)}
                    className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* This is the content from your existing image upload section */}
                <div className="space-y-4">
                  <div className="relative">
                    <input
                      type="text"
                      value={imagePrompt}
                      onChange={(e) => setImagePrompt(e.target.value)}
                      placeholder="Enter prompt to generate image..."
                      className="w-full px-4 py-3 border border-gray-200 dark:bg-dark-800 dark:border-dark-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <div className="flex space-x-2 mt-2">
                      <button
                        type="button"
                        onClick={handleGenerateClick} // Use the new handler here
                        disabled={!imagePrompt.trim() || isGenerating}
                        className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 flex items-center justify-center gap-2"
                      >
                        {isGenerating ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-white border-solid"></div>
                        ) : (
                          <Wand2 className="w-4 h-4" />
                        )}
                        Generate with Unsplash
                      </button>
                      <button
                        type="button"
                        onClick={generateImageWithAI}
                        disabled={!imagePrompt.trim() || isGeneratingAI}
                        className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50 flex items-center justify-center gap-2"
                      >
                        {isGeneratingAI ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-white border-solid"></div>
                        ) : (
                          <Wand2 className="w-4 h-4" />
                        )}
                        Generate with AI
                      </button>
                    </div>
                  </div>
                  <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 dark:border-dark-700 border-dashed rounded-lg relative bg-white dark:bg-dark-800">
                    {newChapter.image ? (
                      <div className="relative w-full max-w-xs">
                        <div className="aspect-w-16 h-[200px]">
                          <img
                            src={newChapter.image}
                            alt="Chapter preview"
                            className="object-cover rounded-lg w-full h-full"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() =>
                            setNewChapter((prev) => ({ ...prev, image: "" }))
                          }
                          className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <>
                        {loading ? (
                          <div className="flex justify-center items-center py-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-blue-500 border-solid"></div>
                          </div>
                        ) : (
                          <div className="text-center">
                            <Upload className="mx-auto h-12 w-12 text-gray-400 text-sm mb-4" />
                            <div className="flex items-center gap-1 mb-1">
                              <button
                                onClick={() => imageInputRef.current?.click()}
                                className="relative cursor-pointer text-sm bg-white dark:bg-dark-800 rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500"
                              >
                                Upload a file
                              </button>
                              <input
                                ref={imageInputRef}
                                type="file"
                                className="hidden"
                                accept="image/*"
                                onChange={handleImageChange}
                                disabled={loading}
                              />
                              <p className="text-sm text-gray-500">
                                or drag and drop
                              </p>
                            </div>
                            <p className="text-xs text-gray-400 mt-1">
                              PNG, JPG up to 5MB
                            </p>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>

                <div className="mt-4 flex justify-end space-x-3">
                  <button
                    onClick={() => setShowImagePopup(false)}
                    className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      if (newChapter.image) {
                        setShowImagePopup(false);
                      }
                    }}
                    disabled={!newChapter.image}
                    className={`px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 ${
                      !newChapter.image ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                  >
                    Done
                  </button>
                </div>
              </div>
            </div>
          )}

          {showAudioPopup && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
              <div className="bg-white dark:bg-dark-800 rounded-xl p-6 w-full max-w-2xl">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                    Add Chapter Audio
                  </h3>
                  <button
                    onClick={() => setShowAudioPopup(false)}
                    className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 dark:border-dark-700 border-dashed rounded-lg relative bg-white dark:bg-dark-800">
                    {loading2 ? (
                      <div className="flex justify-center items-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-blue-500 border-solid"></div>
                      </div>
                    ) : newChapter.audio ? (
                      <div className="relative w-full">
                        <audio
                          src={newChapter.audio}
                          controls
                          className="mx-auto"
                        />
                        <button
                          type="button"
                          onClick={handleRemoveAudio}
                          className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <div className="text-center space-y-4">
                        <div>
                          <Upload className="mx-auto h-12 w-12 text-gray-400 text-sm mb-4" />
                          <div className="flex items-center justify-center gap-1 mb-1">
                            <button
                              onClick={() => audioInputRef.current?.click()}
                              className="relative cursor-pointer text-sm bg-white dark:bg-dark-800 rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500"
                            >
                              Upload a file
                            </button>
                            <input
                              ref={audioInputRef}
                              type="file"
                              className="hidden"
                              accept="audio/*"
                              onChange={handleAudioChange}
                              disabled={loading2}
                            />
                            <p className="text-sm text-gray-500">
                              or drag and drop
                            </p>
                          </div>
                          <p className="text-xs text-gray-400 mt-1">
                            MP3, WAV up to 10MB
                          </p>
                        </div>

                        <div className="pt-4">
                          <button
                            type="button"
                            onClick={() =>
                              convertTextToSpeech(newChapter.content)
                            }
                            disabled={
                              isConverting || !newChapter.content.trim()
                            }
                            className={`bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded inline-flex items-center ${
                              isConverting || !newChapter.content.trim()
                                ? "opacity-50 cursor-not-allowed"
                                : ""
                            }`}
                          >
                            <Volume2 className="w-4 h-4 mr-2" />
                            {isConverting
                              ? "Converting..."
                              : "Convert to Speech"}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-4 flex justify-end space-x-3">
                  <button
                    onClick={() => setShowAudioPopup(false)}
                    className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      if (newChapter.audio) {
                        setShowAudioPopup(false);
                      }
                    }}
                    disabled={!newChapter.audio}
                    className={`px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 ${
                      !newChapter.audio ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                  >
                    Done
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Layout Preview Modal */}
          {showPreview && (
            <ChapterPreview
              layout={newChapter.layout}
              //@ts-ignore
              layoutImage={newChapter.image}
              layoutContent={newChapter.content}
              layoutTitle={newChapter.title}
              layoutAudio={newChapter.audio}
              onClose={() => setShowPreview(false)}
              onTitleChange={handleTitleChange}
              onContentChange={handleContentChange}
            />
          )}
          <ImageSelectionModal
            open={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            images={generatedImages}
            onSelectImage={handleImageSelect}
            onLoadMore={handleLoadMore}
            hasMore={hasMore}
            loading={isGenerating}
          />
        </div>

        <div
          className={`transition-all duration-300 ease-in-out ${
            rightCollapsed ? "w-16 hover:w-1/4" : "w-1/4"
          }`}
          onMouseEnter={() => setRightHovered(true)}
          onMouseLeave={() => setRightHovered(false)}
        >
          {/* Sidebar content */}
          {rightCollapsed && !rightHovered ? (
            <div className="mt-4 space-y-3 px-2 h-[500px] overflow-y-auto">
              {rightCollapsed && (
                <button
                  onClick={() => setShowPreview(true)}
                  className="p-2 text-gray-500 hover:text-blue-500"
                  title="Preview Layout"
                >
                  <Eye className="w-5 h-5" />
                </button>
              )}
              {chapterLayouts.map((layout) => (
                <button
                  key={layout.id}
                  onClick={() => {
                    handleLayoutSelect(layout.name);
                    setShowPreview(false);
                  }}
                  className={`w-full p-2 rounded-lg flex justify-center ${
                    newChapter.layout === layout.name
                      ? "bg-blue-100 dark:bg-blue-900/30"
                      : "hover:bg-gray-200 dark:hover:bg-dark-700"
                  }`}
                  title={layout.name}
                >
                  <div className="relative">
                    {layout.icon}
                    {newChapter.layout === layout.name && (
                      <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-blue-500"></span>
                    )}
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div>
              <div className="bg-gray-50 dark:bg-dark-800 p-2">
                {newChapter.layout && (
                  <button
                    type="button"
                    onClick={() => setShowPreview(true)}
                    className="w-full px-4  text-blue-600 hover:text-blue-700 flex items-center justify-center gap-2"
                  >
                    <Eye className="w-4" />
                    Preview Layout
                  </button>
                )}
              </div>
              <ChapterLayoutSelector
                onClick={() => setShowPreview(true)}
                selectedLayout={newChapter.layout}
                onLayoutSelect={handleLayoutSelect}
                layoutImage={newChapter.image}
                layoutContent={newChapter.content}
                layoutTitle={newChapter.title}
                layoutAudio={newChapter.audio}
              />
            </div>
          )}
        </div>
      </div>
      <div className="flex justify-end space-x-4 py-6">
        <button
          onClick={handleAddOrUpdateChapter}
          disabled={
            !newChapter.title || !newChapter.content || !newChapter.layout
          }
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-4 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {editingChapterId
            ? "Update Chapter"
            : isAddingSubChapter
            ? "Add Sub-Chapter"
            : "Add New Chapter"}
        </button>
        {editingChapterId && (
          <button
            onClick={handleCancelEdit}
            className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
          >
            Cancel
          </button>
        )}
      </div>
    </div>
  );
};

export default ChapterCreation;
