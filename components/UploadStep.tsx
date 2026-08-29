"use client";

import { useEffect, useRef, useState } from "react";
import { getPageCount } from "@/lib/pdf";

interface Props {
  onSubmit: (questionFiles: File[], answerFiles: File[]) => void;
}
const MAX_GROUP_MB = 15;

function formatMB(bytes: number) {
  const mb = bytes / (1024 * 1024);
  return mb < 0.1 ? "<0.1MB" : `${mb.toFixed(1)}MB`;
}

function FileIcon({ isPdf }: { isPdf: boolean }) {
  return (
    <div
      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-[10px] font-bold text-white ${
        isPdf ? "bg-redpen" : "bg-ink-faint"
      }`}
    >
      {isPdf ? "PDF" : "IMG"}
    </div>
  );
}

function FileCard({
  file,
  onRemove
}: {
  file: File;
  onRemove: () => void;
}) {
  const [pages, setPages] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    getPageCount(file).then((n) => {
      if (!cancelled) setPages(n);
    });
    return () => {
      cancelled = true;
    };
  }, [file]);

  return (
    <div className="relative flex items-center gap-3 rounded-xl border border-paper-line bg-paper-card p-3 shadow-sm">
      <FileIcon isPdf={file.type === "application/pdf"} />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-ink">{file.name}</p>
        <p className="text-xs text-ink-faint">
          {formatMB(file.size)} · {pages ?? "…"} {pages === 1 ? "Page" : "Pages"}
        </p>
      </div>
      <button
        onClick={onRemove}
        aria-label={`Remove ${file.name}`}
        className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-ink/8 text-xs text-ink-soft transition hover:bg-ink/15"
      >
        ✕
      </button>
    </div>
  );
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

  const tryAdd = (incoming: File[]) => {
    const merged = [...files, ...incoming];
    const total = merged.reduce((sum, f) => sum + f.size, 0);
    if (total > MAX_GROUP_MB * 1024 * 1024) {
      setSizeError(
        `That's ${formatMB(total)} total — please keep this under ${MAX_GROUP_MB}MB.`
      );
      return;
    }
    setSizeError(null);
    onChange(merged);
  };

  const removeAt = (idx: number) => {
    setSizeError(null);
    onChange(files.filter((_, i) => i !== idx));
  };

  if (files.length > 0) {
    return (
      <div className="space-y-2">
        {files.map((f, i) => (
          <FileCard key={`${f.name}-${i}`} file={f} onRemove={() => removeAt(i)} />
        ))}
        <button
          onClick={() => inputRef.current?.click()}
          className="w-full rounded-lg border border-dashed border-ink/15 py-2 text-xs font-medium text-ink-faint transition hover:border-ink/30 hover:text-ink-soft"
        >
          + Add another page
        </button>
        <input
          ref={inputRef}
          type="file"
          multiple
          accept="application/pdf,image/*"
          className="hidden"
          onChange={(e) => tryAdd(Array.from(e.target.files ?? []))}
        />
        <div className="text-right text-[11px] text-ink-faint">
          {formatMB(totalBytes)} / {MAX_GROUP_MB}MB
        </div>
        {sizeError && (
          <div className="rounded-md bg-redpen-soft px-3 py-2 text-xs text-redpen">
            {sizeError}
          </div>
        )}
      </div>
    );
  }

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
        tryAdd(Array.from(e.dataTransfer.files));
      }}
      onClick={() => inputRef.current?.click()}
      className={`flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed p-10 text-center transition ${
        dragOver ? "border-accent bg-accent-soft/40" : "border-ink/15 bg-paper-card hover:border-ink/25"
      }`}
    >
      <input
        ref={inputRef}
        type="file"
        multiple
        accept="application/pdf,image/*"
        className="hidden"
        onChange={(e) => tryAdd(Array.from(e.target.files ?? []))}
      />
      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-ink/6 text-ink-soft">
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
      <div className="mt-3 text-sm text-ink">
        Upload <span className="font-bold text-accent">{label}</span>
      </div>
      <div className="mt-1 text-xs text-ink-faint">Max {MAX_GROUP_MB}MB</div>
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
    <div className="mx-auto w-full max-w-3xl px-4 py-14 sm:py-20">
      <div className="text-center">
        <h1 className="text-2xl font-extrabold leading-tight text-ink sm:text-[28px]">
          Upload{" "}
          <span className="rounded-md bg-accent-soft px-2 py-0.5 text-accent">
            Question Paper &amp; Answer Sheets
          </span>
        </h1>
        <p className="mt-3 text-sm text-ink-soft">
          Upload both files to get started
        </p>
      </div>

      <div className="mt-10 grid gap-4 sm:grid-cols-2">
        <Dropzone label="Question Paper" files={questionFiles} onChange={setQuestionFiles} />
        <Dropzone label="Answer Sheet" files={answerFiles} onChange={setAnswerFiles} />
      </div>

      <div className="mt-8 flex flex-col items-center gap-2">
        <button
          disabled={!canSubmit}
          onClick={() => onSubmit(questionFiles, answerFiles)}
          className="flex items-center gap-1.5 rounded-full bg-ink px-7 py-2.5 text-sm font-semibold text-paper transition hover:bg-ink/90 disabled:cursor-not-allowed disabled:bg-ink/15 disabled:text-ink-faint"
        >
          Start Mapping <span aria-hidden="true">→</span>
        </button>
        <p className="text-center text-xs text-ink-faint">
          Once both files are uploaded, you&apos;ll be able to map answers with questions.
        </p>
      </div>
    </div>
  );
}
