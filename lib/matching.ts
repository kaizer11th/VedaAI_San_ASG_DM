import type {
  AnswerBlock,
  AssessmentResult,
  ExtractedQuestion,
  MappedQuestion,
  PageImage
} from "./types";

// Normalizes labels like "11(b)", "Q11 b", "11 b)", "11.b" -> "11b"
// so extraction quirks between the question paper and the answer sheet
// (different formatting/spacing/casing) still match up.
export function normalizeLabel(raw: string): string {
  return raw
    .toLowerCase()
    .replace(/^q(uestion)?\.?\s*/i, "")
    .replace(/[().\-\s]/g, "")
    .trim();
}

export function buildAssessmentResult(
  questions: ExtractedQuestion[],
  answerBlocks: AnswerBlock[],
  answerSheetPages: PageImage[]
): AssessmentResult {
  const byNormalized = new Map<string, ExtractedQuestion>();
  for (const q of questions) {
    byNormalized.set(normalizeLabel(q.number), q);
  }

  const blocksByQuestion = new Map<string, AnswerBlock[]>();
  const unmatchedAnswers: AnswerBlock[] = [];

  for (const block of answerBlocks) {
    const guess = block.matchedQuestionLabel
      ? normalizeLabel(block.matchedQuestionLabel)
      : "";
    const question = guess ? byNormalized.get(guess) : undefined;

    if (question) {
      block.matchedQuestionId = question.id;
      const list = blocksByQuestion.get(question.id) ?? [];
      list.push(block);
      blocksByQuestion.set(question.id, list);
    } else {
      block.matchedQuestionId = null;
      unmatchedAnswers.push(block);
    }
  }

  const mapped: MappedQuestion[] = questions.map((q) => {
    const blocks = (blocksByQuestion.get(q.id) ?? []).sort(
      (a, b) => a.page - b.page
    );
    return {
      ...q,
      answerBlocks: blocks,
      status: blocks.length > 0 ? "answered" : "unanswered"
    };
  });

  const answered = mapped.filter((m) => m.status === "answered").length;

  return {
    questions: mapped,
    unmatchedAnswers,
    answerSheetPages,
    summary: {
      totalQuestions: mapped.length,
      answered,
      unanswered: mapped.length - answered,
      totalScore: 0,
      totalMax: 0
    }
  };
}

export function applyGrades(
  result: AssessmentResult,
  grades: { questionId: string; score: number; maxMarks: number; correct: boolean | "partial"; feedback: string }[]
): AssessmentResult {
  const gradeMap = new Map(grades.map((g) => [g.questionId, g]));
  let totalScore = 0;
  let totalMax = 0;

  const questions = result.questions.map((q) => {
    const g = gradeMap.get(q.id);
    if (g) {
      totalScore += g.score;
      totalMax += g.maxMarks;
      return { ...q, grade: g };
    }
    return q;
  });

  return {
    ...result,
    questions,
    summary: {
      ...result.summary,
      totalScore,
      totalMax
    }
  };
}
