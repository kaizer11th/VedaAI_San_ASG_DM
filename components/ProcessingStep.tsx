"use client";

import type { ProcessingStage } from "@/lib/types";

const STAGES: { key: ProcessingStage; label: string }[] = [
  { key: "rendering-files", label: "Reading uploaded pages" },
  { key: "extracting-questions", label: "Extracting questions from paper" },
  { key: "extracting-answers", label: "Reading handwritten answers" },
  { key: "mapping", label: "Mapping answers to questions" },
  { key: "grading", label: "Grading & generating feedback" }
];

function Sparkle() {
  return (
    <svg
      width="44"
      height="44"
      viewBox="0 0 24 24"
      fill="currentColor"
      className="animate-sparkle-pulse text-accent"
      aria-hidden="true"
    >
      <path d="M12 2c.6 3.6 2.2 5.6 6 6-3.8.4-5.4 2.4-6 6-.6-3.6-2.2-5.6-6-6 3.8-.4 5.4-2.4 6-6z" />
      <path d="M19 15c.3 1.8 1 2.7 3 3-2 .3-2.7 1.2-3 3-.3-1.8-1-2.7-3-3 2-.3 2.7-1.2 3-3z" />
    </svg>
  );
}

export default function ProcessingStep({
  stage,
  error
}: {
  stage: ProcessingStage;
  error?: string | null;
}) {
  const currentIndex = STAGES.findIndex((s) => s.key === stage);

  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-4 py-16">
      <Sparkle />
      <h2 className="mt-5 text-xl font-extrabold text-ink">Extracting…</h2>
      <p className="mt-1 text-sm text-ink-faint">This may take a while</p>

      <div className="mt-10 w-full max-w-xs space-y-2.5">
        {STAGES.map((s, i) => {
          const done = currentIndex > i || stage === "done";
          const active = currentIndex === i;
          return (
            <div key={s.key} className="flex items-center gap-2.5 text-xs">
              <span
                className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full text-[9px] font-semibold ${
                  done
                    ? "bg-correct text-white"
                    : active
                    ? "bg-accent text-white"
                    : "bg-ink/8 text-ink-faint"
                }`}
              >
                {done ? "✓" : i + 1}
              </span>
              <span className={done || active ? "text-ink-soft" : "text-ink-faint"}>
                {s.label}
              </span>
            </div>
          );
        })}
      </div>

      {error && (
        <div className="mt-6 w-full max-w-xs rounded-lg bg-redpen-soft p-3 text-sm text-redpen">
          {error}
        </div>
      )}
    </div>
  );
}
