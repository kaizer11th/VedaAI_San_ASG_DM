"use client";

import { useRef, useState } from "react";

interface Props {
  onSubmit: (questionFiles: File[], answerFiles: File[]) => void;
}

// Gemini's generateContent endpoint caps a request at 20MB total (prompt text +
// base64 file data combined), and base64 encoding adds ~33% on top of the raw
// file size. So each upload group gets a 15MB raw-file budget here, which stays
// safely under that ceiling even after encoding overhead and the prompt text.
const MAX_GROUP_MB = 15;

function formatMB(bytes: number) {
  return (bytes / (1024 * 1024)).toFixed(1);
}

function Dropzone({
  label,
  files,
  onChange
}: {
  label: string;
  files: File[];
  onChange: (files: File[]) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [sizeError, setSizeError] = useState<string | null>(null);

  const totalBytes = files.reduce((sum, f) => sum + f.size, 0);

  const handleFiles = (incoming: File[]) => {
    const total = incoming.reduce((sum, f) => sum + f.size, 0);
    if (total > MAX_GROUP_MB * 1024 * 1024) {
      setSizeError(
        `That's ${formatMB(total)}MB total — please keep this under ${MAX_GROUP_MB}MB (see note below).`
      );
      return;
    }
    setSizeError(null);
    onChange(incoming);
  };

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setDragOver(true);
      }}
      onDragLeave={() => setDragOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragOver(false);
        handleFiles(Array.from(e.dataTransfer.files));
      }}
      onClick={() => inputRef.current?.click()}
      className={`flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed p-8 text-center transition ${
        dragOver
          ? "border-redpen bg-redpen-soft/40"
          : "border-ink/15 bg-paper-card hover:border-ink/30"
      }`}
    >
      <input
        ref={inputRef}
        type="file"
        multiple
        accept="application/pdf,image/*"
        className="hidden"
        onChange={(e) => handleFiles(Array.from(e.target.files ?? []))}
      />
      <div className="flex h-11 w-11 items-center justify-center rounded-full bg-ink text-paper">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
          <path
            d="M12 16V4m0 0L7 9m5-5l5 5M5 20h14"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
      <div className="mt-3 font-display text-base font-semibold text-ink">
        {label}
      </div>
      <div className="mt-1 text-xs text-ink-faint">
        PDF or image(s), pages in order · up to {MAX_GROUP_MB}MB total
      </div>
      {files.length > 0 && (
        <div className="mt-3 w-full space-y-1">
          {files.map((f, i) => (
            <div
              key={i}
              className="flex items-center justify-between gap-2 truncate rounded-md bg-paper px-2 py-1 text-xs text-ink-soft"
            >
              <span className="truncate">{f.name}</span>
              <span className="shrink-0 font-mono text-[10px] text-ink-faint">
                {formatMB(f.size)}MB
              </span>
            </div>
          ))}
          <div className="pt-0.5 text-right text-[10px] font-mono text-ink-faint">
            {formatMB(totalBytes)}MB / {MAX_GROUP_MB}MB
          </div>
        </div>
      )}
      {sizeError && (
        <div className="mt-3 rounded-md bg-redpen-soft px-3 py-2 text-xs text-redpen">
          {sizeError}
        </div>
      )}
    </div>
  );
}

export default function UploadStep({ onSubmit }: Props) {
  const [questionFiles, setQuestionFiles] = useState<File[]>([]);
  const [answerFiles, setAnswerFiles] = useState<File[]>([]);

  const canSubmit = questionFiles.length > 0 && answerFiles.length > 0;

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-10 sm:py-16">
      <p className="font-mono text-xs uppercase tracking-widest text-redpen">
        Question extraction · Answer mapping · Grading
      </p>
      <h1 className="mt-3 font-display text-3xl font-semibold leading-tight text-ink sm:text-4xl">
        AI Assessment Extraction &amp; Answer Mapping
      </h1>
      <p className="mt-3 max-w-xl text-sm leading-relaxed text-ink-soft sm:text-base">
        Upload a question paper and a student&apos;s handwritten answer sheet.
        We&apos;ll extract every question, map each answer to it, and mark up
        exactly where it is — no typing, no manual grading.
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        <Dropzone
          label="Question paper"
          files={questionFiles}
          onChange={setQuestionFiles}
        />
        <Dropzone
          label="Student answer sheet"
          files={answerFiles}
          onChange={setAnswerFiles}
        />
      </div>

      <p className="mt-3 text-xs text-ink-faint">
        Size limits come from Gemini&apos;s request cap (20MB total per call, including
        the ~33% base64 encoding overhead) — keeping each upload under {MAX_GROUP_MB}MB
        raw leaves headroom for that, plus the extraction prompt itself. Very long
        scans (15+ pages) may also take noticeably longer to process.
      </p>

      <button
        disabled={!canSubmit}
        onClick={() => onSubmit(questionFiles, answerFiles)}
        className="mt-8 w-full rounded-xl bg-ink py-3 text-sm font-semibold text-paper transition hover:bg-ink/90 disabled:cursor-not-allowed disabled:bg-ink/25 sm:w-auto sm:px-8"
      >
        Extract &amp; map answers
      </button>
    </div>
  );
}
