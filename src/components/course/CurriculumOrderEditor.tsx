import React from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { GripVertical } from "lucide-react";
import type { CurriculumStep } from "../../utils/curriculumOrder";
import { chapterKey, quizKey } from "../../utils/curriculumOrder";

type Props = {
  chapters: Record<string, unknown>[];
  quizzes: Record<string, unknown>[];
  sequence: CurriculumStep[];
  onSequenceChange: (next: CurriculumStep[]) => void;
};

function labelForStep(
  step: CurriculumStep,
  chapters: Record<string, unknown>[],
  quizzes: Record<string, unknown>[],
): string {
  if (step.type === "chapter") {
    const ch = chapters.find((c) => chapterKey(c) === step.key);
    const title = (ch?.title as string) || "Chapter";
    return `Chapter: ${title}`;
  }
  const q = quizzes.find((x) => quizKey(x) === step.key);
  const title = (q?.title as string) || "Quiz question";
  const fromChapter = (q?.sourceChapterTitle as string)?.trim();
  if (fromChapter) {
    return `Quiz: ${title} — from chapter “${fromChapter}”`;
  }
  return `Quiz: ${title}`;
}

const CurriculumOrderEditor: React.FC<Props> = ({
  chapters,
  quizzes,
  sequence,
  onSequenceChange,
}) => {
  const onDragEnd = (result: {
    destination?: { index: number } | null;
    source: { index: number };
  }) => {
    if (!result.destination) return;
    const items = Array.from(sequence);
    const [removed] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, removed);
    onSequenceChange(items);
  };

  if (sequence.length === 0) {
    return (
      <p className="text-gray-500 dark:text-gray-400 text-sm">
        Add chapters and quiz questions in the other tabs first. Their order
        will appear here so you can drag items to place quizzes between
        chapters.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-600 dark:text-gray-300">
        Drag to set the order learners follow. Each row is one step: a full
        chapter or one quiz question. This order is saved as the shared{" "}
        <code className="text-xs bg-gray-100 dark:bg-dark-700 px-1 rounded">
          order
        </code>{" "}
        field on the server.
      </p>
      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="curriculum-order">
          {(provided) => (
            <ul
              className="space-y-2 rounded-lg border border-gray-200 dark:border-dark-700 p-2 bg-gray-50 dark:bg-dark-900"
              ref={provided.innerRef}
              {...provided.droppableProps}
            >
              {sequence.map((step, index) => (
                <Draggable
                  key={`${step.type}-${step.key}`}
                  draggableId={`${step.type}-${step.key}`}
                  index={index}
                >
                  {(dragProvided, snapshot) => (
                    <li
                      ref={dragProvided.innerRef}
                      {...dragProvided.draggableProps}
                      className={`flex items-center gap-3 rounded-md border bg-white dark:bg-dark-800 px-3 py-2.5 ${
                        snapshot.isDragging
                          ? "border-blue-400 shadow-md"
                          : "border-gray-200 dark:border-dark-700"
                      }`}
                    >
                      <span
                        {...dragProvided.dragHandleProps}
                        className="text-gray-400 cursor-grab active:cursor-grabbing"
                      >
                        <GripVertical className="w-5 h-5" />
                      </span>
                      <span className="text-xs font-mono text-gray-400 w-6">
                        {index + 1}
                      </span>
                      <span className="flex-1 text-sm text-gray-900 dark:text-white">
                        {labelForStep(step, chapters, quizzes)}
                      </span>
                      {step.type === "quiz" ? (
                        <span className="text-xs text-amber-600 dark:text-amber-400">
                          Quiz
                        </span>
                      ) : (
                        <span className="text-xs text-blue-600 dark:text-blue-400">
                          Chapter
                        </span>
                      )}
                    </li>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </ul>
          )}
        </Droppable>
      </DragDropContext>
    </div>
  );
};

export default CurriculumOrderEditor;
