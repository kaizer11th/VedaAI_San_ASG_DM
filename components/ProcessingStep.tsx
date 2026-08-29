"use client";

import type { ProcessingStage } from "@/lib/types";

const STAGES: { key: ProcessingStage; label: string }[] = [
  { key: "rendering-files", label: "Reading uploaded pages" },
  { key: "extracting-questions", label: "Extracting questions from paper" },
  { key: "extracting-answers", label: "Reading handwritten answers" },
  { key: "mapping", label: "Mapping answers to questions" },
  { key: "grading", label: "Grading & generating feedback" }
];

export default function ProcessingStep({
  stage,
  error
}: {
  stage: ProcessingStage;
  error?: string | null;
}) {
  const currentIndex = STAGES.findIndex((s) => s.key === stage);

  return (
    <div className="mx-auto flex w-full max-w-md flex-col items-center px-4 py-20">
      <div className="h-9 w-9 animate-spin rounded-full border-[3px] border-ink/10 border-t-redpen" />
      <h2 className="mt-6 font-display text-xl font-semibold text-ink">
        Marking up your files…
      </h2>
      <div className="mt-7 w-full space-y-3">
        {STAGES.map((s, i) => {
          const done = currentIndex > i || stage === "done";
          const active = currentIndex === i;
          return (
            <div key={s.key} className="flex items-center gap-3 text-sm">
              <span
                className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full font-mono text-[10px] font-semibold ${
                  done
                    ? "bg-correct text-white"
                    : active
                    ? "bg-ink text-paper"
                    : "bg-ink/10 text-ink-faint"
                }`}
              >
                {done ? "✓" : i + 1}
              </span>
              <span className={done || active ? "text-ink" : "text-ink-faint"}>
                {s.label}
              </span>
            </div>
          );
        })}
      </div>
      {error && (
        <div className="mt-6 w-full rounded-lg bg-redpen-soft p-3 text-sm text-redpen">
          {error}
        </div>
      )}
    </div>
  );
}
