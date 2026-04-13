import React, { useState, useEffect, useRef } from "react";
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
import CurriculumOrderEditor from "./CurriculumOrderEditor";
import {
  buildSequenceFromApi,
  chapterKey,
  quizKey,
  reconcileSequence,
  type CurriculumStep,
} from "../../utils/curriculumOrder";

const INSTRUCTOR_COURSE_DRAFT_PREFIX = "instructorCourseDraft:v1:";

type InstructorCourseDraft = {
  baselineUpdatedAt: string;
  chapters: Record<string, unknown>[];
  curriculumSequence: CurriculumStep[];
  lastEditedChapterTitle?: string;
  lastEditedChapterAt?: string;
};

function readInstructorCourseDraft(
  moduleId: string,
): InstructorCourseDraft | null {
  try {
    const raw = localStorage.getItem(`${INSTRUCTOR_COURSE_DRAFT_PREFIX}${moduleId}`);
    if (!raw) return null;
    const d = JSON.parse(raw);
    if (!d || typeof d.baselineUpdatedAt !== "string" || !Array.isArray(d.chapters)) {
      return null;
    }
    if (!Array.isArray(d.curriculumSequence)) {
      (d as InstructorCourseDraft).curriculumSequence = [];
    }
    return d as InstructorCourseDraft;
  } catch {
    return null;
  }
}

function writeInstructorCourseDraft(
  moduleId: string,
  next: {
    baselineUpdatedAt: string;
    chapters: Record<string, unknown>[];
    curriculumSequence: CurriculumStep[];
    lastEditedChapterTitle?: string;
    lastEditedChapterAt?: string;
  },
) {
  const prev = readInstructorCourseDraft(moduleId);
  const merged: InstructorCourseDraft = {
    baselineUpdatedAt: next.baselineUpdatedAt,
    chapters: next.chapters,
    curriculumSequence: next.curriculumSequence,
    lastEditedChapterTitle:
      next.lastEditedChapterTitle ?? prev?.lastEditedChapterTitle,
    lastEditedChapterAt:
      next.lastEditedChapterAt ?? prev?.lastEditedChapterAt,
  };
  localStorage.setItem(
    `${INSTRUCTOR_COURSE_DRAFT_PREFIX}${moduleId}`,
    JSON.stringify(merged),
  );
}

function clearInstructorCourseDraft(moduleId: string) {
  localStorage.removeItem(`${INSTRUCTOR_COURSE_DRAFT_PREFIX}${moduleId}`);
}

function moduleBaselineIso(module: { updatedAt?: string | Date }): string {
  if (module.updatedAt == null) return "";
  try {
    return new Date(module.updatedAt).toISOString();
  } catch {
    return "";
  }
}

type CourseDataState = {
  basicInfo: {
    title: string;
    description: string;
    image: string;
    category: string;
    isMandatory: boolean;
  };
  chapters: Record<string, unknown>[];
  quizzes: Record<string, unknown>[];
};

