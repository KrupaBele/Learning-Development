import React, { useState, useRef, useEffect } from "react";
import {
  Upload,
  X,
  Pen,
  Sparkles,
  SpellCheck,
  BookOpen,
  Wand2,
} from "lucide-react";
//@ts-ignore
import { uploadImage } from "../../utils/api.js";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import toast, { Toaster } from "react-hot-toast";
import { LLMClient } from "../../services/llm-api-client.js";
import { getWritingPrompt, WritingPromptKey } from "../../utils/prompts.js";
import { marked } from "marked";
import { MdContentCopy, MdOutlineReplay } from "react-icons/md";
import ImageSelectionModal from '../common/ImageSelectionModal';
import DOMPurify from 'dompurify';

const categories = [
  "Development",
  "Business",
  "Design",
  "Marketing",
  "IT & Software",
  "Personal Development",
  "Photography",
  "Music",
];

const BasicInfo = ({ data, onUpdate }: any) => {
  const [imagePreview, setImagePreview] = useState(data.image || "");
  const [isUploading, setIsUploading] = useState(false);
  const [imagePrompt, setImagePrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [generatedImages, setGeneratedImages] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const imageInputRef = useRef(null);

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

  useEffect(() => {
    setImagePreview(data.image || "");
  }, [data.image]);

  const handleChange = (e: any) => {
    if (e.target) {
      const { name, value } = e.target;
      onUpdate({ [name]: value });
    } else {
      const { name, value } = e;
      onUpdate({ [name]: value });
    }
  };

  const handleImageChange = async (e: any) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert("Image size should be less than 5MB");
        return;
      }
      setIsUploading(true);
      try {
        const uploadResponse = await uploadImage(file);
        setImagePreview(uploadResponse.fileUrl);
        data.image = uploadResponse.fileUrl;
      } catch (error) {
        alert("Image upload failed");
      } finally {
        setIsUploading(false);
      }
    }
  };

  const handleRemoveImage = () => {
    setImagePreview("");
    onUpdate({ image: "" });
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
    const planeText = removeMarkdownDelimiters(text);
    const markedText: string = await marked.parse(planeText);
    return DOMPurify.sanitize(markedText);
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

        // Sanitize and insert the HTML content at the selection point
        const sanitizedContent = DOMPurify.sanitize(modal.content);
        quillInstance.clipboard.dangerouslyPasteHTML(
          selectedRange.index,
          sanitizedContent
        );

        // Clear the modal and selection
        setModal({ ...modal, visible: false });
        setSelectedRange(null);
        
        // Update the parent component with sanitized content
        const updatedContent = DOMPurify.sanitize(quillInstance.root.innerHTML);
        handleChange({ name: "description", value: updatedContent });
      }
    } catch (error) {
      console.error("Error inserting response:", error);
      toast.error("Failed to insert the response");
    }
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

  const generateImageUnsplash = async (page = 1) => {
    if (!imagePrompt.trim()) {
      alert("Please enter a prompt for image generation");
      return;
    }

    setIsGenerating(true);
    try {
      // Ensure page is a number
      const pageNumber = Number(page) || 1;
      
      const response = await fetch(
        `https://api.unsplash.com/search/photos?query=${encodeURIComponent(imagePrompt)}&per_page=9&page=${pageNumber}`,
        {
          headers: {
            Authorization: `Client-ID ${import.meta.env.VITE_UNSPLASH_ACCESS_KEY}`
          }
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch images');
      }

      const data = await response.json();
     

      const newImages = data.results.map((result: any) => result.urls.regular);
      
      // Update images based on page number
      if (pageNumber === 1) {
        setGeneratedImages(newImages);
      } else {
        setGeneratedImages(prev => [...prev, ...newImages]);
      }
      
      setIsModalOpen(true);
      setCurrentPage(pageNumber);
      
      // Fix hasMore calculation
      const hasMorePages = pageNumber < data.total_pages;
      setHasMore(hasMorePages);
    } catch (error) {
      alert("Failed to generate images. Please try again.");
      console.error(error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleLoadMore = () => {
    // Ensure we pass the next page number
    const nextPage = currentPage + 1;
    generateImageUnsplash(nextPage);
  };

  const handleImageSelect = async (imageUrl: string) => {
    // Show selection toast first
    toast.success('Image selected! Starting upload...', {
      duration: 2000,
      //@ts-ignore
      position: 'top-center',
      style: {
        backgroundColor: '#2196F3',
        color: 'white',
        padding: '16px',
        borderRadius: '8px',
        textAlign: 'center',
        minWidth: '300px',
      },
    });
    
    // Close modal immediately after selection
    setIsModalOpen(false);
    
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
      setImagePreview(uploadResponse.fileUrl);
      data.image = uploadResponse.fileUrl;
      setImagePrompt("");
      
      toast.success('Image uploaded successfully!', {
        duration: 3000,
        //@ts-ignore
        position: 'top-center',
        style: {
          backgroundColor: '#4CAF50',
          color: 'white',
          padding: '16px',
          borderRadius: '8px',
          textAlign: 'center',
          minWidth: '300px',
        },
      });
    } catch (error) {
      console.error(error);
      toast.error('Failed to upload image. Please try again.', {
        duration: 3000,
        //@ts-ignore
        position: 'top-center',
        style: {
          backgroundColor: '#f44336',
          color: 'white',
          padding: '16px',
          borderRadius: '8px',
          textAlign: 'center',
          minWidth: '300px',
        },
      });
    }
  };

  const generateImageWithAI = async () => {
    if (!imagePrompt.trim()) {
      toast.error("Please enter an image prompt");
      return;
    }

    setIsGeneratingAI(true);
    try {
      const response = await fetch('https://api.stability.ai/v1/generation/stable-diffusion-xl-1024-v1-0/text-to-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_STABILITY_API_KEY}`,
        },
        body: JSON.stringify({
          text_prompts: [{ text: imagePrompt }],
          cfg_scale: 7,
          height: 1024,
          width: 1024,
          steps: 30,
          samples: 1,
        }),
      });

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
      const blob = new Blob([byteArray], { type: 'image/png' });
      
      // Create a File object
      const file = new File([blob], 'generated-image.png', { type: 'image/png' });
      
      // Upload the generated image
      const uploadResponse = await uploadImage(file);
      setImagePreview(uploadResponse.fileUrl);
      data.image = uploadResponse.fileUrl;
      toast.success("AI image generated and uploaded successfully!");
    } catch (error) {
      console.error('Error generating image:', error);
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
    <div className="space-y-10 p-6 bg-gray-50 dark:bg-dark-800 rounded-lg">
      <Toaster position="top-center" />
      <div>
        <label className="block text-md font-medium text-gray-700 dark:text-gray-300 mb-2">
          Course Title
        </label>
        <input
          type="text"
          name="title"
          value={data.title}
          onChange={handleChange}
          className="w-full px-4 py-2 border border-gray-300 dark:border-dark-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-dark-800 text-gray-900 dark:text-white"
          placeholder="Enter course title"
        />
      </div>

      <div>
        <label className="block text-md font-medium text-gray-700 dark:text-gray-300 mb-2">
          Course Description
        </label>

        <div onContextMenu={handleContextMenu}>
          <ReactQuill
            style={{ marginTop: "20px", marginBottom: "10px", height: "250px" }}
            value={data.description}
            onChange={(value) => handleChange({ name: "description", value })}
            theme="snow"
            className="w-full border-gray-300 dark:border-dark-700 rounded-lg dark:bg-dark-800 text-gray-900 dark:text-white"
            ref={quillRef}
            //@ts-ignore
            onContextMenu={handleContextMenu}
          />
          {contextMenu.visible && (
            <div
              className="dark:bg-[#1e293b] bg-white context-menu"
              style={{
                position: "absolute",
                top: contextMenu.top + 435,
                left: contextMenu.left + 310,
                zIndex: 1000,
                borderRadius: "15px",
                boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
                padding: "4px 0",
                minWidth: "150px",
              }}
              onClick={(e) => e.stopPropagation()}
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
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-md font-medium text-gray-700 dark:text-gray-300 mb-2 mt-5">
            Category
          </label>
          <select
            name="category"
            value={data.category}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 dark:border-dark-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-dark-800 text-gray-900 dark:text-white"
          >
            <option value="">Select a category</option>
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="block text-md font-medium text-gray-700 dark:text-gray-300 mb-2">
          Course Image
        </label>
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
                //@ts-ignore
                onClick={generateImageUnsplash}
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
            <div className="space-y-1 text-center">
              {imagePreview ? (
                <div className="relative w-full max-w-xs">
                  <div className="aspect-w-16 h-[200px]">
                    <img
                      src={imagePreview}
                      alt="Course preview"
                      className="object-cover rounded-lg w-full h-full"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <>
                  {isUploading ? (
                    <div className="flex justify-center items-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-blue-500 border-solid"></div>
                    </div>
                  ) : (
                    <>
                      <Upload className="mx-auto h-12 w-12 text-gray-400" />
                      <div className="flex text-sm text-gray-600">
                        <label className="relative cursor-pointer bg-white dark:bg-dark-800 rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500">
                          <span>Upload a file</span>
                          <input
                            ref={imageInputRef}
                            type="file"
                            className="sr-only"
                            accept="image/*"
                            onChange={handleImageChange}
                            disabled={isUploading}
                          />
                        </label>
                        <p className="pl-1">or drag and drop</p>
                      </div>
                      <p className="text-xs text-gray-500">
                        PNG, JPG up to 5MB
                      </p>
                    </>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
      {modal.visible && (
        <div
          id="ai-response-modal"
          className="dark:bg-[#1e293b] bg-white"
          style={{
            position: "absolute",
            top: modal.top + 395,
            left: modal.left + 300,
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
      <ImageSelectionModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        images={generatedImages}
        onSelectImage={handleImageSelect}
        loading={isGenerating}
        onLoadMore={handleLoadMore}
        hasMore={hasMore}
      />
    </div>
  );
};

export default BasicInfo;
