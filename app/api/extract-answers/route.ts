import { NextRequest, NextResponse } from "next/server";
import { callGemini, parseJson } from "@/lib/gemini";

export const maxDuration = 60;

const PROMPT = `You are analysing a scanned HANDWRITTEN STUDENT ANSWER SHEET, given as one image per page, in order.
You are also given the list of questions from the matching question paper (with their printed numbers), for reference.

For each distinct answer block you find (a student may write answers out of order, skip questions, or write something that
doesn't correspond to any known question):
- Transcribe the handwritten text as accurately as possible.
- Try to determine which question number it answers. Students may write it as "Q1", "1.", "Ans 2", "11 b)", etc, or the
  question number might be implied by position/order rather than explicitly written. If you cannot confidently match it to
  any question in the provided list, set matchedQuestionLabel to null.
- If a single answer continues across multiple pages, report it as SEPARATE blocks (one per page it appears on) using the
  SAME matchedQuestionLabel, so they can be stitched back together — do not merge multi-page content into one block.
- Give a bounding box for the region of the page containing that answer block, normalized to a 0-1000 scale in the order
  [yMin, xMin, yMax, xMax], where (0,0) is the top-left corner of the page image and (1000,1000) is the bottom-right.
- Note the 1-indexed page number.
- Rate your confidence in the question match as "high", "medium", or "low".

Return ONLY a JSON array (no markdown, no commentary) of objects with this exact shape:
[
  {
    "matchedQuestionLabel": "11 (b)",
    "text": "transcribed handwritten answer text",
    "page": 2,
    "bbox": [120, 80, 340, 900],
    "confidence": "high"
  }
]
matchedQuestionLabel must be null (not a string) when you cannot confidently match it to any listed question.`;

export async function POST(req: NextRequest) {
  try {
    const { pages, questionLabels } = await req.json();

    if (!Array.isArray(pages) || pages.length === 0) {
      return NextResponse.json({ error: "No answer sheet pages provided." }, { status: 400 });
    }

    const images = pages.map((p: any) => ({ mimeType: p.mimeType, base64: p.base64 }));
    const fullPrompt =
      PROMPT +
      `\n\nThe images are provided in order as page 1, page 2, ... page ${pages.length}.` +
      `\n\nKnown question numbers from the question paper: ${JSON.stringify(questionLabels ?? [])}.`;

    const raw = await callGemini(fullPrompt, images);
    const parsed = parseJson<any[]>(raw);

    const blocks = parsed.map((b, idx) => ({
      id: `ans_${idx}`,
      matchedQuestionId: null,
      matchedQuestionLabel: b.matchedQuestionLabel ?? null,
      text: String(b.text ?? ""),
      page: Number(b.page) || 1,
      bbox: Array.isArray(b.bbox) && b.bbox.length === 4 ? b.bbox.map(Number) : [0, 0, 1000, 1000],
      confidence: ["high", "medium", "low"].includes(b.confidence) ? b.confidence : "medium"
    }));

    return NextResponse.json({ blocks });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json(
      { error: err?.message ?? "Failed to extract answers." },
      { status: 500 }
    );
  }
}
