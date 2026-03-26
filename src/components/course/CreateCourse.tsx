import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import BasicInfo from "./BasicInfo";
import ChapterCreation from "./ChapterCreation";
import QuizCreation from "./QuizCreation";
import DOMPurify from "dompurify";
import {
  createModule,
  loginIntsructor,
  getModuleById,
  updateModule,
} from "../../utils/api.js";
import { FaCheckCircle } from "react-icons/fa";
import { ChapterLayoutSelector, ChapterPreview } from "./ChapterLayouts";

const CreateCourse = () => {
  const { courseId } = useParams();
  const moduleId = courseId;
  const [isLoading, setIsLoading] = useState(false);
  const [courseData, setCourseData] = useState({
    basicInfo: {
      title: "",
      description: "",
      image: "",
      category: "",
    },
    chapters: [],
    quizzes: [],
  });
  const [isEditMode, setIsEditMode] = useState(false);
  const [successMessage, setSuccessMessage] = useState(false);
  const [showLayoutPreview, setShowLayoutPreview] = useState(false);
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("basic-info");

  const handleNext = () => {
    if (activeTab === "basic-info") {
      setActiveTab("chapters");
    } else if (activeTab === "chapters") {
      setActiveTab("quiz");
    }
  };

  useEffect(() => {
    if (moduleId) {
      setIsEditMode(true);
      const fetchModuleData = async () => {
        try {
          const token = await loginIntsructor();
          const module = await getModuleById(token, moduleId);

          setCourseData({
            basicInfo: {
              title: module.title || "",
              description: module.description || "",
              image: module.imgUrl || "",
              category: module.category || "",
            },
            chapters: module.chapters || [],
            quizzes: module.questions || [],
          });
        } catch (error) {
          console.error("Error fetching module for editing:", error);
        }
      };
      fetchModuleData();
    }
  }, [moduleId]);

  const handleBasicInfoUpdate = (data) => {
    setCourseData((prev) => ({
      ...prev,
      basicInfo: { ...prev.basicInfo, ...data },
    }));
  };

  const handleChapterUpdate = (chapters) => {
    setCourseData((prev) => ({
      ...prev,
      chapters,
    }));
  };

  const handleQuizUpdate = (quizzes) => {
    setCourseData((prev) => ({
      ...prev,
      quizzes,
    }));
  };

  const handleSaveCourse = async () => {
    setIsLoading(true);
    try {
      const token = await loginIntsructor();
      const moduleData = {
        title: courseData.basicInfo.title,
        // description: courseData.basicInfo.description,
        description: DOMPurify.sanitize(courseData.basicInfo.description, {
          ALLOWED_TAGS: [],
        }),
        category: courseData.basicInfo.category,
        imgUrl: courseData.basicInfo.image,
        chapters: courseData.chapters.map((chapter, chapterIndex) => ({
          title: chapter.title,
          description: chapter.description,
          order: chapterIndex + 1,
          template: chapter.layout ? chapter.layout : chapter.template,
          content: {
            imgUrl: chapter.content?.imgUrl || chapter.image || "",
            audioUrl: chapter.content?.audioUrl || chapter.audio || "",
            videoUrl: chapter.content?.videoUrl || "",
          },
          subChapters:
            chapter.subChapters?.map((subChapter, subChapterIndex) => ({
              title: subChapter.title,
              // description: subChapter.description,
              description: DOMPurify.sanitize(subChapter.description, {
                ALLOWED_TAGS: [],
              }),
              order: subChapterIndex + 1,
              template: subChapter.layout
                ? subChapter.layout
                : subChapter.template,
              content: {
                imgUrl: subChapter.content?.imgUrl || subChapter.image || "",
                audioUrl:
                  subChapter.content?.audioUrl || subChapter.audio || "",
                videoUrl: subChapter.content?.videoUrl || "",
              },
            })) || [],
        })),
        questions: courseData.quizzes.map((quiz, index) => ({
          title: quiz.title || "Test title",
          question: quiz.question,
          options: quiz.options,
          type: quiz.type,
          answer: quiz.correctAnswers ? quiz.correctAnswers : quiz.answer,
          order: courseData.chapters.length + index + 1,
          template: "chapter-one",
        })),
      };

      const response = isEditMode
        ? await updateModule(token, moduleId, moduleData)
        : await createModule(token, moduleData);

      setSuccessMessage(true);

      setTimeout(() => {
        setSuccessMessage(false);
        navigate("/instructor");
      }, 3000);
    } catch (error) {
      console.error("Error saving course:", error);
      alert("Failed to save course. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 ">
      {successMessage && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white dark:bg-dark-800 p-8 rounded-xl shadow-lg text-center w-80 animate-fadeIn flex flex-col items-center">
            <FaCheckCircle size={50} color="green" />
            <h2 className="mt-4 text-xl font-semibold text-gray-900 dark:text-white">
              Course Saved Successfully!
            </h2>
          </div>
        </div>
      )}

      <div className="mb-8">
        <h1 className="text-3xl font-semibold text-gray-900 dark:text-white">
          {isEditMode ? "Edit Course" : "Create New Course"}
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          {isEditMode
            ? "Edit your course details"
            : "Create and customize your course content"}
        </p>
      </div>

      <div className="bg-white dark:bg-dark-800 rounded-xl shadow-sm border border-gray-100 dark:border-dark-700">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="border-b border-gray-200 dark:border-dark-700">
            <TabsList className="flex">
              <TabsTrigger
                value="basic-info"
                onClick={() => setActiveTab("basic-info")}
                className={`flex-1 px-6 py-4 text-sm font-medium ${
                  activeTab === "basic-info"
                    ? "text-blue-600 border-b-2 border-blue-600"
                    : "text-gray-500 dark:text-gray-400 hover:text-gray-700 hover:bg-gray-50 dark:hover:bg-dark-700"
                }`}
              >
                Basic Info
              </TabsTrigger>

              <TabsTrigger
                value="chapters"
                onClick={() => setActiveTab("chapters")}
                className={`flex-1 px-6 py-4 text-sm font-medium ${
                  activeTab === "chapters"
                    ? "text-blue-600 border-b-2 border-blue-600"
                    : "text-gray-500 dark:text-gray-400 hover:text-gray-700 hover:bg-gray-50 dark:hover:bg-dark-700"
                }`}
              >
                Chapters
              </TabsTrigger>

              <TabsTrigger
                value="quiz"
                onClick={() => setActiveTab("quiz")}
                className={`flex-1 px-6 py-4 text-sm font-medium ${
                  activeTab === "quiz"
                    ? "text-blue-600 border-b-2 border-blue-600"
                    : "text-gray-500 dark:text-gray-400 hover:text-gray-700 hover:bg-gray-50 dark:hover:bg-dark-700"
                }`}
              >
                Quiz
              </TabsTrigger>
            </TabsList>
          </div>

          <div className="p-6">
            <TabsContent value="basic-info">
              <BasicInfo
                data={courseData.basicInfo}
                onUpdate={handleBasicInfoUpdate}
              />
            </TabsContent>

            <TabsContent value="chapters">
              <ChapterCreation
                chapters={courseData.chapters}
                onUpdate={handleChapterUpdate}
              />
            </TabsContent>
            <TabsContent value="quiz">
              <QuizCreation
                quizzes={courseData.quizzes}
                onUpdate={handleQuizUpdate}
              />
            </TabsContent>
          </div>
        </Tabs>

        <div className="flex justify-end px-6 py-4 border-t border-gray-100 dark:border-dark-700">
          <button
            onClick={() => navigate("/instructor")}
            className="px-6 py-2 mr-4 rounded-lg text-gray-700 bg-gray-200 hover:bg-gray-300 transition focus:ring-4 focus:ring-gray-300"
          >
            Cancel
          </button>
          {activeTab !== "quiz" ? (
            <button
              onClick={handleNext}
              className="px-6 py-2 rounded-lg text-white bg-blue-600 hover:bg-blue-700 transition focus:ring-4 focus:ring-blue-200"
            >
              Next
            </button>
          ) : (
            <button
              onClick={handleSaveCourse}
              disabled={isLoading}
              className={`px-6 py-2 rounded-lg text-white transition focus:ring-4 focus:ring-blue-200 ${
                isLoading
                  ? "bg-blue-400 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700"
              }`}
            >
              {isLoading
                ? "Saving..."
                : isEditMode
                  ? "Update Course"
                  : "Save Course"}
            </button>
          )}
        </div>
      </div>

      {showLayoutPreview && (
        <ChapterPreview
          layout={courseData.layout}
          onClose={() => setShowLayoutPreview(false)}
        />
      )}
    </div>
  );
};

export default CreateCourse;
