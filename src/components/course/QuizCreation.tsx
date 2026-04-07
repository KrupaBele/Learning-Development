import React, { useState, useEffect } from 'react';
import { Plus, Trash2, CheckCircle, Sparkles, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { generateQuizQuestionsFromChapters } from '../../utils/aiQuizGenerator';

type QuizCreationProps = {
  quizzes: Record<string, unknown>[];
  chapters?: Record<string, unknown>[];
  onUpdate: (quizzes: Record<string, unknown>[]) => void;
};

const QuizCreation = ({
  quizzes,
  chapters = [],
  onUpdate,
}: QuizCreationProps) => {
  const formattedQuizzes = quizzes.map(quiz => ({
    ...quiz,
    correctAnswers: quiz.correctAnswers || quiz.answer.map(ans => String(ans)), // Convert answer to correctAnswers
  }));

  const [quizList, setQuizList] = useState(formattedQuizzes);

  const [newQuestion, setNewQuestion] = useState({
    title: '',
    question: '',
    options: ['', '', '', ''],
    correctAnswers: [],
    type: 'SCQ'
  });

  const [aiQuestionCount, setAiQuestionCount] = useState(5);
  const [isGeneratingQuiz, setIsGeneratingQuiz] = useState(false);

  const runAiGenerate = async (mode: 'replace' | 'append') => {
    if (!chapters.length) {
      toast.error('Add chapters first — the AI uses chapter text to build questions.');
      return;
    }
    if (
      mode === 'replace' &&
      quizList.length > 0 &&
      !window.confirm(
        'Replace all existing questions with new AI-generated ones? This cannot be undone from here (you can still cancel without saving the course).',
      )
    ) {
      return;
    }
    setIsGeneratingQuiz(true);
    try {
      const generated = await generateQuizQuestionsFromChapters(
        chapters,
        aiQuestionCount,
      );
      const next =
        mode === 'replace'
          ? generated
          : [...quizList, ...generated];
      setQuizList(next);
      onUpdate(next);
      toast.success(
        mode === 'replace'
          ? `Replaced with ${generated.length} AI question(s). Review and edit below.`
          : `Added ${generated.length} AI question(s). You can still add your own.`,
      );
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Generation failed';
      toast.error(msg);
    } finally {
      setIsGeneratingQuiz(false);
    }
  };

  useEffect(() => {
    setQuizList(formattedQuizzes);
  }, [quizzes]);

  const handleAddQuestion = () => {
    if (newQuestion.title && newQuestion.question && newQuestion.options.every(option => option) && newQuestion.correctAnswers.length > 0) {
      const updatedQuizzes = [...quizList, { ...newQuestion, id: Date.now() }];
      setQuizList(updatedQuizzes);
      onUpdate(updatedQuizzes);
      setNewQuestion({
        title: '',
        question: '',
        options: ['', '', '', ''],
        correctAnswers: [],
        type: 'SCQ'
      });
    }
  };

  const handleRemoveQuestion = (id: string | undefined) => {
    const updatedQuizzes = quizList.filter(
      (quiz) => String(quiz._id ?? quiz.id) !== String(id),
    );
    setQuizList(updatedQuizzes);
    onUpdate(updatedQuizzes);
  };

  const handleOptionChange = (index, value) => {
    const newOptions = [...newQuestion.options];
    newOptions[index] = value;
    setNewQuestion({ ...newQuestion, options: newOptions });
  };

  const toggleCorrectAnswer = (index) => {
    const currentAnswers = [...newQuestion.correctAnswers];
    if (newQuestion.type === 'SCQ') {
      setNewQuestion({ ...newQuestion, correctAnswers: [index] });
    } else {
      const answerIndex = currentAnswers.indexOf(index);
      if (answerIndex === -1) {
        currentAnswers.push(index);
      } else {
        currentAnswers.splice(answerIndex, 1);
      }
      setNewQuestion({ ...newQuestion, correctAnswers: currentAnswers });
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-indigo-950/40 dark:to-blue-950/30 border border-indigo-100 dark:border-indigo-900/50 p-6 rounded-lg">
        <div className="flex items-start gap-3 mb-4">
          <Sparkles className="w-5 h-5 text-indigo-600 dark:text-indigo-400 mt-0.5 flex-shrink-0" />
          <div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              Quiz source
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Generate draft questions from your chapter text, or build everything yourself — you can mix both. AI questions are tagged with the chapter they came from so you can place them after the right chapter on the Course order tab.
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-3 items-center">
          <label className="text-sm text-gray-700 dark:text-gray-300 flex items-center gap-2">
            <span>How many questions</span>
            <select
              value={aiQuestionCount}
              onChange={(e) => setAiQuestionCount(Number(e.target.value))}
              disabled={isGeneratingQuiz}
              className="px-3 py-1.5 border border-gray-300 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-800 text-gray-900 dark:text-white text-sm"
            >
              <option value={3}>3</option>
              <option value={5}>5</option>
              <option value={8}>8</option>
            </select>
          </label>
          <button
            type="button"
            onClick={() => runAiGenerate('replace')}
            disabled={isGeneratingQuiz || !chapters.length}
            className="inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isGeneratingQuiz ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Sparkles className="w-4 h-4 mr-2" />
            )}
            Generate from chapters (replace all)
          </button>
          <button
            type="button"
            onClick={() => runAiGenerate('append')}
            disabled={isGeneratingQuiz || !chapters.length}
            className="inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium text-indigo-700 dark:text-indigo-300 bg-white dark:bg-dark-800 border border-indigo-200 dark:border-indigo-800 hover:bg-indigo-50 dark:hover:bg-dark-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Add AI questions to list
          </button>
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-500 mt-3">
          Requires <code className="text-gray-600 dark:text-gray-400">VITE_LLM_URL</code> and{' '}
          <code className="text-gray-600 dark:text-gray-400">VITE_API_KEY</code> in your env.
        </p>
      </div>

      <div className="bg-gray-50 dark:bg-dark-800 p-6 rounded-lg">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Add New Question</h3>
        <div className="space-y-4">
          <input
            value={newQuestion.title}
            onChange={(e) => setNewQuestion({ ...newQuestion, title: e.target.value })}
            placeholder="Enter question title"
            className="w-full px-4 py-2 border border-gray-300 dark:border-dark-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-dark-800 text-gray-900 dark:text-white"
          />
          <div className="flex items-center space-x-4 mb-4">
            <label className="flex items-center">
              <input
                type="radio"
                name="questionType"
                checked={newQuestion.type === 'SCQ'}
                onChange={() => setNewQuestion({ ...newQuestion, type: 'SCQ', correctAnswers: [] })}
                className="w-4 h-4 text-blue-600 focus:ring-blue-500 border-gray-300"
              />
              <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Single Choice</span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                name="questionType"
                checked={newQuestion.type === 'MCQ'}
                onChange={() => setNewQuestion({ ...newQuestion, type: 'MCQ', correctAnswers: [] })}
                className="w-4 h-4 text-blue-600 focus:ring-blue-500 border-gray-300"
              />
              <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Multiple Choice</span>
            </label>
          </div>

          <textarea
            value={newQuestion.question}
            onChange={(e) => setNewQuestion({ ...newQuestion, question: e.target.value })}
            placeholder="Enter your question"
            rows={3}
            className="w-full px-4 py-2 border border-gray-300 dark:border-dark-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-dark-800 text-gray-900 dark:text-white"
          />

          <div className="space-y-3">
            {newQuestion.options.map((option, index) => (
              <div key={index} className="flex items-center space-x-4">
                <button
                  type="button"
                  onClick={() => toggleCorrectAnswer(String(option))}
                  className={`flex items-center justify-center w-6 h-6 rounded-full border-2 transition-colors ${
                    newQuestion.correctAnswers.includes(String(option))
                      ? 'border-green-500 bg-green-500 text-white'
                      : 'border-gray-300 dark:border-dark-700 hover:border-green-500'
                  }`}
                >
                  {newQuestion.correctAnswers.includes(String(option)) && (
                    <CheckCircle className="w-4 h-4" />
                  )}
                </button>
                <input
                  type="text"
                  value={option}
                  onChange={(e) => handleOptionChange(index, e.target.value)}
                  placeholder={`Option ${index + 1}`}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-dark-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-dark-800 text-gray-900 dark:text-white"
                />
              </div>
            ))}
          </div>

          <div className="flex justify-between items-center pt-4">
            <p className="text-sm text-gray-500 dark:text-gray-300">
              {newQuestion.type === 'SCQ' 
                ? 'Select one correct answer'
                : 'Select all correct answers'}
            </p>
            <button
              onClick={handleAddQuestion}
              disabled={!newQuestion.question || !newQuestion.options.every(option => option) || newQuestion.correctAnswers.length === 0}
              className="flex items-center px-4 py-2 bg-blue-600 dark:bg-blue-700 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-800 focus:ring-4 focus:ring-blue-200 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Question
            </button>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {quizList.map((quiz) => (
          <div key={String(quiz._id ?? quiz.id)} className="bg-white dark:bg-dark-800 p-6 rounded-lg border border-gray-200 dark:border-dark-700 shadow-sm">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="font-semibold text-lg text-gray-900 dark:text-white">{quiz.title}</h3>
                <h4 className="font-medium text-gray-800 dark:text-gray-300">{quiz.question}</h4>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {quiz.type === 'SCQ' ? 'Single Choice' : 'Multiple Choice'}
                </span>
                {String(quiz.sourceChapterTitle ?? "").trim() ? (
                  <p className="mt-2 text-xs font-medium text-amber-800 dark:text-amber-200/90 bg-amber-50 dark:bg-amber-950/40 border border-amber-200/80 dark:border-amber-800/60 rounded-md px-2.5 py-1.5 inline-block">
                    Based on chapter:{' '}
                    <span className="text-amber-950 dark:text-amber-100">
                      {String(quiz.sourceChapterTitle).trim()}
                    </span>
                  </p>
                ) : null}
              </div>
              <button onClick={() => handleRemoveQuestion(quiz._id ?? quiz.id)} className="p-2 text-gray-400 hover:text-red-500 transition">
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-2">
              {quiz.options.map((option, index) => (
                <div
                  key={index}
                  className={`p-3 rounded-lg flex items-center space-x-3 
                    ${
                      (quiz.correctAnswers?.includes(String(option)) ||
                        quiz.answer?.includes(String(option)))
                        ? 'bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-700'
                        : 'bg-gray-50 dark:bg-dark-700 border border-gray-200 dark:border-dark-700'
                    }`}
                >
                  {(quiz.correctAnswers?.includes(String(option)) ||
                    quiz.answer?.includes(String(option))) ? <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0"/> : null}
                  <span className="text-gray-900 dark:text-white">{option}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

    </div>
  );
};

export default QuizCreation;
