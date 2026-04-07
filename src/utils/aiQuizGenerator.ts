import { LLMClient } from "../services/llm-api-client";
import { chapterKey } from "./curriculumOrder";

function stripHtml(html: string): string {
  if (!html) return "";
  const d = document.createElement("div");
  d.innerHTML = html;
  return (d.textContent || d.innerText || "")
    .replace(/\s+/g, " ")
    .trim();
}

/** Numbered blocks so the model can return `chapterIndex` for each question. */
function buildNumberedChaptersContext(
  chapters: Record<string, unknown>[],
  maxPerChapter = 1400,
  maxTotal = 12000,
): string {
  let total = 0;
  const parts: string[] = [];
  for (let i = 0; i < chapters.length; i++) {
    const ch = chapters[i];
    const title = String(ch.title || `Chapter ${i + 1}`);
    const key = chapterKey(ch);
    const desc = stripHtml(String(ch.description || "")).slice(0, maxPerChapter);
    const block = `[chapterIndex ${i}] chapterKey: "${key}"\nTitle: ${title}\nContent:\n${desc}`;
    if (total + block.length > maxTotal) break;
    parts.push(block);
    total += block.length;
  }
  return parts.join("\n\n---\n\n");
}

function resolveChapterAttribution(
  q: Record<string, unknown>,
  chapters: Record<string, unknown>[],
): { sourceChapterKey: string; sourceChapterTitle: string } {
  const ci = Number(q.chapterIndex);
  if (Number.isInteger(ci) && ci >= 0 && ci < chapters.length) {
    const ch = chapters[ci];
    return {
      sourceChapterKey: chapterKey(ch),
      sourceChapterTitle: String(ch.title || `Chapter ${ci + 1}`),
    };
  }
  const ref =
    q.sourceChapterRef != null ? String(q.sourceChapterRef).trim() : "";
  if (ref) {
    const ch = chapters.find((c) => chapterKey(c) === ref);
    if (ch) {
      return {
        sourceChapterKey: ref,
        sourceChapterTitle: String(ch.title || ref),
      };
    }
  }
  const titleGuess =
    q.sourceChapterTitle != null ? String(q.sourceChapterTitle).trim() : "";
  if (titleGuess) {
    const ch = chapters.find(
      (c) =>
        String(c.title || "").trim().toLowerCase() === titleGuess.toLowerCase(),
    );
    if (ch) {
      return {
        sourceChapterKey: chapterKey(ch),
        sourceChapterTitle: String(ch.title || titleGuess),
      };
    }
  }
  return { sourceChapterKey: "", sourceChapterTitle: "" };
}

export type GeneratedQuizItem = {
  id: number;
  title: string;
  question: string;
  type: "SCQ" | "MCQ";
  options: string[];
  correctAnswers: string[];
  answer: string[];
  sourceChapterKey?: string;
  sourceChapterTitle?: string;
};

/**
 * Calls the same LLM API as the rest of the app; returns quiz rows compatible with QuizCreation + save payload.
 */
export async function generateQuizQuestionsFromChapters(
  chapters: Record<string, unknown>[],
  questionCount: number,
): Promise<GeneratedQuizItem[]> {
  if (!chapters.length) {
    throw new Error("Add at least one chapter before generating a quiz.");
  }

  const context = buildNumberedChaptersContext(chapters);
  const n = chapters.length;
  const systemMessage = `You write clear multiple-choice questions for workplace training courses.
Respond with ONLY a valid JSON array (no markdown code fences, no explanation before or after).
Each array element must be an object with:
- "chapterIndex": integer from 0 to ${n - 1} — the chapter this question primarily tests (see numbered blocks in the user message)
- "title": short label (string)
- "question": the question text (string, plain text only)
- "type": "SCQ" for single correct answer, or "MCQ" for multiple correct answers
- "options": array of exactly 4 distinct non-empty strings
- "correctIndices": array of 0-based indices into "options" for every correct answer (length 1 for SCQ, 2+ possible for MCQ)
Do not include trailing commas. Use double quotes for JSON.`;

  const prompt = `There are ${n} chapters, indexed 0 through ${n - 1}. Each question MUST include the correct "chapterIndex" for the chapter it is based on.

Training content:

${context}

Create exactly ${questionCount} questions that test understanding of the material above. Spread questions across chapters where appropriate. JSON array only.`;

  const client = new LLMClient();
  let full = "";
  for await (const chunk of client.streamResponse(
    prompt,
    systemMessage,
    4000,
  )) {
    full += chunk;
  }

  let trimmed = full.trim();
  if (trimmed.startsWith("```")) {
    trimmed = trimmed
      .replace(/^```(?:json)?\s*/i, "")
      .replace(/\s*```\s*$/i, "");
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(trimmed);
  } catch {
    throw new Error(
      "Could not parse AI response as JSON. Try again or add questions manually.",
    );
  }

  if (!Array.isArray(parsed)) {
    throw new Error("AI did not return a JSON array.");
  }

  const limited = parsed.slice(0, questionCount);
  const out: GeneratedQuizItem[] = [];
  const baseId = Date.now() + Math.floor(Math.random() * 1e6);

  for (let i = 0; i < limited.length; i++) {
    const q = limited[i] as Record<string, unknown>;
    let options = (Array.isArray(q.options) ? q.options : [])
      .map((o) => String(o).trim())
      .filter(Boolean)
      .slice(0, 4);
    while (options.length < 4) {
      options.push(`Option ${options.length + 1}`);
    }

    const rawIdx = Array.isArray(q.correctIndices) ? q.correctIndices : [0];
    const idxs = rawIdx
      .map((x) => Number(x))
      .filter((n) => Number.isInteger(n) && n >= 0 && n < 4);

    const uniqueIdx = [...new Set(idxs)];
    const type = q.type === "MCQ" ? "MCQ" : "SCQ";
    const finalIdxs =
      type === "SCQ" && uniqueIdx.length > 0
        ? [uniqueIdx[0]]
        : uniqueIdx.length
          ? uniqueIdx
          : [0];

    const answer = finalIdxs.map((idx) => options[idx]).filter(Boolean);
    if (!answer.length) continue;

    const { sourceChapterKey, sourceChapterTitle } = resolveChapterAttribution(
      q,
      chapters,
    );

    out.push({
      id: baseId + i,
      title: String(q.title || `Question ${i + 1}`).slice(0, 200),
      question: String(q.question || "").slice(0, 4000),
      type,
      options,
      correctAnswers: [...answer],
      answer: [...answer],
      ...(sourceChapterKey
        ? { sourceChapterKey }
        : {}),
      ...(sourceChapterTitle
        ? { sourceChapterTitle }
        : {}),
    });
  }

  if (!out.length) {
    throw new Error("AI returned no usable questions. Try again or add manually.");
  }

  return out;
}
