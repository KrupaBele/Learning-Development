import React, { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DOMPurify from 'dompurify';
import parse from 'html-react-parser';
import {
  ChevronLeft,
  CheckCircle,
  XCircle,
  Clock,
  PlayCircle,
  Volume2,
  VolumeX,
  ChevronRight,
  Maximize2,
  Pause,
  BookOpen,
  Edit2,
  Upload,
  Save,
  X
} from 'lucide-react';
import {
  Tabs, TabsContent, TabsList, TabsTrigger
} from '../ui/tabs';
import { login, getModuleByIdAdmin, updateModulebyAdmin, updateCourseStatus, uploadImage } from '../../utils/api.js';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

const CourseReview = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [showRejectionModal, setShowRejectionModal] = useState(false);
  const [rejectionComment, setRejectionComment] = useState('');
  const [selectedChapter, setSelectedChapter] = useState(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingChapter, setEditingChapter] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [courseData, setCourseData] = useState(null);
  const [token, setToken] = useState(null);
  const [isApproving, setIsApproving] = useState(null);
  const [isRejecting, setIsRejecting] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const courseImageRef = useRef(null);
  const chapterImageRef = useRef(null);
  const chapterAudioRef = useRef(null);
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  useEffect(() => {
    const fetchCourseData = async () => {
      try {
        const token = await login();
        setToken(token);
        const moduleData = await getModuleByIdAdmin(token, id);
        console.log(moduleData, "moduleData");
        setCourseData(moduleData);
      } catch (error) {
        console.error('Error fetching course data:', error);
      }
    };
    fetchCourseData();
  }, [id]);

  const handleCourseImageChange = async (e) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const uploadResponse = await uploadImage(file);
        console.log(uploadResponse, "upload response");
        setCourseData((prev) => ({ ...prev, imgUrl: uploadResponse.fileUrl }));
      } catch (error) {
        console.error('Image upload failed:', error);
      }
    }
  };

  const handleChapterImageChange = async (e) => {
    const file = e.target.files?.[0];
    if (file && editingChapter) {
      try {
        const uploadResponse = await uploadImage(file);
        setEditingChapter((prev) => ({
          ...prev,
          content: { ...prev.content, imgUrl: uploadResponse.fileUrl },
        }));
        setSelectedChapter((prev) => ({
          ...prev,
          content: { ...prev.content, imgUrl: uploadResponse.fileUrl },
        }));

        const updatedChapters = courseData?.chapters.map((ch) => {
          if (ch.id === editingChapter.id) {
            return { ...ch, content: { ...ch.content, imgUrl: uploadResponse.fileUrl } };
          }
          return ch;
        });

        setCourseData((prev) => ({ ...prev, chapters: updatedChapters }));
      } catch (error) {
        console.error('Chapter image upload failed:', error);
      }
    }
  };

  const handleChapterAudioChange = async (e) => {
    const file = e.target.files?.[0];
    if (file && editingChapter) {
      try {
        const uploadResponse = await uploadImage(file);
        setEditingChapter((prev) => ({
          ...prev,
          content: { ...prev.content, audioUrl: uploadResponse.fileUrl },
        }));
        setSelectedChapter((prev) => ({
          ...prev,
          content: { ...prev.content, audioUrl: uploadResponse.fileUrl },
        }));

        const updatedChapters = courseData?.chapters.map((ch) => {
          if (ch.id === editingChapter.id) {
            return { ...ch, content: { ...ch.content, audioUrl: uploadResponse.fileUrl } };
          }
          return ch;
        });

        setCourseData((prev) => ({ ...prev, chapters: updatedChapters }));
      } catch (error) {
        console.error('Chapter audio upload failed:', error);
      }
    }
  };

  const handleEditChapter = (chapter) => {
    const sanitizedDescription = DOMPurify.sanitize(chapter.description || '');
    setEditingChapter({ ...chapter, description: sanitizedDescription });
    setShowEditModal(true);
  };

  const handleSaveChapterEdit = async () => {
    let updatedData = [];
    if (token) {
      if (editingChapter) {
        const updatedChapters = courseData?.chapters.map((ch) =>
          ch.id === editingChapter.id ? editingChapter : ch
        );
        updatedData = { ...courseData, chapters: updatedChapters };
      } else {
        updatedData = courseData;
      }
      try {
        await updateModulebyAdmin(token, id, updatedData);
        setCourseData(updatedData);
        setShowEditModal(false);
        setEditingChapter(null);
      } catch (error) {
        console.error('Error updating module:', error);
      } finally {
        setIsEditing(!isEditing);
        setIsLoading(false);
      }
    }
  };

  const handleEditField = (field, value) => {
    setCourseData((prev) => ({
      ...prev,
      [field]: value
    }));
  };

  const handleEditLearningOutcome = (index, value) => {
    const newOutcomes = [...courseData?.learningOutcomes];
    newOutcomes[index] = value;
    setCourseData((prev) => ({
      ...prev,
      learningOutcomes: newOutcomes
    }));
  };

  const handleApprove = async () => {
    console.log(id, " courseId ");
    setIsApproving(id);
    try {
      const response = await updateCourseStatus(token, id, "published");
      console.log("Course status updated to published:", response);
    } catch (error) {
      console.error("Error updating course status:", error);
    } finally {
      setIsApproving(null);
      navigate('/admin/dashboard');
    }
  };

  const handleReject = async () => {
    if (!rejectionComment.trim()) return;
    console.log('Course rejected:', id, 'Comment:', rejectionComment);
    setIsApproving(id);
    try {
      const response = await updateCourseStatus(token, id, "rejected");
      console.log("Course status updated to rejected:", response);
    } catch (error) {
      console.error("Error updating course status:", error);
    } finally {
      setIsApproving(null);
      navigate('/admin/dashboard');
    }
  };

  const handleChapterSelect = (chapter) => {
    console.log(chapter, "chapter");
    setSelectedChapter(chapter);
    setActiveTab('content');
  };

  const handleNextChapter = () => {
    const currentIndex = courseData?.chapters.findIndex(ch => ch.id === selectedChapter?.id);
    if (currentIndex < courseData?.chapters.length - 1) {
      setSelectedChapter(courseData?.chapters[currentIndex + 1]);
    }
  };

  const handlePreviousChapter = () => {
    const currentIndex = courseData?.chapters.findIndex(ch => ch.id === selectedChapter?.id);
    if (currentIndex > 0) {
      setSelectedChapter(courseData?.chapters[currentIndex - 1]);
    }
  };

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = () => {
    if (audioRef.current) {
      audioRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const renderContent = () => {
    console.log(selectedChapter, "selectedchapter");
    if (!selectedChapter) {
      return (
        <>
          <div className="p-8 text-center text-gray-500 dark:text-gray-300">
            Select a chapter to view its content
          </div>
          {/* Chapter List */}
          <div className="mt-8 bg-white dark:bg-dark-800 rounded-xl shadow-sm border border-gray-100 dark:border-dark-700 p-6">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Chapters</h2>
            <div className="space-y-4">
              {courseData?.chapters.map((chapter) => (
                <div
                  key={chapter.id}
                  className="flex items-center justify-between p-4 bg-gray-50 dark:bg-dark-700 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-600 transition"
                >
                  <div className="flex items-center space-x-4">
                    <div className="p-2 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
                      <BookOpen className="w-5 h-5 text-blue-500 dark:text-blue-400" />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900 dark:text-white">{chapter.title}</h3>
                      {/* <div className="text-sm text-gray-500 dark:text-gray-300">
                        {parse(DOMPurify.sanitize(chapter.description || ''))}
                      </div> */}
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    {chapter.image && (
                      <img
                        src={chapter.image}
                        alt={chapter.title}
                        className="w-10 h-10 rounded object-cover"
                      />
                    )}
                    {chapter.audio && (
                      <Volume2 className="w-5 h-5 text-blue-500" />
                    )}
                    {isEditing && (
                      <button
                        onClick={() => handleEditChapter(chapter)}
                        className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg"
                      >
                        <Edit2 className="w-5 h-5" />
                      </button>
                    )}
                    <ChevronRight
                      className="w-5 h-5 text-gray-400 cursor-pointer"
                      onClick={() => handleChapterSelect(chapter)}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      );
    }

    return (
      <>
        <div className="flex h-[calc(100vh-12rem)]">
          {/* Content Panel */}
          <div className="w-1/2 p-8 border-r border-gray-100 dark:border-dark-700 overflow-y-auto bg-white dark:bg-dark-800">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">{selectedChapter.title}</h2>
            <div className="prose prose-blue max-w-none dark:prose-dark">
              {parse(DOMPurify.sanitize(selectedChapter.description || ''))}
            </div>
          </div>

          {/* Media Panel */}
          <div className="w-1/2 flex flex-col">
            {/* Image Container */}
            <div className="relative flex-1 bg-gray-900">
              <img
                src={selectedChapter.content.imgUrl}
                alt={selectedChapter.title}
                className="w-full h-full object-cover"
              />

              {/* Audio Element (Hidden) */}
              <audio ref={audioRef} src={selectedChapter.content.audioUrl} />

              {/* Media Controls */}
              <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
                <div className="flex items-center justify-between text-white">
                  <div className="flex items-center space-x-4">
                    <button
                      onClick={togglePlay}
                      className="p-2 hover:bg-white/20 rounded-full transition"
                    >
                      {isPlaying ? <Pause className="w-6 h-6" /> : <PlayCircle className="w-6 h-6" />}
                    </button>
                    <button
                      onClick={toggleMute}
                      className="p-2 hover:bg-white/20 rounded-full transition"
                    >
                      {isMuted ? <VolumeX className="w-6 h-6" /> : <Volume2 className="w-6 h-6" />}
                    </button>
                  </div>
                  <div className="flex items-center space-x-4">
                    <button
                      onClick={handlePreviousChapter}
                      className="p-2 hover:bg-white/20 rounded-full transition text-gray-600 dark:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={selectedChapter.id === courseData?.chapters[0].id}
                    >
                      <ChevronLeft className="w-6 h-6" />
                    </button>
                    <button
                      onClick={handleNextChapter}
                      className="p-2 hover:bg-white/20 rounded-full transition text-gray-600 dark:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={selectedChapter.id === courseData?.chapters[courseData?.chapters.length - 1].id}
                    >
                      <ChevronRight className="w-6 h-6" />
                    </button>
                    <button
                      onClick={() => setIsFullscreen(!isFullscreen)}
                      className="p-2 hover:bg-white/20 rounded-full transition text-gray-600 dark:text-gray-300"
                    >
                      <Maximize2 className="w-6 h-6" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Chapter Navigation */}
            <div className="p-4 bg-gray-50 dark:bg-dark-700 border-t border-gray-100 dark:border-dark-700">
              <div className="flex justify-between items-center">
                <button
                  onClick={handlePreviousChapter}
                  className="flex items-center space-x-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={selectedChapter.id === courseData?.chapters[0].id}
                >
                  <ChevronLeft className="w-5 h-5" />
                  <span>Previous Chapter</span>
                </button>
                <button
                  onClick={handleNextChapter}
                  className="flex items-center space-x-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={selectedChapter.id === courseData?.chapters[courseData?.chapters.length - 1].id}
                >
                  <span>Next Chapter</span>
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
        {/* Chapter List */}
        <div className="mt-8 bg-white dark:bg-dark-800 rounded-xl shadow-sm border border-gray-100 dark:border-dark-700 p-6">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Chapters</h2>
          <div className="space-y-4">
            {courseData?.chapters.map((chapter) => (
              <div
                key={chapter.id}
                className="flex items-center justify-between p-4 bg-gray-50 dark:bg-dark-700 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-600 transition"
              >
                <div className="flex items-center space-x-4">
                  <div className="p-2 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
                    <BookOpen className="w-5 h-5 text-blue-500 dark:text-blue-400" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-white">{chapter.title}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-300">{chapter.duration}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  {chapter.image && (
                    <img
                      src={chapter.image}
                      alt={chapter.title}
                      className="w-10 h-10 rounded object-cover"
                    />
                  )}
                  {chapter.audio && (
                    <Volume2 className="w-5 h-5 text-blue-500" />
                  )}
                  {isEditing && (
                    <button
                      onClick={() => handleEditChapter(chapter)}
                      className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg"
                    >
                      <Edit2 className="w-5 h-5" />
                    </button>
                  )}
                  <ChevronRight
                    className="w-5 h-5 text-gray-400 cursor-pointer"
                    onClick={() => handleChapterSelect(chapter)}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </>
    );
  };

  const renderEditableOverview = () => (
    <div className="p-8 space-y-8">
      {/* Course Image */}
      <div className="relative rounded-lg overflow-hidden flex justify-center">
        <img
          src={courseData?.imgUrl}
          alt={courseData?.title}
          className="object-cover rounded-lg w-full"
          style={{ width: '20rem' }}
        />
        {isEditing && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <button
              onClick={() => courseImageRef.current?.click()}
              className="px-4 py-2 bg-white dark:bg-dark-700 text-gray-900 dark:text-white rounded-lg hover:bg-gray-100 dark:hover:bg-dark-600 flex items-center space-x-2"
            >
              <Upload className="w-5 h-5" />
              <span>Change Image</span>
            </button>
            <input
              ref={courseImageRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleCourseImageChange}
            />
          </div>
        )}
      </div>

      {/* Course Details */}
      <div className="space-y-6">
        {isEditing ? (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Title</label>
              <input
                type="text"
                value={courseData?.title}
                onChange={(e) => handleEditField('title', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-dark-700 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-dark-800 text-gray-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Description</label>
              <textarea
                value={courseData?.description}
                onChange={(e) => handleEditField('description', e.target.value)}
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 dark:border-dark-700 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-dark-800 text-gray-900 dark:text-white"
              />
            </div>
          </>
        ) : (
          <>
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Description</h3>
              <p className="text-gray-600 dark:text-gray-300">{parse(DOMPurify.sanitize(courseData?.description || ''))}</p>
            </div>
          </>
        )}
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => navigate('/admin/dashboard')}
          className="flex items-center text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white mb-4"
        >
          <ChevronLeft className="w-5 h-5 mr-1" />
          Back to Dashboard
        </button>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-semibold text-gray-900 dark:text-white">{courseData?.title}</h1>
          </div>
          <div className="flex space-x-4">
            <button
              onClick={() => {
                if (isEditing) handleSaveChapterEdit();
                else setIsEditing(true);
              }}
              disabled={isLoading}
              className={`px-4 py-2 border rounded-lg flex items-center space-x-2 transition 
                ${isEditing 
                  ? "text-green-600 dark:text-green-400 border-green-600 dark:border-green-700 hover:bg-green-50 dark:hover:bg-green-700/30" 
                  : "text-blue-600 dark:text-blue-400 border-blue-600 dark:border-blue-700 hover:bg-blue-50 dark:hover:bg-blue-700/30"
                } 
                ${isLoading ? "cursor-not-allowed opacity-50" : ""}`}
            >
              {isLoading ? (
                <div className="flex items-center">
                  <svg
                    className="animate-spin h-5 w-5 mr-2 text-gray-500"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 11-8 8z"
                    ></path>
                  </svg>
                  <span>Saving...</span>
                </div>
              ) : isEditing ? (
                <>
                  <Save className="w-5 h-5" />
                  <span>Save Changes</span>
                </>
              ) : (
                <>
                  <Edit2 className="w-5 h-5" />
                  <span>Edit Course</span>
                </>
              )}
            </button>
            <button
              onClick={() => setShowRejectionModal(true)}
              className="px-4 py-2 text-red-600 dark:text-red-400 border border-red-600 dark:border-red-700 rounded-lg hover:bg-red-50 dark:hover:bg-red-700/30"
            >
              Reject
            </button>
            <button
              onClick={handleApprove}
              className="px-4 py-2 bg-green-600 dark:bg-green-700 text-white rounded-lg hover:bg-green-700 dark:hover:bg-green-800"
            >
              Approve
            </button>
          </div>
        </div>
      </div>

      {/* Course Content */}
      <div className="bg-white dark:bg-dark-800 rounded-xl shadow-sm border border-gray-100 dark:border-dark-700">
        <Tabs defaultValue="overview" className="w-full">
          <div className="border-b border-gray-200 dark:border-dark-700">
            <TabsList className="flex">
              <TabsTrigger
                value="overview"
                className="flex-1 px-6 py-4 text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-dark-700"
              >
                Overview
              </TabsTrigger>
              <TabsTrigger
                value="content"
                className="flex-1 px-6 py-4 text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-dark-700"
              >
                Content
              </TabsTrigger>
              <TabsTrigger
                value="quizzes"
                className="flex-1 px-6 py-4 text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-dark-700"
              >
                Quizzes
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="overview">
            {renderEditableOverview()}
          </TabsContent>

          <TabsContent value="content">
            {renderContent()}
          </TabsContent>

          <TabsContent value="quizzes">
            <div className="p-8 space-y-6">
              {courseData?.questions?.map((quiz, index) => (
                <div key={index} className="bg-gray-50 dark:bg-dark-800 rounded-lg p-6">
                  <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">{quiz.title}</h2>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">{quiz.question}</h3>
                  <div className="space-y-3">
                    {quiz.options.map((option, optionIndex) => (
                      <div
                        key={optionIndex}
                        className={`p-4 rounded-lg border ${
                          quiz.answer.includes(String(option))
                            ? 'bg-green-50 dark:bg-green-900/30 border-green-200 dark:border-green-700'
                            : 'bg-white dark:bg-dark-700 border-gray-200 dark:border-dark-700'
                        }`}
                      >
                        {quiz.answer.includes(String(option)) && (
                          <CheckCircle className="inline-block w-5 h-5 text-green-500 mr-2" />
                        )}
                        <span className="text-gray-900 dark:text-white">{option}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Edit Chapter Modal */}
      {showEditModal && editingChapter && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-dark-800 rounded-lg p-6 w-full max-w-2xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">Edit Chapter</h3>
              <button
                onClick={() => setShowEditModal(false)}
                className="text-gray-400 dark:text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Title</label>
                <input
                  type="text"
                  value={editingChapter.title}
                  onChange={(e) => setEditingChapter({ ...editingChapter, title: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-dark-700 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-dark-800 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Content</label>
                <ReactQuill
                  value={editingChapter.description}
                  onChange={(value) => setEditingChapter({ ...editingChapter, description: value })}
                  className="bg-white dark:bg-dark-800 text-gray-900 dark:text-white"
                  modules={{
                    toolbar: [
                      [{ 'header': [1, 2, 3, false] }],
                      ['bold', 'italic', 'underline', 'strike'],
                      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                      ['link'],
                      ['clean']
                    ]
                  }}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Duration</label>
                <input
                  type="text"
                  value={editingChapter.duration}
                  onChange={(e) => setEditingChapter({ ...editingChapter, duration: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-dark-700 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-dark-800 text-gray-900 dark:text-white"
                />
              </div>
              <div className="flex space-x-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Chapter Image</label>
                  <div className="flex items-center space-x-4">
                    {editingChapter.content?.imgUrl && (
                      <img
                        src={editingChapter.content?.imgUrl}
                        alt="Chapter preview"
                        className="w-20 h-20 rounded object-cover"
                      />
                    )}
                    <button
                      onClick={() => chapterImageRef.current?.click()}
                      className="px-4 py-2 border border-gray-300 dark:border-dark-700 rounded-lg hover:bg-gray-50 dark:hover:bg-dark-700 flex items-center space-x-2"
                    >
                      <Upload className="w-5 h-5" />
                      <span>Change Image</span>
                    </button>
                    <input
                      ref={chapterImageRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleChapterImageChange}
                    />
                  </div>
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Chapter Audio</label>
                  <div className="flex items-center space-x-4">
                    {editingChapter.content?.audioUrl && (
                      <audio controls className="w-36 mx-2">
                        <source src={editingChapter.content?.audioUrl} type="audio/mpeg" />
                      </audio>
                    )}
                    <button
                      onClick={() => chapterAudioRef.current?.click()}
                      className="px-4 py-2 border border-gray-300 dark:border-dark-700 rounded-lg hover:bg-gray-50 dark:hover:bg-dark-700 flex items-center space-x-2"
                    >
                      <Upload className="w-5 h-5" />
                      <span>{editingChapter.audio ? 'Change Audio' : 'Add Audio'}</span>
                    </button>
                    <input
                      ref={chapterAudioRef}
                      type="file"
                      accept="audio/*"
                      className="hidden"
                      onChange={handleChapterAudioChange}
                    />
                  </div>
                </div>
              </div>
            </div>
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowEditModal(false)}
                className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:text-gray-700 dark:hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveChapterEdit}
                className="px-4 py-2 bg-blue-600 dark:bg-blue-700 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-800"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Rejection Modal */}
      {showRejectionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-dark-800 rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              Reject Course: {courseData?.title}
            </h3>
            <textarea
              value={rejectionComment}
              onChange={(e) => setRejectionComment(e.target.value)}
              placeholder="Please provide a reason for rejection..."
              className="w-full px-4 py-2 border border-gray-300 dark:border-dark-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-dark-800 text-gray-900 dark:text-white"
              rows={4}
            />
            <div className="flex justify-end space-x-3 mt-4">
              <button
                onClick={() => setShowRejectionModal(false)}
                className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:text-gray-700 dark:hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleReject}
                className="px-4 py-2 bg-red-600 dark:bg-red-700 text-white rounded-lg hover:bg-red-700 dark:hover:bg-red-800"
                disabled={!rejectionComment.trim()}
              >
                Reject Course
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CourseReview;
