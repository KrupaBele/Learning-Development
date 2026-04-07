export type CurriculumStep =
  | { type: "chapter"; key: string }
  | { type: "quiz"; key: string };

export function chapterKey(c: Record<string, unknown>): string {
  return String(c.id ?? c._id ?? "");
}

export function quizKey(q: Record<string, unknown>): string {
  return String(q._id ?? q.id ?? "");
}

/** Merge saved chapter + question `order` values into one sequence (edit mode). */
export function buildSequenceFromApi(
  chapters: Record<string, unknown>[],
  questions: Record<string, unknown>[],
): CurriculumStep[] {
  const items: {
    type: "chapter" | "quiz";
    key: string;
    order: number;
  }[] = [];

  (chapters || []).forEach((c) => {
    const k = chapterKey(c);
    if (k)
      items.push({
        type: "chapter",
        key: k,
        order: Number(c.order) || 0,
      });
  });
  (questions || []).forEach((q) => {
    const k = quizKey(q);
    if (k)
      items.push({
        type: "quiz",
        key: k,
        order: Number(q.order) || 0,
      });
  });

  items.sort((a, b) => {
    if (a.order !== b.order) return a.order - b.order;
    if (a.type === b.type) return 0;
    return a.type === "chapter" ? -1 : 1;
  });

  return items.map(({ type, key }) =>
    type === "chapter" ? { type: "chapter", key } : { type: "quiz", key },
  );
}

/** Drop removed items; append any new chapter/quiz not yet in the sequence. */
export function reconcileSequence(
  seq: CurriculumStep[],
  chapters: Record<string, unknown>[],
  quizzes: Record<string, unknown>[],
): CurriculumStep[] {
  const chKeys = new Set(
    chapters.map(chapterKey).filter((k) => k.length > 0),
  );
  const qKeys = new Set(quizzes.map(quizKey).filter((k) => k.length > 0));

  let next = seq.filter(
    (s) =>
      (s.type === "chapter" && chKeys.has(s.key)) ||
      (s.type === "quiz" && qKeys.has(s.key)),
  );

  const seenCh = new Set(
    next.filter((s) => s.type === "chapter").map((s) => s.key),
  );
  for (const ch of chapters) {
    const k = chapterKey(ch);
    if (k && !seenCh.has(k)) {
      next.push({ type: "chapter", key: k });
      seenCh.add(k);
    }
  }

  const seenQ = new Set(next.filter((s) => s.type === "quiz").map((s) => s.key));
  for (const q of quizzes) {
    const k = quizKey(q);
    if (k && !seenQ.has(k)) {
      next.push({ type: "quiz", key: k });
      seenQ.add(k);
    }
  }

  return next;
}
