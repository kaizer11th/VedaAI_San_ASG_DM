"use client";

import type { AssessmentResult } from "@/lib/types";
import QuestionCard from "./QuestionCard";

export default function QuestionsList({
  result,
  selectedId,
  onSelect
}: {
  result: AssessmentResult;
  selectedId: string | null;
  onSelect: (id: string) => void;
}) {
  const { summary } = result;

  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-paper-line p-4">
        <h2 className="font-display text-sm font-semibold text-ink">
          Extracted Questions
        </h2>
        <div className="mt-2 flex flex-wrap gap-2 font-mono text-[11px]">
          <span className="rounded-full bg-ink/8 px-2 py-0.5 text-ink-soft">
            {summary.totalQuestions} questions
          </span>
          <span className="rounded-full bg-correct-soft px-2 py-0.5 text-correct">
            {summary.answered} answered
          </span>
          <span className="rounded-full bg-redpen-soft px-2 py-0.5 text-redpen">
            {summary.unanswered} unanswered
          </span>
          {summary.totalMax > 0 && (
            <span className="rounded-full bg-warn-soft px-2 py-0.5 text-warn">
              {summary.totalScore}/{summary.totalMax} total
            </span>
          )}
        </div>
      </div>

      <div className="flex-1 space-y-2 overflow-y-auto p-3">
        {result.questions.map((q, i) => (
          <QuestionCard
            key={q.id}
            q={q}
            index={i}
            selected={selectedId === q.id}
            expanded={selectedId === q.id}
            onSelect={() => onSelect(q.id)}
          />
        ))}

        {result.unmatchedAnswers.length > 0 && (
          <div className="mt-4">
            <p className="px-1 font-mono text-[10px] font-semibold uppercase tracking-wide text-ink-faint">
              Answers not matched to any question
            </p>
            <div className="mt-2 space-y-2">
              {result.unmatchedAnswers.map((b) => (
                <div
                  key={b.id}
                  onClick={() => onSelect(`unmatched:${b.id}`)}
                  className={`cursor-pointer rounded-xl border p-3 text-sm transition ${
                    selectedId === `unmatched:${b.id}`
                      ? "border-redpen/40 bg-redpen-soft/30"
                      : "border-ink/10 bg-paper-card hover:border-ink/20"
                  }`}
                >
                  <p className="font-mono text-[10px] text-ink-faint">Page {b.page}</p>
                  <p className="mt-1 line-clamp-2 text-ink-soft">{b.text}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
