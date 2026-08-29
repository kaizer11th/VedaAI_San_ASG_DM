import { NextRequest, NextResponse } from "next/server";
import { callGemini, parseJson } from "@/lib/gemini";

export const maxDuration = 60;

const PROMPT = `You are analysing a scanned exam QUESTION PAPER, given as one image per page, in order.

Extract EVERY question printed in the paper, in the exact printed order. Rules:
- If a question has labelled sub-parts (e.g. "11 (a)", "11 (b)"), treat EACH sub-part as its own separate entry, not the parent question.
- Preserve the original numbering exactly as printed (e.g. "11 (a)", "2", "Q5").
- Include the full question text.
- If marks are printed for a question (e.g. "[5 marks]", "(2)"), extract that number as maxMarks. If not present, omit maxMarks.
- Note the 1-indexed page number the question appears on.

Return ONLY a JSON array (no markdown, no commentary) of objects with this exact shape:
[
  {
    "number": "11 (a)",
    "text": "full question text",
    "page": 1,
    "maxMarks": 5
  }
]
If you cannot determine maxMarks, omit that field entirely for that item.`;

export async function POST(req: NextRequest) {
  try {
    const { pages } = await req.json();

    if (!Array.isArray(pages) || pages.length === 0) {
      return NextResponse.json({ error: "No question paper pages provided." }, { status: 400 });
    }

    const images = pages.map((p: any) => ({ mimeType: p.mimeType, base64: p.base64 }));
    const pageLabelledPrompt =
      PROMPT +
      `\n\nThe images are provided in order as page 1, page 2, ... page ${pages.length}.`;

    const raw = await callGemini(pageLabelledPrompt, images);
    const parsed = parseJson<any[]>(raw);

    const questions = parsed.map((q, idx) => ({
      id: `q_${idx}_${String(q.number ?? idx).replace(/\W+/g, "")}`,
      number: String(q.number ?? `${idx + 1}`),
      text: String(q.text ?? ""),
      page: Number(q.page) || 1,
      maxMarks: q.maxMarks !== undefined ? Number(q.maxMarks) : undefined
    }));

    return NextResponse.json({ questions });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json(
      { error: err?.message ?? "Failed to extract questions." },
      { status: 500 }
    );
  }
}