function buildModulePayload(
  courseData: CourseDataState,
  seq: CurriculumStep[],
): Record<string, unknown> {
  const chapterOrders = new Map<string, number>();
  const quizOrders = new Map<string, number>();
  let ord = 1;
  for (const step of seq) {
    if (step.type === "chapter") chapterOrders.set(step.key, ord++);
    else quizOrders.set(step.key, ord++);
  }
  for (const ch of courseData.chapters) {
    const k = chapterKey(ch);
    if (k && !chapterOrders.has(k)) chapterOrders.set(k, ord++);
  }
  for (const q of courseData.quizzes) {
    const k = quizKey(q);
    if (k && !quizOrders.has(k)) quizOrders.set(k, ord++);
  }

  const moduleData: Record<string, unknown> = {
    title: courseData.basicInfo.title,
    description: DOMPurify.sanitize(courseData.basicInfo.description, {
      ALLOWED_TAGS: [],
    }),
    category: courseData.basicInfo.category,
    imgUrl: courseData.basicInfo.image,
    chapters: courseData.chapters.map((chapter: Record<string, any>) => ({
      ...(chapter._id ? { _id: chapter._id } : {}),
      title: chapter.title,
      description: chapter.description,
      order: chapterOrders.get(chapterKey(chapter)) ?? 999,
      template: chapter.layout ? chapter.layout : chapter.template,
      content: {
        imgUrl: chapter.content?.imgUrl || chapter.image || "",
        audioUrl: chapter.content?.audioUrl || chapter.audio || "",
        videoUrl: chapter.content?.videoUrl || "",
      },
      subChapters:
        (chapter.subChapters as any[])?.map((subChapter: any, subChapterIndex: number) => ({
          ...(subChapter._id ? { _id: subChapter._id } : {}),
          title: subChapter.title,
          description: DOMPurify.sanitize(
            String(subChapter.description ?? ""),
            {
              ALLOWED_TAGS: [],
            },
          ),
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
    questions: courseData.quizzes.map((quiz: Record<string, any>) => ({
      ...(quiz._id ? { _id: quiz._id } : {}),
      title: quiz.title || "Test title",
      question: quiz.question,
      options: quiz.options,
      type: quiz.type,
      answer: quiz.correctAnswers ? quiz.correctAnswers : quiz.answer,
      order: quizOrders.get(quizKey(quiz)) ?? 999,
      template: "chapter-one",
      ...(quiz.sourceChapterKey != null &&
      String(quiz.sourceChapterKey).trim() !== ""
        ? { sourceChapterKey: String(quiz.sourceChapterKey).trim() }
        : {}),
      ...(quiz.sourceChapterTitle != null &&
      String(quiz.sourceChapterTitle).trim() !== ""
        ? { sourceChapterTitle: String(quiz.sourceChapterTitle).trim() }
        : {}),
    })),
    isMandatory: Boolean(courseData.basicInfo.isMandatory),
  };

  return moduleData;
}

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
      isMandatory: false,
    },
    chapters: [] as Record<string, unknown>[],
    quizzes: [] as Record<string, unknown>[],
  });
  const [curriculumSequence, setCurriculumSequence] = useState<CurriculumStep[]>(
    [],
  );
  const chaptersRef = useRef<Record<string, unknown>[]>([]);
  const quizzesRef = useRef<Record<string, unknown>[]>([]);
  chaptersRef.current = courseData.chapters;
  quizzesRef.current = courseData.quizzes;

  const courseDataRef = useRef(courseData);
  const curriculumSequenceRef = useRef(curriculumSequence);
  const moduleBaselineUpdatedAtRef = useRef("");
  courseDataRef.current = courseData;
  curriculumSequenceRef.current = curriculumSequence;

  const [hasUnpublishedChapterDraft, setHasUnpublishedChapterDraft] =
    useState(false);
  const [lastEditedChapterTag, setLastEditedChapterTag] = useState<{
    title?: string;
    at?: string;
  }>({});

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
    } else if (activeTab === "quiz") {
      setActiveTab("order");
    }
  };

  useEffect(() => {
    if (moduleId) {
      setIsEditMode(true);
      const fetchModuleData = async () => {
        try {
          const token = await loginIntsructor();
          const module = await getModuleById(token, moduleId);

          const ch = module.chapters || [];
          const qu = module.questions || [];
          const baseline = moduleBaselineIso(module);
          moduleBaselineUpdatedAtRef.current = baseline;

          const draft = readInstructorCourseDraft(moduleId);
          const draftMatchesServer =
            draft &&
            baseline &&
            draft.baselineUpdatedAt === baseline &&
            Array.isArray(draft.chapters);

          if (draftMatchesServer && draft) {
            setCourseData({
              basicInfo: {
                title: module.title || "",
                description: module.description || "",
                image: module.imgUrl || "",
                category: module.category || "",
                isMandatory: Boolean(module.isMandatory),
              },
              chapters: draft.chapters,
              quizzes: qu,
            });
            setCurriculumSequence(
              draft.curriculumSequence.length > 0
                ? draft.curriculumSequence
                : buildSequenceFromApi(draft.chapters, qu),
            );
            setLastEditedChapterTag({
              title: draft.lastEditedChapterTitle,
              at: draft.lastEditedChapterAt,
            });
            setHasUnpublishedChapterDraft(true);
          } else {
            if (draft && baseline && draft.baselineUpdatedAt !== baseline) {
              clearInstructorCourseDraft(moduleId);
            }
            setCourseData({
              basicInfo: {
                title: module.title || "",
                description: module.description || "",
                image: module.imgUrl || "",
                category: module.category || "",
                isMandatory: Boolean(module.isMandatory),
              },
              chapters: ch,
              quizzes: qu,
            });
            setCurriculumSequence(buildSequenceFromApi(ch, qu));
            setLastEditedChapterTag({});
            setHasUnpublishedChapterDraft(false);
          }
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

  const handleChapterUpdate = (
    chapters: Record<string, unknown>[],
    options?: { lastEditedChapterTitle?: string },
  ) => {
    const prev = courseDataRef.current;
    const quizzes = quizzesRef.current;
    const seq = curriculumSequenceRef.current;
    const nextCourse: CourseDataState = { ...prev, chapters };
    const nextSeq = reconcileSequence(seq, chapters, quizzes);

    setCourseData(nextCourse);
    setCurriculumSequence(nextSeq);
    courseDataRef.current = nextCourse;
    curriculumSequenceRef.current = nextSeq;

    if (!isEditMode || !moduleId || !moduleBaselineUpdatedAtRef.current) return;

    const trimmedTitle = options?.lastEditedChapterTitle?.trim();
    const nowIso = new Date().toISOString();
    writeInstructorCourseDraft(moduleId, {
      baselineUpdatedAt: moduleBaselineUpdatedAtRef.current,
      chapters,
      curriculumSequence: nextSeq,
      ...(trimmedTitle
        ? { lastEditedChapterTitle: trimmedTitle, lastEditedChapterAt: nowIso }
        : {}),
    });
    setHasUnpublishedChapterDraft(true);
    if (trimmedTitle) {
      setLastEditedChapterTag({
        title: trimmedTitle,
        at: nowIso,
      });
    }
  };

  const handleCurriculumSequenceChange = (seq: CurriculumStep[]) => {
    setCurriculumSequence(seq);
    curriculumSequenceRef.current = seq;
    if (!isEditMode || !moduleId || !moduleBaselineUpdatedAtRef.current) return;
    writeInstructorCourseDraft(moduleId, {
      baselineUpdatedAt: moduleBaselineUpdatedAtRef.current,
      chapters: courseDataRef.current.chapters,
      curriculumSequence: seq,
    });
    setHasUnpublishedChapterDraft(true);
  };

  const handleQuizUpdate = (quizzes: Record<string, unknown>[]) => {
    setCourseData((prev) => ({ ...prev, quizzes }));
    setCurriculumSequence((seq) =>
      reconcileSequence(seq, chaptersRef.current, quizzes),
    );
  };

  const handleSaveCourse = async () => {
    setIsLoading(true);
    try {
      const token = await loginIntsructor();
      const seq = reconcileSequence(
        curriculumSequence,
        courseData.chapters,
        courseData.quizzes,
      );
      const moduleData = buildModulePayload(courseData, seq);

      const response = isEditMode
        ? await updateModule(token, moduleId, moduleData)
        : await createModule(token, moduleData);

      if (isEditMode && moduleId) {
        clearInstructorCourseDraft(moduleId);
        setHasUnpublishedChapterDraft(false);
      }

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
        {isEditMode && (
          <div className="mt-3 flex flex-wrap items-center gap-2 text-sm">
            {hasUnpublishedChapterDraft && (
              <span className="inline-flex items-center rounded-full bg-amber-50 dark:bg-amber-950/40 px-3 py-1 text-amber-900 dark:text-amber-100 border border-amber-200 dark:border-amber-800">
                Not live for learners: chapter / order edits stay in this browser
                until you click{" "}
                <span className="mx-0.5 font-semibold">Update Course</span> on
                Course order.
              </span>
            )}
            {lastEditedChapterTag.title && (
              <span
                className="inline-flex items-center rounded-full border border-gray-200 dark:border-dark-600 bg-gray-50 dark:bg-dark-700 px-3 py-1 text-gray-700 dark:text-gray-300"
                title={
                  lastEditedChapterTag.at
                    ? new Date(lastEditedChapterTag.at).toLocaleString()
                    : undefined
                }
              >
                Last updated chapter:{" "}
                <span className="ml-1 font-medium text-gray-900 dark:text-white">
                  {lastEditedChapterTag.title}
                </span>
                {lastEditedChapterTag.at && (
                  <span className="ml-2 text-gray-500 dark:text-gray-400">
                    · {new Date(lastEditedChapterTag.at).toLocaleString()}
                  </span>
                )}
              </span>
            )}
          </div>
        )}
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

              <TabsTrigger
                value="order"
                onClick={() => setActiveTab("order")}
                className={`flex-1 px-6 py-4 text-sm font-medium ${
                  activeTab === "order"
                    ? "text-blue-600 border-b-2 border-blue-600"
                    : "text-gray-500 dark:text-gray-400 hover:text-gray-700 hover:bg-gray-50 dark:hover:bg-dark-700"
                }`}
              >
                Course order
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
                chapters={courseData.chapters}
                onUpdate={handleQuizUpdate}
              />
            </TabsContent>
            <TabsContent value="order">
              <CurriculumOrderEditor
                chapters={courseData.chapters}
                quizzes={courseData.quizzes}
                sequence={curriculumSequence}
                onSequenceChange={handleCurriculumSequenceChange}
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
          {activeTab !== "order" ? (
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
