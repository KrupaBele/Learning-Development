import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import Confetti from "react-confetti";
import TemplateRenderer from "./Layout";
import DOMPurify from "dompurify";
import parse from "html-react-parser";

import {
  ChevronLeft,
  ChevronRight as ChevronNextIcon,
  PlayCircle,
  CheckCircle,
  Clock,
  XCircle,
  ChevronRight,
} from "lucide-react";
import axios from "axios";
import { ChapterContent, chapterLayouts } from "../course/ChapterLayouts";

// Interfaces
interface ChapterContent {
  imgUrl?: string;
  audioUrl?: string;
  videoUrl?: string;
}

interface SubChapter {
  _id: string;
  title: string;
  description: string;
  content: ChapterContent;
  order: number;
}

interface Question {
  _id: string;
  question: string;
  type: "SCQ" | "MCQ";
  options: string[];
  answer: string[];
}
interface Chapter {
  _id: string;
  title: string;
  description: string;
  content: ChapterContent;
  isCompleted: true | false;
  duration: string;
  template: string;
  subChapters?: SubChapter[];
}

const TrainingDetails = () => {
  const navigate = useNavigate();
  const token = useSelector((state: any) => state.auth.token);
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState("overview");
  const [questionPanel, setQuestionPanel] = useState("overview");
  const [trainingDetails, setTrainingDetails] = useState<any>(null);
  const [expandedChapters, setExpandedChapters] = useState<
    Record<string, boolean>
  >({});
  console.log(trainingDetails);
  const toggleChapterExpansion = (chapterId: string) => {
    setExpandedChapters((prev) => ({
      ...prev,
      [chapterId]: !prev[chapterId],
    }));
  };

  const isChapterExpanded = (chapterId: string) => {
    return expandedChapters[chapterId] || false;
  };

  const [selectedChapter, setSelectedChapter] = useState<Chapter | null>(null);
  const [selectedSubChapter, setSelectedSubChapter] =
    useState<SubChapter | null>(null);
  const [nextItem, setNextItem] = useState<{
    itemType: string;
    data: string;
  } | null>(null);

  const [question, setQuestion] = useState<Question | null>(null);
  const [selectedAnswers, setSelectedAnswers] = useState<string[]>([]);
  console.log(selectedAnswers);

  const [currentQuestionId, setCurrentQuestionId] = useState<string | null>(
    null,
  );
  const [nextQuestionId, setNextQuestionId] = useState<string | null>(null);
  const [prevQuestionId, setPrevQuestionId] = useState<string | null>(null);

  const [userAnswer, setUserAnswer] = useState<string | null>(null); // Track the selected answer
  const [isPopupVisible, setIsPopupVisible] = useState(false);
  const [showConfetti, setShowConfetti] = useState(true);
  const [confettiKey, setConfettiKey] = useState(0); // Unique key for Confetti

  const [isAnswerCorrect, setIsAnswerCorrect] = useState(false);
  const isLastQuestion = nextQuestionId === null;

  const [parsedDescription, setParsedDescription] = useState("");

  const mapTemplateNameToId = (templateName: string): string => {
    const layout = chapterLayouts.find((l) => l.name === templateName);
    return layout ? layout.id : "layout1"; // default to layout1 if not found
  };

  useEffect(() => {
    if (trainingDetails?.description) {
      // First sanitize the HTML content
      const sanitizedContent = DOMPurify.sanitize(trainingDetails.description);
      // Then parse it to React elements
      const parsedContent = parse(sanitizedContent);
      //@ts-ignore
      setParsedDescription(parsedContent);
    }
  }, [trainingDetails?.description]);

  const closePopup = () => {
    setIsPopupVisible(false);
  };
  const handleNextQuestionAndClosePopup = () => {
    // Close the popup
    setIsPopupVisible(false);

    // Move to the next question
    handleNextQuestion();
  };

  useEffect(() => {
    if (!token) {
      window.location.href = "/login";
      return;
    }

    axios
      .get(`https://gaussconnect.com/api/module/${id}/employee`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((response) => {
        setTrainingDetails(response.data);
        setSelectedChapter(response.data.chapters[0]);
      })
      .catch((error) => console.error("Error fetching module data:", error));
  }, [id]);

  const handleChapterSelect = (chapterId: string) => {
    if (!token) {
      window.location.href = "/login";
      return;
    }

    axios
      .get(
        `https://gaussconnect.com/api/section?id=${chapterId}&type=chapter`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      )
      .then((response) => {
        const fetchedChapter: Chapter = response.data.currentItem;
        setSelectedChapter(fetchedChapter);
        setSelectedSubChapter(null); // Reset selected subchapter when selecting a new chapter
        setNextItem(response.data.nextItem || null);
        setActiveTab("content");
        setQuestionPanel("content");
        setSelectedAnswers([]);
        completeChapter(fetchedChapter._id);
      })
      .catch((error) =>
        console.error("Error fetching chapter content:", error),
      );
  };

  const handleSubChapterSelect = (subChapter: SubChapter) => {
    if (!token || !selectedChapter) {
      window.location.href = "/login";
      return;
    }

    axios
      .get(
        `https://gaussconnect.com/api/section?id=${selectedChapter._id}&type=chapter&subchapterOrder=${subChapter.order}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      )
      .then((response) => {
        setSelectedSubChapter(response.data.currentItem);
        setNextItem(response.data.nextItem || null);
        setQuestionPanel("content");
        setSelectedAnswers([]);
      })
      .catch((error) =>
        console.error("Error fetching subchapter content:", error),
      );
  };

  const fetchQuestion = (questionId: string) => {
    axios
      .get(
        `https://gaussconnect.com/api/section?id=${questionId}&type=question`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      )
      .then((response) => {
        // Assuming the API response contains the question data you need
        setQuestion(response.data.currentItem);
        setCurrentQuestionId(response.data.currentItem._id);
        setNextQuestionId(response.data.nextItem?.data || null);
        setPrevQuestionId(response.data.prevItem?.data || null);
        setQuestionPanel("overview"); // Assuming this is to control the display of the question panel
      })
      .catch((error) => {
        console.error("Error fetching question:", error);
      });
  };

  const completeChapter = (chapterId: string) => {
    if (!token) {
      window.location.href = "/login";
      return;
    }

    axios
      .post(
        "https://gaussconnect.com/api/chapter-complete",
        {
          chapterId: chapterId,
          moduleId: id, // Ensure module ID is sent
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      )
      .then((response) => {
        console.log("Chapter marked as complete:", response.data);

        // Update chapter state to mark it as completed
        setTrainingDetails((prevDetails: any) => {
          return {
            ...prevDetails,
            chapters: prevDetails.chapters.map((chapter: Chapter) =>
              chapter._id === chapterId
                ? { ...chapter, isCompleted: true }
                : chapter,
            ),
          };
        });
      })
      .catch((error) =>
        console.error("Error marking chapter as complete:", error),
      );
  };

  const handleNextQuestion = () => {
    setSelectedAnswers([]); // Clear before moving to the next question

    if (nextQuestionId) {
      fetchQuestion(nextQuestionId);
    }
  };
  const handlePrevQuestion = () => {
    setSelectedAnswers([]); // Clear before moving to the next question

    if (!prevQuestionId) {
      console.log(
        "First question detected. Going back to the previous chapter...",
      );

      const previousChapter = getPreviousChapter();
      if (previousChapter) {
        console.log("Navigating to previous chapter:", previousChapter.title);
        handleChapterSelect(previousChapter._id); // Load previous chapter
      } else {
        console.log("No previous chapter found.");
      }
    } else {
      console.log("Navigating to previous question:", prevQuestionId);
      fetchQuestion(prevQuestionId);
    }
  };

  const handleAnswerSubmit = () => {
    if (!selectedAnswers.length || !question) return;

    setShowConfetti(false);
    setTimeout(() => {
      // Check if the answer is correct
      const isCorrect =
        selectedAnswers.length === question.answer.length &&
        selectedAnswers.every((ans) => question.answer.includes(ans));

      setIsAnswerCorrect(isCorrect);
      setIsPopupVisible(true);

      if (isCorrect) {
        // Update key to force re-render of Confetti
        setConfettiKey((prevKey) => prevKey + 1);
        setShowConfetti(true);

        // Stop confetti after 3 seconds
        setTimeout(() => setShowConfetti(false), 3000);
      }
    }, 100); // Small delay to reset confetti
    // Post the selected answer to check if it's correct
    axios
      .post(
        "https://gaussconnect.com/api/question-complete",
        {
          questionId: question._id,
          moduleId: id,
          answer: selectedAnswers, // Send selected answers as an array
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      )
      .then((response) => {
        const isCorrect = response.data.correct;
        console.log(isCorrect);

        // If there's a next question, load it after a short delay
        if (response.data.nextItem) {
          setTimeout(() => {
            fetchQuestion(response.data.nextItem.data); // Fetch next question
            setIsPopupVisible(false); // Hide popup when moving to the next question
          }, 2000); // 2 seconds delay before moving to the next question
        }
      })
      .catch((error) => console.error("Error submitting answer:", error));
  };

  const handleOptionChange = (option: string) => {
    if (question?.type === "SCQ") {
      // Single-choice: Only one option can be selected
      setSelectedAnswers([option]);
    } else {
      // Multi-choice: Allow multiple selections
      setSelectedAnswers((prev) =>
        prev.includes(option)
          ? prev.filter((ans) => ans !== option)
          : [...prev, option],
      );
    }
  };

  const getNextChapter = () => {
    if (!selectedChapter || !trainingDetails) return null;
    const currentIndex = trainingDetails.chapters.findIndex(
      (chapter: Chapter) => chapter._id === selectedChapter._id,
    );
    return currentIndex + 1 < trainingDetails.chapters.length
      ? trainingDetails.chapters[currentIndex + 1]
      : null;
  };

  const getPreviousChapter = () => {
    if (!selectedChapter || !trainingDetails) return null;
    const currentIndex = trainingDetails.chapters.findIndex(
      (chapter: Chapter) => chapter._id === selectedChapter._id,
    );
    return currentIndex - 1 >= 0
      ? trainingDetails.chapters[currentIndex - 1]
      : null;
  };

  const getNextSubChapter = () => {
    if (!selectedChapter || !selectedSubChapter || !selectedChapter.subChapters)
      return null;
    const currentIndex = selectedChapter.subChapters.findIndex(
      (subChapter) => subChapter._id === selectedSubChapter._id,
    );
    return currentIndex + 1 < selectedChapter.subChapters.length
      ? selectedChapter.subChapters[currentIndex + 1]
      : null;
  };

  const getPreviousSubChapter = () => {
    if (!selectedChapter || !selectedSubChapter || !selectedChapter.subChapters)
      return null;
    const currentIndex = selectedChapter.subChapters.findIndex(
      (subChapter) => subChapter._id === selectedSubChapter._id,
    );
    return currentIndex - 1 >= 0
      ? selectedChapter.subChapters[currentIndex - 1]
      : null;
  };

  useEffect(() => {
    if (isAnswerCorrect) {
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 3000); // Show confetti for 3 seconds
    }
  }, [isAnswerCorrect]);

  return (
    <div className="max-w-7xl mx-auto px-4  space-y-8 dark:bg-dark-900">
      {/* Breadcrumb Navigation */}
      <nav className="absolute top-5 flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
        <Link
          to="/employee"
          className="hover:text-gray-700 dark:hover:text-white"
        >
          Home
        </Link>
        <ChevronNextIcon className="w-4 h-4" />
        <Link
          to="/employee"
          className="hover:text-gray-700 dark:hover:text-white"
        >
          Dashboard
        </Link>
        <ChevronNextIcon className="w-4 h-4" />
        <span className="text-gray-900 dark:text-white">Course</span>
      </nav>

      {activeTab === "overview" ? (
        <>
          {trainingDetails && (
            <div className="bg-white dark:bg-dark-800 rounded-xl shadow-sm border border-gray-100 dark:border-dark-700 overflow-hidden">
              {/* Course Banner */}
              <>
                {trainingDetails && (
                  <div className="bg-[#050A1F] text-white rounded-xl shadow-sm border border-gray-100 dark:border-dark-700 overflow-hidden flex relative">
                    {/* Left Side: Title & Description */}
                    <div className="w-1/2 p-8 flex flex-col justify-center relative z-10">
                      <h1 className="text-3xl font-semibold mb-4">
                        {trainingDetails.title}
                      </h1>
                      <div className="text-gray-300 leading-relaxed">
                        {parsedDescription}
                      </div>
                    </div>

                    {/* Right Side: Image */}
                    <div className="relative w-1/2 h-96">
                      <img
                        src={trainingDetails.imgUrl}
                        alt={trainingDetails.title}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    {/* Middle Dark Blue Gradient Film */}
                    <div className="absolute inset-y-0 left-1/2 w-1/6 bg-gradient-to-r from-[#080b19] via-[#050A1Fac] to-transparent"></div>
                  </div>
                )}
              </>

              {/* Course Chapters */}
              <div className="p-8 space-y-8">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                    Course Content
                  </h2>
                  <div className="space-y-4">
                    {trainingDetails.chapters.map((chapter: Chapter) => (
                      <div key={chapter._id} className="space-y-2">
                        <div
                          className="bg-gray-50 dark:bg-dark-700 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-600 transition cursor-pointer overflow-hidden"
                          onClick={() => handleChapterSelect(chapter._id)}
                        >
                          <div className="p-4 flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                              {chapter.isCompleted === true ? (
                                <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                              ) : chapter.isCompleted === false ? (
                                <PlayCircle className="w-5 h-5 text-blue-500 flex-shrink-0" />
                              ) : (
                                <Clock className="w-5 h-5 text-gray-400 flex-shrink-0" />
                              )}
                              <div>
                                <h3 className="font-medium text-gray-900 dark:text-white">
                                  {chapter.title}
                                </h3>
                                <div className="text-sm text-gray-600 dark:text-gray-300 mt-1 line-clamp-2">
                                  {parse(
                                    DOMPurify.sanitize(chapter.description),
                                  )}
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center space-x-4 ml-4">
                              <span className="text-sm text-gray-500 dark:text-gray-400 whitespace-nowrap">
                                {chapter.duration}
                              </span>

                              {chapter.isCompleted === true && (
                                <span className="px-2.5 py-1 bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 rounded-full text-xs font-medium whitespace-nowrap">
                                  Completed
                                </span>
                              )}
                              {chapter.isCompleted === false && (
                                <span className="px-2.5 py-1 bg-green-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 rounded-full text-xs font-medium whitespace-nowrap">
                                  Pending
                                </span>
                              )}
                              <div className="w-3">
                                {" "}
                                {chapter.subChapters &&
                                  chapter.subChapters.length > 0 && (
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        toggleChapterExpansion(chapter._id);
                                      }}
                                      className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                                    >
                                      <ChevronRight
                                        className={`w-5 h-5 transition-transform ${
                                          isChapterExpanded(chapter._id)
                                            ? "transform rotate-90"
                                            : ""
                                        }`}
                                      />
                                    </button>
                                  )}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Render subchapters if they exist */}
                        {chapter.subChapters &&
                          chapter.subChapters.length > 0 &&
                          isChapterExpanded(chapter._id) && (
                            <div className="ml-12 space-y-2">
                              {chapter.subChapters.map((subChapter) => (
                                <div
                                  key={subChapter._id}
                                  className="bg-gray-50 dark:bg-dark-700 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-600 transition cursor-pointer overflow-hidden"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleChapterSelect(chapter._id);
                                    handleSubChapterSelect(subChapter);
                                  }}
                                >
                                  <div className="p-4 flex items-center justify-between">
                                    <div className="flex items-center space-x-4">
                                      <PlayCircle className="w-5 h-5 text-blue-300 flex-shrink-0" />
                                      <div>
                                        <h3 className="font-medium text-gray-900 dark:text-white">
                                          {subChapter.title}
                                        </h3>
                                        <div className="text-sm text-gray-600 dark:text-gray-300 mt-1 line-clamp-2">
                                          {subChapter.description}
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      ) : (
        <>
          {questionPanel === "content" ? (
            <>
              <div className="">
                {selectedSubChapter ? (
                  <ChapterContent
                    layout={mapTemplateNameToId(
                      selectedChapter?.template || "layout1",
                    )}
                    title={selectedSubChapter.title}
                    content={selectedSubChapter.description}
                    image={selectedSubChapter.content.imgUrl}
                    audio={selectedSubChapter.content.audioUrl}
                  />
                ) : selectedChapter ? (
                  <ChapterContent
                    layout={mapTemplateNameToId(
                      selectedChapter.template || "layout1",
                    )}
                    title={selectedChapter.title}
                    content={selectedChapter.description}
                    image={selectedChapter.content.imgUrl}
                    audio={selectedChapter.content.audioUrl}
                  />
                ) : (
                  <div className="w-1/2 p-8 border-r border-gray-100 dark:border-dark-700 overflow-y-auto bg-white dark:bg-dark-800 rounded-xl shadow-sm">
                    <p className="text-gray-500 dark:text-gray-300">
                      Loading chapter content...
                    </p>
                  </div>
                )}

                <div className=" flex flex-col rounded-r-xl">
                  <div className="p-4 bg-gray-50 dark:bg-dark-700 border-t border-gray-100 dark:border-dark-700 overflow-hidden rounded-br-xl rounded-bl-xl">
                    <div className="flex justify-between items-center">
                      <button
                        onClick={() => {
                          if (selectedSubChapter) {
                            const prevSubChapter = getPreviousSubChapter();
                            if (prevSubChapter) {
                              handleSubChapterSelect(prevSubChapter);
                            } else {
                              // No previous subchapter, go back to chapter
                              setSelectedSubChapter(null);
                            }
                          } else {
                            getPreviousChapter() &&
                              handleChapterSelect(
                                getPreviousChapter()?._id || "",
                              );
                          }
                        }}
                        disabled={
                          selectedSubChapter
                            ? !getPreviousSubChapter()
                            : !getPreviousChapter()
                        }
                        className={`flex items-center space-x-2 ${
                          selectedSubChapter
                            ? !getPreviousSubChapter()
                              ? "text-gray-300"
                              : "text-gray-500 dark:text-gray-300"
                            : !getPreviousChapter()
                              ? "text-gray-300"
                              : "text-gray-500 dark:text-gray-300"
                        }`}
                      >
                        <ChevronLeft className="w-5 h-5" />
                        <span>
                          Previous{" "}
                          {selectedSubChapter ? "Subchapter" : "Chapter"}
                        </span>
                      </button>
                      {selectedSubChapter ? (
                        <>
                          {getNextSubChapter() ? (
                            <button
                              onClick={() =>
                                getNextSubChapter() &&
                                handleSubChapterSelect(getNextSubChapter()!)
                              }
                              disabled={!getNextSubChapter()}
                              className={`flex items-center space-x-2 ${
                                !getNextSubChapter()
                                  ? "text-gray-300"
                                  : "text-gray-500 dark:text-gray-300"
                              }`}
                            >
                              <span>Next Subchapter</span>
                              <ChevronNextIcon className="w-5 h-5" />
                            </button>
                          ) : (
                            <>
                              {getNextChapter() ? (
                                <button
                                  onClick={() =>
                                    getNextChapter() &&
                                    handleChapterSelect(
                                      getNextChapter()?._id || "",
                                    )
                                  }
                                  className="flex items-center space-x-2 text-gray-500 dark:text-gray-300"
                                >
                                  <span>Next Chapter</span>
                                  <ChevronNextIcon className="w-5 h-5" />
                                </button>
                              ) : (
                                <motion.button
                                  onClick={() =>
                                    fetchQuestion(nextItem?.data || "")
                                  }
                                  whileHover={{ rotate: [0, 11, -11, 0] }}
                                  whileTap={{ scale: 0.9 }}
                                  className="relative flex items-center space-x-2 px-6 py-2 rounded-lg text-white bg-blue-500 hover:bg-blue-600 transition-all shadow-lg"
                                >
                                  <span>Start Quiz</span>
                                </motion.button>
                              )}
                            </>
                          )}
                        </>
                      ) : (
                        <>
                          {selectedChapter?.subChapters &&
                          selectedChapter.subChapters.length > 0 ? (
                            <button
                              onClick={() =>
                                handleSubChapterSelect(
                                  selectedChapter.subChapters![0],
                                )
                              }
                              className="flex items-center space-x-2 text-gray-500 dark:text-gray-300"
                            >
                              <span>Start Subchapter</span>
                              <ChevronNextIcon className="w-5 h-5" />
                            </button>
                          ) : (
                            <>
                              {getNextChapter() ? (
                                <button
                                  onClick={() =>
                                    getNextChapter() &&
                                    handleChapterSelect(
                                      getNextChapter()?._id || "",
                                    )
                                  }
                                  className="flex items-center space-x-2 text-gray-500 dark:text-gray-300"
                                >
                                  <span>Next Chapter</span>
                                  <ChevronNextIcon className="w-5 h-5" />
                                </button>
                              ) : (
                                <motion.button
                                  onClick={() =>
                                    fetchQuestion(nextItem?.data || "")
                                  }
                                  whileHover={{ rotate: [0, 11, -11, 0] }}
                                  whileTap={{ scale: 0.9 }}
                                  className="relative flex items-center space-x-2 px-6 py-2 rounded-lg text-white bg-blue-500 hover:bg-blue-600 transition-all shadow-lg"
                                >
                                  <span>Start Quiz</span>
                                </motion.button>
                              )}
                            </>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="p-8 space-y-6">
                <h4 className="text-gray-600 dark:text-gray-300 text-sm font-semibold">
                  {question?.type === "SCQ"
                    ? "Single Choice Question (Select One)"
                    : "Multiple Choice Question (Select Multiple)"}
                </h4>

                {question ? (
                  <h3
                    className="text-lg font-medium text-gray-900 dark:text-white mb-4"
                    dangerouslySetInnerHTML={{ __html: question?.question }}
                  ></h3>
                ) : (
                  <h3 className="text-gray-500 dark:text-gray-300">
                    Loading question...
                  </h3>
                )}
                <ul className="space-y-3">
                  {question?.options.map((option, index) => (
                    <li key={index}>
                      <label
                        className={`flex items-center space-x-4 p-4 border rounded-lg cursor-pointer transition-all duration-200 ${
                          selectedAnswers.includes(option)
                            ? "border-blue-500 bg-blue-50 shadow-md"
                            : "border-gray-300 bg-white dark:bg-dark-700 hover:bg-gray-100 dark:hover:bg-dark-600"
                        }`}
                      >
                        <input
                          type={question?.type === "SCQ" ? "radio" : "checkbox"}
                          name="answer"
                          value={option}
                          checked={selectedAnswers.includes(option)}
                          onChange={() => handleOptionChange(option)}
                          className="hidden"
                        />
                        <span
                          className={`w-6 h-6 flex items-center justify-center border rounded-full text-lg font-bold transition-all ${
                            selectedAnswers.includes(option)
                              ? "bg-blue-500 border-blue-500 text-white"
                              : "border-gray-400 text-gray-400"
                          }`}
                        >
                          {selectedAnswers.includes(option) && "✓"}
                        </span>
                        <span className="text-gray-700  dark:text-gray-500 text-lg font-medium">
                          {option}
                        </span>
                      </label>
                    </li>
                  ))}
                </ul>

                <div className="mt-6 flex justify-between">
                  <button
                    onClick={handlePrevQuestion}
                    disabled={!prevQuestionId}
                    className={`px-5 py-2 rounded-lg transition-all duration-200 ${
                      prevQuestionId
                        ? "bg-gray-200 text-gray-700 hover:bg-gray-300"
                        : "bg-gray-100 text-gray-400 cursor-not-allowed"
                    }`}
                  >
                    <ChevronLeft className="w-5 h-5 inline-block mr-2" />
                    Previous
                  </button>
                  <button
                    onClick={handleAnswerSubmit}
                    className="px-6 py-2 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600 transition-all duration-200"
                  >
                    Submit
                  </button>
                </div>
                {isPopupVisible && (
                  <div
                    onClick={closePopup}
                    className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 transition-opacity duration-300"
                  >
                    {isAnswerCorrect && showConfetti && (
                      <Confetti
                        width={window.innerWidth}
                        height={window.innerHeight}
                      />
                    )}

                    <div
                      onClick={(e) => e.stopPropagation()}
                      className={`bg-white dark:bg-dark-800 p-6 rounded-xl shadow-lg text-center max-w-md w-full relative animate-fadeIn h-30 ${
                        isAnswerCorrect ? "animate-shake" : "animate-shake"
                      }`}
                    >
                      <button
                        onClick={closePopup}
                        className="absolute top-2 right-2 text-gray-500 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100 text-2xl"
                      >
                        ×
                      </button>

                      {isAnswerCorrect ? (
                        <div>
                          <h2 className="text-green-600 font-semibold text-xl ">
                            Correct Answer! 🎉
                          </h2>
                          {isLastQuestion ? (
                            <button
                              onClick={() => navigate("/employee")}
                              className="mt-4 px-5 py-2 bg-green-500 text-white font-semibold rounded-lg hover:bg-green-600 transition"
                            >
                              Go to Dashboard
                            </button>
                          ) : (
                            <button
                              onClick={handleNextQuestionAndClosePopup}
                              className="mt-4 px-5 py-2 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600 transition"
                            >
                              Next Question
                            </button>
                          )}
                        </div>
                      ) : (
                        <div>
                          <XCircle className="text-red-500 text-5xl mx-auto animate-shake" />
                          <h2 className="text-red-600 font-semibold text-xl mt-4">
                            Oops, Wrong Answer!
                          </h2>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
};

export default TrainingDetails;
