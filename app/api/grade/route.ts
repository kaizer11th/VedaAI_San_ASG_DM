import { NextRequest, NextResponse } from "next/server";
import { callGemini, parseJson } from "@/lib/gemini";

export const maxDuration = 60;

const PROMPT = `You are a fair, encouraging teacher grading student answers.
You are given a list of question/answer pairs. For each, grade the answer against the question.
- If the question paper specified maxMarks, use that as the maximum. Otherwise use 5 as the maximum.
- correct should be true (fully correct), false (incorrect/missing), or "partial" (partially correct).
- feedback should be 1-2 short, specific, constructive sentences.

Return ONLY a JSON array (no markdown, no commentary) matching this shape, one entry per input item, in the same order:
[
  { "questionId": "q_0_1", "score": 2, "maxMarks": 2, "correct": true, "feedback": "..." }
]`;

export async function POST(req: NextRequest) {
  try {
    const { items } = await req.json();

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ grades: [] });
    }

    const fullPrompt = `${PROMPT}\n\nItems:\n${JSON.stringify(items, null, 2)}`;
    const raw = await callGemini(fullPrompt, []);
    const parsed = parseJson<any[]>(raw);

    const grades = parsed.map((g) => ({
      questionId: String(g.questionId),
      score: Number(g.score) || 0,
      maxMarks: Number(g.maxMarks) || 5,
      correct: g.correct === true || g.correct === false ? g.correct : "partial",
      feedback: String(g.feedback ?? "")
    }));

    return NextResponse.json({ grades });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json(
      { error: err?.message ?? "Failed to grade answers." },
      { status: 500 }
    );
  }
}
