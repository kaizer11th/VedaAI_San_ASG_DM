// Normalized bounding box, Gemini-style: 0-1000 scale, [yMin, xMin, yMax, xMax]
export type BBox = [number, number, number, number];

export interface PageImage {
  page: number; // 1-indexed
  dataUrl: string; // for on-screen rendering
  base64: string; // raw base64 (no data: prefix) for API calls
  mimeType: string;
  width: number;
  height: number;
}

export interface ExtractedQuestion {
  id: string; // e.g. "11b"
  number: string; // display label e.g. "11 (b)"
  text: string;
  page: number;
  bbox?: BBox;
  maxMarks?: number; // parsed from paper if present, else undefined
}

export interface AnswerBlock {
  id: string;
  matchedQuestionId: string | null; // null => unmatched
  matchedQuestionLabel: string | null; // raw label as written/guessed, for display
  text: string;
  page: number;
  bbox: BBox;
  confidence: "high" | "medium" | "low";
}

export interface GradeResult {
  questionId: string;
  score: number;
  maxMarks: number;
  correct: boolean | "partial";
  feedback: string;
}

export interface MappedQuestion extends ExtractedQuestion {
  answerBlocks: AnswerBlock[]; // can span multiple pages
  status: "answered" | "unanswered";
  grade?: GradeResult;
}

export interface AssessmentResult {
  questions: MappedQuestion[];
  unmatchedAnswers: AnswerBlock[];
  answerSheetPages: PageImage[];
  summary: {
    totalQuestions: number;
    answered: number;
    unanswered: number;
    totalScore: number;
    totalMax: number;
  };
}

export type ProcessingStage =
  | "idle"
  | "rendering-files"
  | "extracting-questions"
  | "extracting-answers"
  | "mapping"
  | "grading"
  | "done"
  | "error";
