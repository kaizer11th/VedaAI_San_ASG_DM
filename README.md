# VedaAI Assessment Mapper

Upload a question paper and a student's handwritten answer sheet. The app extracts
every question, extracts and transcribes the handwritten answers, maps each answer
to its question, highlights the exact region of the answer sheet it came from, and
(optionally) grades each answer with AI feedback.

## Live demo / repo
- Live URL: _add after deploying (see below)_
- GitHub repo: _add your repo URL_

## Approach

**Pipeline:** Question Extraction → Answer Extraction → Answer Mapping → Grading/Feedback

1. **Upload & render.** The teacher uploads the question paper and the answer sheet
   (PDF and/or images). PDFs are rendered to page images entirely in the browser
   using `pdfjs-dist` + `<canvas>` — no file ever needs to be stored server-side.
2. **Question extraction** (`/api/extract-questions`). All question-paper page
   images are sent in one request to Gemini with a prompt that asks it to return every
   question **in printed order**, with labelled sub-parts (e.g. `11 (a)`, `11 (b)`)
   as separate entries, preserving the original numbering and (if printed) the marks
   for that question.
3. **Answer extraction** (`/api/extract-answers`). All answer-sheet page images are
   sent to Gemini along with the list of known question numbers. For every distinct
   handwritten block it finds, it transcribes the text, guesses which question number
   it answers (or returns `null` if it can't confidently tell), and returns a
   normalized bounding box (`0–1000` scale, `[yMin, xMin, yMax, xMax]`) for exactly
   where that block sits on the page. If a single answer spans multiple pages, each
   page's portion is returned as its own block sharing the same question label, so
   they can be stitched back together.
4. **Mapping** (`lib/matching.ts`). Runs entirely client-side (no extra AI call).
   Question labels from step 2 and the guessed labels from step 3 are normalized
   (case, spacing, punctuation, optional "Q" prefix all stripped) and matched.
   Any answer block that still doesn't match a known question is kept in a separate
   **"unmatched answers"** bucket instead of being forced onto the wrong question.
   Questions with no matched block are flagged **unanswered**.
5. **Grading** (`/api/grade`, optional layer). All *answered* question/answer pairs
   are sent to Gemini in a single batched call, which returns a score out of the
   question's printed max marks (or 5 by default), a correct/partial/incorrect
   verdict, and 1–2 sentences of feedback per question.
6. **UI.** Left panel: the extracted question list with score badges and expandable
   AI feedback. Right panel: the answer sheet viewer with page navigation and a
   highlighted overlay box drawn from the matched bounding box. Clicking a question
   jumps the viewer to the right page and highlights the answer; if the answer spans
   multiple pages, a banner lets you jump between them. On phones, the two panels
   become a top tab switcher ("Questions" / "Answer Sheet") matching the provided
   Figma mobile design; picking a question automatically switches to the sheet tab.

## AI model / API used
**Google Gemini (`gemini-3.6-flash`)** via the REST `generateContent` endpoint,
used for its multimodal (vision) understanding and free tier. It's used for three
calls: question extraction, answer extraction + bounding boxes, and grading.

The API key lives only in the server's environment as `GEMINI_API_KEY` — it's read
server-side in `lib/gemini.ts` and never sent to or seen by the browser. There's
still no database and no auth: everything else (uploaded pages, extraction results)
lives only in React state for the current session, satisfying the "no auth / no DB /
in-memory" constraint.


## Assumptions & limitations
- Exactly one student's answer sheet is handled per run, as specified.
- Question numbering matching relies on the student having written *some* recognizable
  label (e.g. "Q1", "1.", "11 b)") near their answer, or Gemini being able to infer it
  from context/order. Extremely ambiguous handwriting can still be mis-mapped or land
  in "unmatched answers" — the UI surfaces that bucket explicitly rather than hiding it.
- Bounding boxes are Gemini's own spatial estimate; they're usually good but not
  pixel-perfect, especially on messy/rotated scans.
- Grading is a best-effort AI judgement, not an authoritative grade — it's presented
  as "AI Feedback", consistent with the assignment's optional scope.
- Large multi-page PDFs increase Gemini request size/latency; very long answer
  sheets (>15–20 pages) may be slower or hit free-tier rate limits.
- No authentication/session persistence — refreshing the page clears the current
  result (by design, per "no DB / in-memory storage is sufficient").


## Tech stack
Next.js 14 (App Router) · TypeScript · Tailwind CSS · pdfjs-dist (client-side PDF
rendering) · Google Gemini 2.0 Flash (vision + JSON mode).
