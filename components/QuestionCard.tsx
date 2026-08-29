"use client";

import type { MappedQuestion } from "@/lib/types";

function ScoreBadge({ q }: { q: MappedQuestion }) {
  if (q.status === "unanswered") {
    return (
      <span className="whitespace-nowrap rounded-full bg-ink/8 px-2 py-0.5 font-mono text-[11px] font-medium text-ink-faint">
        Not answered
      </span>
    );
  }
  if (!q.grade) return null;
  const pct = q.grade.maxMarks > 0 ? q.grade.score / q.grade.maxMarks : 0;
  const cls = pct >= 0.5 ? "bg-correct-soft text-correct" : "bg-redpen-soft text-redpen";
  return (
    <span className={`whitespace-nowrap rounded-full px-2 py-0.5 font-mono text-[11px] font-semibold ${cls}`}>
      {q.grade.score}/{q.grade.maxMarks}
    </span>
  );
}

export default function QuestionCard({
  q,
  index,
  selected,
  expanded,
  onSelect
}: {
  q: MappedQuestion;
  index: number;
  selected: boolean;
  expanded: boolean;
  onSelect: () => void;
}) {
  return (
    <div
      onClick={onSelect}
      className={`cursor-pointer rounded-xl border p-3 transition ${
        selected
          ? "border-accent/40 bg-accent-soft/30 ring-1 ring-accent/20"
          : "border-transparent bg-paper-card hover:border-ink/10"
      }`}
    >
      <div className="flex items-start gap-3">
        <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-ink font-mono text-[11px] font-semibold text-paper">
          {index + 1}
        </span>
        <div className="min-w-0 flex-1">
          <p className={`text-sm text-ink ${expanded ? "" : "line-clamp-2"}`}>
            <span className="font-display font-semibold">{q.number}. </span>
            {q.text}
          </p>
          <div className="mt-1.5 flex items-center gap-2">
            <ScoreBadge q={q} />
            {q.answerBlocks.length > 1 && (
              <span className="font-mono text-[10px] text-ink-faint">
                spans {q.answerBlocks.length} pages
              </span>
            )}
          </div>
        </div>
      </div>

      {expanded && q.grade?.feedback && (
        <div className="mt-3 rounded-lg border border-accent/15 bg-white p-3 animate-fade-in">
          <p className="font-mono text-[10px] font-semibold uppercase tracking-wide text-accent">
            AI Feedback
          </p>
          <p className="mt-1 text-xs leading-relaxed text-ink-soft">
            {q.grade.feedback}
          </p>
        </div>
      )}
    </div>
  );
}
