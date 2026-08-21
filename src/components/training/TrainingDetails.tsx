import { useState, useEffect, useMemo, useRef } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useParams, Link } from "react-router-dom";
import Confetti from "react-confetti";
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
  Lock,
  Award,
  Download,
  Printer,
  X,
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
  template?: string;
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
  order?: number;
}

type SyllabusRow =
  | { kind: "chapter"; order: number; data: Chapter }
  | { kind: "question"; order: number; data: Question & { title?: string } };

const TrainingDetails = () => {
  const navigate = useNavigate();
  const token = useSelector((state: any) => state.auth.token);
  const user = useSelector((state: any) => state.auth.user);
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
  /** Next node after current question from /api/section (may be chapter or question). */
  const [nextAfterQuestion, setNextAfterQuestion] = useState<{
    itemType: string;
    data: string;
  } | null>(null);

  const [question, setQuestion] = useState<Question | null>(null);
  const [selectedAnswers, setSelectedAnswers] = useState<string[]>([]);
  console.log(selectedAnswers);

  const [nextQuestionId, setNextQuestionId] = useState<string | null>(null);
  const [prevQuestionId, setPrevQuestionId] = useState<string | null>(null);

  const [isPopupVisible, setIsPopupVisible] = useState(false);
  const [showConfetti, setShowConfetti] = useState(true);

  const [isAnswerCorrect, setIsAnswerCorrect] = useState(false);
  /** More quiz or chapter follows; `nextQuestionId` is only set when the next node is a question. */
  const hasMoreQuizOrChapterAfter =
    nextQuestionId != null ||
    nextAfterQuestion?.itemType === "chapter" ||
    nextAfterQuestion?.itemType === "question";
  const isLastQuestion = !hasMoreQuizOrChapterAfter;

  const [parsedDescription, setParsedDescription] = useState("");

  // Video mode state
  const videoRef = useRef<HTMLVideoElement>(null);
  const [watchedPercent, setWatchedPercent] = useState(0);
  const [videoQuizUnlocked, setVideoQuizUnlocked] = useState(false);
  const [videoExpanded, setVideoExpanded] = useState(false);
  const VIDEO_WATCH_THRESHOLD = 80;

  // Certificate state
  const [showCertificate, setShowCertificate] = useState(false);
  const certCanvasRef = useRef<HTMLCanvasElement>(null);

  const drawCertificate = (canvas: HTMLCanvasElement) => {
    const CERT_W = 900;
    const CERT_H = 620;
    const DPR = 2;
    canvas.width = CERT_W * DPR;
    canvas.height = CERT_H * DPR;
    canvas.style.width = `${CERT_W}px`;
    canvas.style.height = `${CERT_H}px`;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.scale(DPR, DPR);
    const W = CERT_W;
    const H = CERT_H;

    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, W, H);
    ctx.strokeStyle = "#1e3a5f";
    ctx.lineWidth = 12;
    ctx.strokeRect(20, 20, W - 40, H - 40);
    ctx.strokeStyle = "#c9a84c";
    ctx.lineWidth = 4;
    ctx.strokeRect(34, 34, W - 68, H - 68);
    [[50,50],[W-50,50],[50,H-50],[W-50,H-50]].forEach(([cx,cy]) => {
      ctx.beginPath(); ctx.arc(cx, cy, 8, 0, Math.PI*2); ctx.fillStyle="#c9a84c"; ctx.fill();
    });
    const grad = ctx.createLinearGradient(0, 60, 0, 160);
    grad.addColorStop(0, "#1e3a5f"); grad.addColorStop(1, "#2d5a8e");
    ctx.fillStyle = grad; ctx.fillRect(34, 60, W - 68, 100);
    ctx.fillStyle = "#ffffff"; ctx.font = "bold 38px Georgia, serif"; ctx.textAlign = "center";
    ctx.fillText("CERTIFICATE OF COMPLETION", W/2, 122);
    ctx.strokeStyle = "#c9a84c"; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(80, 170); ctx.lineTo(W-80, 170); ctx.stroke();
    ctx.fillStyle = "#555555"; ctx.font = "italic 22px Georgia, serif";
    ctx.fillText("This is to certify that", W/2, 220);
    const recipientName = user?.username || "Employee";
    ctx.fillStyle = "#1e3a5f"; ctx.font = "bold 42px Georgia, serif";
    ctx.fillText(recipientName, W/2, 280);
    const nw = ctx.measureText(recipientName).width;
    ctx.strokeStyle = "#c9a84c"; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(W/2-nw/2, 292); ctx.lineTo(W/2+nw/2, 292); ctx.stroke();
    ctx.fillStyle = "#555555"; ctx.font = "italic 22px Georgia, serif";
    ctx.fillText("has successfully completed the training module", W/2, 340);
    ctx.fillStyle = "#1e3a5f"; ctx.font = "bold 30px Georgia, serif";
    const title = trainingDetails?.title || "";
    const maxW = W - 160;
    const words = title.split(" ");
    let line = ""; let lineY = 395;
    words.forEach((word: string, i: number) => {
      const test = line + word + " ";
      if (ctx.measureText(test).width > maxW && i > 0) { ctx.fillText(line.trim(), W/2, lineY); line = word+" "; lineY+=40; } else { line=test; }
    });
    ctx.fillText(line.trim(), W/2, lineY);
    const date = new Date().toLocaleDateString("en-US", { year:"numeric", month:"long", day:"numeric" });
    ctx.fillStyle = "#777777"; ctx.font = "18px Georgia, serif";
    ctx.fillText(`Completed on: ${date}`, W/2, lineY+60);
    ctx.strokeStyle = "#c9a84c"; ctx.lineWidth = 1; ctx.setLineDash([6,4]);
    ctx.beginPath(); ctx.moveTo(80, lineY+90); ctx.lineTo(W-80, lineY+90); ctx.stroke(); ctx.setLineDash([]);
    const sigY = H - 110;
    ctx.strokeStyle = "#333333"; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(W/2-120, sigY); ctx.lineTo(W/2+120, sigY); ctx.stroke();
    ctx.fillStyle = "#333333"; ctx.font = "16px Georgia, serif";
    ctx.fillText("Authorized Signature", W/2, sigY+22);
    ctx.beginPath(); ctx.arc(W-130, H-120, 55, 0, Math.PI*2); ctx.strokeStyle="#c9a84c"; ctx.lineWidth=3; ctx.stroke();
    ctx.beginPath(); ctx.arc(W-130, H-120, 44, 0, Math.PI*2); ctx.stroke();
    ctx.fillStyle = "#1e3a5f"; ctx.font = "bold 13px Arial, sans-serif";
    ctx.fillText("OFFICIAL", W-130, H-126); ctx.fillText("SEAL", W-130, H-110);
    ctx.fillStyle = "#aaaaaa"; ctx.font = "13px Arial, sans-serif";
    ctx.fillText("Elevatics360 Learning & Development", W/2, H-42);
  };

  const handleOpenCertificate = () => {
    setShowCertificate(true);
    setTimeout(() => { if (certCanvasRef.current) drawCertificate(certCanvasRef.current); }, 0);
  };

  const handleCertDownload = () => {
    const canvas = certCanvasRef.current;
    if (!canvas) return;
    const link = document.createElement("a");
    link.download = `Certificate_${(trainingDetails?.title || "module").replace(/\s+/g, "_")}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  };

  const handleCertPrint = () => {
    const canvas = certCanvasRef.current;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL("image/png");
    const win = window.open("", "_blank");
    if (!win) return;
    win.document.write(`<!DOCTYPE html><html><head><title>Certificate</title><style>@page{size:landscape;margin:0}body{margin:0;display:flex;justify-content:center;align-items:center;min-height:100vh;background:#f3f4f6}img{width:100%;max-width:960px}</style></head><body><img src="${dataUrl}" onload="window.print()"/></body></html>`);
    win.document.close();
  };

  const isVideoMode = trainingDetails?.moduleType === "video";

  const handleVideoTimeUpdate = () => {
    const video = videoRef.current;
    if (!video || !video.duration) return;
    const pct = Math.round((video.currentTime / video.duration) * 100);
    setWatchedPercent(pct);
    if (pct >= VIDEO_WATCH_THRESHOLD && !videoQuizUnlocked) {
      setVideoQuizUnlocked(true);
    }
    // No-quiz video module: show certificate on 100% watch
    if (pct === 100 && isVideoMode && !trainingDetails?.questions?.length && !showCertificate) {
      handleOpenCertificate();
    }
  };

  const handleStartVideoQuiz = () => {
    if (!trainingDetails?.questions?.length) return;
    const firstQuestion = trainingDetails.questions[0];
    setActiveTab("content");
    setQuestionPanel("overview");
    setSelectedChapter(null);
    setSelectedSubChapter(null);
    fetchQuestion(firstQuestion._id);
  };

  const syllabusItems = useMemo((): SyllabusRow[] => {
    if (!trainingDetails) return [];
    const chapters: Chapter[] = trainingDetails.chapters || [];
    const questions: (Question & { title?: string; order?: number })[] =
      trainingDetails.questions || [];
    const rows: SyllabusRow[] = [
      ...chapters.map((c) => ({
        kind: "chapter" as const,
        order: typeof c.order === "number" ? c.order : 9999,
        data: c,
      })),
      ...questions.map((q) => ({
        kind: "question" as const,
        order: typeof q.order === "number" ? q.order : 9999,
        data: q,
      })),
    ];
    return rows.sort((a, b) => {
      if (a.order !== b.order) return a.order - b.order;
      if (a.kind === b.kind) return 0;
      return a.kind === "chapter" ? -1 : 1;
    });
  }, [trainingDetails]);

  const openQuestionFromSyllabus = (questionId: string) => {
    setActiveTab("content");
    setQuestionPanel("overview");
    setSelectedSubChapter(null);
    setSelectedChapter(null);
    fetchQuestion(questionId);
  };

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
      .get(`${import.meta.env.VITE_API_BASE_URL}/api/module/${id}/employee`, {
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
        `${import.meta.env.VITE_API_BASE_URL}/api/section?id=${chapterId}&type=chapter`,
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
        `${import.meta.env.VITE_API_BASE_URL}/api/section?id=${selectedChapter._id}&type=chapter&subchapterOrder=${subChapter.order}`,
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
        `${import.meta.env.VITE_API_BASE_URL}/api/section?id=${questionId}&type=question`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      )
      .then((response) => {
        const ni = response.data.nextItem;
        setNextAfterQuestion(ni || null);
        setQuestion(response.data.currentItem);
        setNextQuestionId(ni?.itemType === "question" ? ni.data : null);
        setPrevQuestionId(response.data.prevItem?.data || null);
        setQuestionPanel("overview");
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
        `${import.meta.env.VITE_API_BASE_URL}/api/chapter-complete`,
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
    setSelectedAnswers([]);

    if (nextQuestionId) {
      fetchQuestion(nextQuestionId);
      return;
    }
    if (nextAfterQuestion?.itemType === "chapter") {
      setQuestionPanel("content");
      handleChapterSelect(String(nextAfterQuestion.data));
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
    // Show feedback immediately (even if API fails),
    // but do not auto-advance on wrong answers.
    const localIsCorrect =
      selectedAnswers.length === question.answer.length &&
      selectedAnswers.every((ans) => question.answer.includes(ans));
    setIsAnswerCorrect(localIsCorrect);
    setIsPopupVisible(true);

    if (localIsCorrect) {
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 3000);
    }

    // Post the selected answer to check if it's correct
    axios
      .post(
        `${import.meta.env.VITE_API_BASE_URL}/api/question-complete`,
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
        // Some backends only mark completion and don't return correctness.
        // Only trust the server if it explicitly returns a boolean `correct`.
        const serverCorrect = response?.data?.correct;
        if (
          typeof serverCorrect === "boolean" &&
          serverCorrect !== localIsCorrect
        ) {
          setIsAnswerCorrect(serverCorrect);
          if (serverCorrect) {
            setShowConfetti(true);
            setTimeout(() => setShowConfetti(false), 3000);
          } else {
            setShowConfetti(false);
          }
        }
      })
      .catch((error) => {
        console.error("Error submitting answer:", error);
        // Keep the popup based on local result; no navigation.
      });
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

  /** Prefer section API order (quiz between chapters); fallback to next in chapter list. */
  const goToNextAfterChapterContent = () => {
    if (nextItem?.itemType === "question") {
      setActiveTab("content");
      setQuestionPanel("overview");
      fetchQuestion(String(nextItem.data));
      return;
    }
    if (nextItem?.itemType === "chapter") {
      handleChapterSelect(String(nextItem.data));
      return;
    }
    const nc = getNextChapter();
    if (nc) {
      handleChapterSelect(nc._id);
      return;
    }
    if (nextItem?.data) {
      setActiveTab("content");
      setQuestionPanel("overview");
      fetchQuestion(String(nextItem.data));
    }
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

      {/* ── VIDEO MODE ─────────────────────────────────────────────────── */}
      {isVideoMode && activeTab !== "content" ? (
        <div className="space-y-6">
          {/* Module header */}
          {trainingDetails && (
            <div className="bg-[#050A1F] text-white rounded-xl overflow-hidden flex relative">
              <div className="w-1/2 p-8 flex flex-col justify-center relative z-10">
                <h1 className="text-3xl font-semibold mb-4">{trainingDetails.title}</h1>
                <div className="text-gray-300 leading-relaxed">{parsedDescription}</div>
              </div>
              <div className="relative w-1/2 h-64">
                <img
                  src={trainingDetails.imgUrl}
                  alt={trainingDetails.title}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute inset-y-0 left-1/2 w-1/6 bg-gradient-to-r from-[#080b19] via-[#050A1Fac] to-transparent" />
            </div>
          )}

          {/* Course Content list */}
          <div className="p-8 space-y-4">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Course Content</h2>

            {/* Video row — click opens full player */}
            <div
              className="bg-gray-50 dark:bg-dark-700 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-600 transition cursor-pointer overflow-hidden"
              onClick={() => trainingDetails?.videoUrl && setActiveTab("content")}
            >
              <div className="p-4 flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <PlayCircle className="w-5 h-5 text-blue-500 flex-shrink-0" />
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-white">{trainingDetails?.title}</h3>
                    {trainingDetails?.description && (
                      <p className="text-sm text-gray-600 dark:text-gray-300 mt-1 line-clamp-2">
                        {trainingDetails.description.replace(/<[^>]*>/g, '')}
                      </p>
                    )}
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0 ml-4" />
              </div>
            </div>

            {/* Quiz rows */}
            {trainingDetails?.questions?.map((quiz: any, index: number) => (
              <div
                key={quiz._id || index}
                className={`rounded-lg overflow-hidden border transition ${
                  videoQuizUnlocked
                    ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-200/80 dark:border-amber-800 hover:bg-amber-100 dark:hover:bg-amber-900/30 cursor-pointer'
                    : 'bg-gray-50 dark:bg-dark-700 border-gray-200 dark:border-dark-600 cursor-not-allowed opacity-60'
                }`}
                onClick={() => {
                  if (videoQuizUnlocked) {
                    setActiveTab("content");
                    setQuestionPanel("overview");
                    setSelectedChapter(null);
                    setSelectedSubChapter(null);
                    fetchQuestion(quiz._id);
                  }
                }}
              >
                <div className="p-4 flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    {videoQuizUnlocked
                      ? <PlayCircle className="w-5 h-5 text-amber-600 flex-shrink-0" />
                      : <Lock className="w-5 h-5 text-gray-400 flex-shrink-0" />
                    }
                    <div>
                      <h3 className="font-medium text-gray-900 dark:text-white">
                        Quiz: {quiz.title || `Question ${index + 1}`}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                        {videoQuizUnlocked ? 'Tap to open this quiz' : `Unlocks after watching ${VIDEO_WATCH_THRESHOLD}% of the video`}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : isVideoMode && activeTab === "content" && !question ? (
        /* Video mode — full-width player */
        <div className="space-y-4">
          <button
            onClick={() => setActiveTab("overview")}
            className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-800 dark:hover:text-white"
          >
            <ChevronLeft className="w-4 h-4" /> Back
          </button>
          <div className="bg-white dark:bg-dark-800 rounded-xl shadow-sm border border-gray-100 dark:border-dark-700 overflow-hidden">
            <video
              ref={videoRef}
              src={trainingDetails?.videoUrl}
              controls
              controlsList="nodownload"
              onTimeUpdate={handleVideoTimeUpdate}
              className="w-full bg-black"
            />
            <div className="px-6 py-4 space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500 dark:text-gray-400">Watch progress</span>
                <span className={`font-medium ${videoQuizUnlocked ? "text-green-600" : "text-blue-600"}`}>
                  {watchedPercent}% watched
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-dark-700 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all duration-300 ${videoQuizUnlocked ? "bg-green-500" : "bg-blue-600"}`}
                  style={{ width: `${watchedPercent}%` }}
                />
              </div>
              {!videoQuizUnlocked && (
                <p className="text-xs text-gray-400 dark:text-gray-500">
                  Watch at least {VIDEO_WATCH_THRESHOLD}% to unlock the quiz
                </p>
              )}
            </div>
            {trainingDetails?.questions?.length > 0 && (
              <div className="px-6 pb-6">
                {videoQuizUnlocked ? (
                  <button
                    onClick={handleStartVideoQuiz}
                    className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition flex items-center justify-center gap-2"
                  >
                    <PlayCircle className="w-5 h-5" />
                    Start Quiz
                  </button>
                ) : (
                  <button
                    disabled
                    className="w-full py-3 bg-gray-200 dark:bg-dark-700 text-gray-400 dark:text-gray-500 font-semibold rounded-lg flex items-center justify-center gap-2 cursor-not-allowed"
                  >
                    <Lock className="w-4 h-4" />
                    Quiz unlocks at {VIDEO_WATCH_THRESHOLD}% watched
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      ) : isVideoMode && activeTab === "content" ? (
        /* Video mode quiz panel — reuses the same question UI */
        <>
          <button
            onClick={() => {
              setQuestion(null);
            }}
            className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-800 dark:hover:text-white mb-2"
          >
            <ChevronLeft className="w-4 h-4" /> Back to video
          </button>
          <div className="p-8 space-y-6 bg-white dark:bg-dark-800 rounded-xl shadow-sm">
            <h4 className="text-gray-600 dark:text-gray-300 text-sm font-semibold">
              {question?.type === "SCQ"
                ? "Single Choice Question (Select One)"
                : "Multiple Choice Question (Select Multiple)"}
            </h4>
            {question ? (
              <h3
                className="text-lg font-medium text-gray-900 dark:text-white mb-4"
                dangerouslySetInnerHTML={{ __html: question.question }}
              />
            ) : (
              <h3 className="text-gray-500 dark:text-gray-300">Loading question...</h3>
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
                    <span className="text-gray-700 dark:text-gray-500 text-lg font-medium">{option}</span>
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
                className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
              >
                {isAnswerCorrect && showConfetti && (
                  <Confetti width={window.innerWidth} height={window.innerHeight} />
                )}
                <div
                  onClick={(e) => e.stopPropagation()}
                  className="bg-white dark:bg-dark-800 p-6 rounded-xl shadow-lg text-center max-w-md w-full relative animate-fadeIn"
                >
                  <button
                    onClick={closePopup}
                    className="absolute top-2 right-2 text-gray-500 dark:text-gray-300 hover:text-gray-800 text-2xl"
                  >
                    ×
                  </button>
                  {isAnswerCorrect ? (
                    <div>
                      <h2 className="text-green-600 font-semibold text-xl">Correct Answer! 🎉</h2>
                      {isLastQuestion ? (
                        <button
                          onClick={() => { setIsPopupVisible(false); handleOpenCertificate(); }}
                          className="mt-4 px-5 py-2 bg-yellow-500 hover:bg-yellow-600 text-white font-semibold rounded-lg transition flex items-center gap-2 mx-auto"
                        >
                          <Award className="w-4 h-4" />
                          View My Certificate
                        </button>
                      ) : (
                        <button
                          onClick={handleNextQuestionAndClosePopup}
                          className="mt-4 px-5 py-2 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600 transition"
                        >
                          Next question
                        </button>
                      )}
                    </div>
                  ) : (
                    <div>
                      <XCircle className="text-red-500 text-5xl mx-auto animate-shake" />
                      <h2 className="text-red-600 font-semibold text-xl mt-4">Oops, Wrong Answer!</h2>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </>
      ) : activeTab === "overview" ? (
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
                    {syllabusItems.map((item) =>
                      item.kind === "question" ? (
                        <div key={`q-${item.data._id}`} className="space-y-2">
                          <div
                            className="bg-amber-50 dark:bg-amber-950/40 rounded-lg hover:bg-amber-100 dark:hover:bg-amber-900/30 transition cursor-pointer overflow-hidden border border-amber-200/80 dark:border-amber-800"
                            onClick={() =>
                              openQuestionFromSyllabus(item.data._id)
                            }
                          >
                            <div className="p-4 flex items-center justify-between">
                              <div className="flex items-center space-x-4">
                                <PlayCircle className="w-5 h-5 text-amber-600 flex-shrink-0" />
                                <div>
                                  <h3 className="font-medium text-gray-900 dark:text-white">
                                    Quiz:{" "}
                                    {(item.data as { title?: string }).title ||
                                      "Question"}
                                  </h3>
                                  <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                                    Tap to open this quiz step
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div key={item.data._id} className="space-y-2">
                          <div
                            className="bg-gray-50 dark:bg-dark-700 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-600 transition cursor-pointer overflow-hidden"
                            onClick={() => handleChapterSelect(item.data._id)}
                          >
                            <div className="p-4 flex items-center justify-between">
                              <div className="flex items-center space-x-4">
                                {item.data.isCompleted === true ? (
                                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                                ) : item.data.isCompleted === false ? (
                                  <PlayCircle className="w-5 h-5 text-blue-500 flex-shrink-0" />
                                ) : (
                                  <Clock className="w-5 h-5 text-gray-400 flex-shrink-0" />
                                )}
                                <div>
                                  <h3 className="font-medium text-gray-900 dark:text-white">
                                    {item.data.title}
                                  </h3>
                                  <div className="text-sm text-gray-600 dark:text-gray-300 mt-1 line-clamp-2">
                                    {parse(
                                      DOMPurify.sanitize(item.data.description),
                                    )}
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center space-x-4 ml-4">
                                <span className="text-sm text-gray-500 dark:text-gray-400 whitespace-nowrap">
                                  {item.data.duration}
                                </span>

                                {item.data.isCompleted === true && (
                                  <span className="px-2.5 py-1 bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 rounded-full text-xs font-medium whitespace-nowrap">
                                    Completed
                                  </span>
                                )}
                                {item.data.isCompleted === false && (
                                  <span className="px-2.5 py-1 bg-green-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 rounded-full text-xs font-medium whitespace-nowrap">
                                    Pending
                                  </span>
                                )}
                                <div className="w-3">
                                  {" "}
                                  {item.data.subChapters &&
                                    item.data.subChapters.length > 0 && (
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          toggleChapterExpansion(item.data._id);
                                        }}
                                        className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                                      >
                                        <ChevronRight
                                          className={`w-5 h-5 transition-transform ${
                                            isChapterExpanded(item.data._id)
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
                          {item.data.subChapters &&
                            item.data.subChapters.length > 0 &&
                            isChapterExpanded(item.data._id) && (
                              <div className="ml-12 space-y-2">
                                {item.data.subChapters.map((subChapter) => (
                                  <div
                                    key={subChapter._id}
                                    className="bg-gray-50 dark:bg-dark-700 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-600 transition cursor-pointer overflow-hidden"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleChapterSelect(item.data._id);
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
                      ),
                    )}
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
                      selectedSubChapter.template ||
                        selectedChapter?.template ||
                        "layout1",
                    )}
                    title={selectedSubChapter.title}
                    content={selectedSubChapter.description}
                    image={selectedSubChapter.content.imgUrl}
                    audio={selectedSubChapter.content.audioUrl}
                    video={selectedSubChapter.content.videoUrl}
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
                    video={selectedChapter.content.videoUrl}
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
                              {nextItem?.itemType === "question" ||
                              getNextChapter() ||
                              nextItem?.data ? (
                                <button
                                  type="button"
                                  onClick={goToNextAfterChapterContent}
                                  className="flex items-center space-x-2 px-4 py-2 rounded-lg text-white bg-blue-500 hover:bg-blue-600 text-gray-500 dark:text-gray-100"
                                >
                                  <span>
                                    {nextItem?.itemType === "question"
                                      ? "Next: Quiz"
                                      : getNextChapter()
                                        ? "Next Chapter"
                                        : "Continue"}
                                  </span>
                                  <ChevronNextIcon className="w-5 h-5" />
                                </button>
                              ) : null}
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
                              {nextItem?.itemType === "question" ||
                              getNextChapter() ||
                              nextItem?.data ? (
                                <button
                                  type="button"
                                  onClick={goToNextAfterChapterContent}
                                  className="flex items-center space-x-2 px-4 py-2 rounded-lg text-white bg-blue-500 hover:bg-blue-600"
                                >
                                  <span>
                                    {nextItem?.itemType === "question"
                                      ? "Next: Quiz"
                                      : getNextChapter()
                                        ? "Next Chapter"
                                        : "Continue"}
                                  </span>
                                  <ChevronNextIcon className="w-5 h-5" />
                                </button>
                              ) : null}
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
                              onClick={() => { setIsPopupVisible(false); handleOpenCertificate(); }}
                              className="mt-4 px-5 py-2 bg-yellow-500 hover:bg-yellow-600 text-white font-semibold rounded-lg transition flex items-center gap-2 mx-auto"
                            >
                              <Award className="w-4 h-4" />
                              View My Certificate
                            </button>
                          ) : (
                            <button
                              onClick={handleNextQuestionAndClosePopup}
                              className="mt-4 px-5 py-2 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600 transition"
                            >
                              {nextAfterQuestion?.itemType === "chapter"
                                ? "Continue to next chapter"
                                : "Next question"}
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
      {/* ── CERTIFICATE MODAL ─────────────────────────────────────────── */}
      {showCertificate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white dark:bg-dark-800 rounded-2xl shadow-2xl w-full max-w-4xl flex flex-col my-auto">
            {/* Toolbar */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-dark-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <Award className="w-5 h-5 text-yellow-500" />
                Certificate of Completion
              </h2>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleCertPrint}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-lg border border-gray-200 dark:border-dark-600 hover:bg-gray-50 dark:hover:bg-dark-700 text-gray-700 dark:text-gray-300 text-sm font-medium transition"
                >
                  <Printer className="w-4 h-4" />
                  Print
                </button>
                <button
                  onClick={handleCertDownload}
                  className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition"
                >
                  <Download className="w-4 h-4" />
                  Download PNG
                </button>
                <button
                  onClick={() => { setShowCertificate(false); navigate("/employee"); }}
                  className="ml-1 px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 dark:bg-dark-700 dark:hover:bg-dark-600 text-gray-600 dark:text-gray-300 text-sm font-medium transition"
                >
                  Go to Dashboard
                </button>
                <button
                  onClick={() => setShowCertificate(false)}
                  className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-700 transition"
                >
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              </div>
            </div>
            {/* Canvas Preview */}
            <div className="w-full bg-gray-100 dark:bg-dark-900 flex items-center justify-center p-6 rounded-b-2xl overflow-x-auto">
              <canvas ref={certCanvasRef} className="rounded-lg shadow-xl block" style={{ maxWidth: "100%" }} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TrainingDetails;
