"use client";

import { useState } from "react";
import type { AssessmentResult } from "@/lib/types";
import QuestionsList from "./QuestionsList";
import AnswerSheetViewer from "./AnswerSheetViewer";
import Header from "./Header";

export default function ResultsView({
  result,
  onHome
}: {
  result: AssessmentResult;
  onHome: () => void;
}) {
  const [selectedId, setSelectedId] = useState<string | null>(
    result.questions[0]?.id ?? null
  );
  const [mobileTab, setMobileTab] = useState<"questions" | "sheet">(
    "questions"
  );

  const handleSelect = (id: string) => {
    setSelectedId((prev) => (prev === id ? null : id));
    setMobileTab("sheet");
  };

  return (
    <div className="flex h-dvh flex-col">
      <Header onHome={onHome} />

      {/* Mobile tab switcher */}
      <div className="flex border-b border-paper-line bg-paper-card sm:hidden">
        {(["questions", "sheet"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setMobileTab(tab)}
            className={`flex-1 py-3 text-sm font-semibold transition ${
              mobileTab === tab
                ? "border-b-2 border-accent text-accent"
                : "text-ink-faint"
            }`}
          >
            {tab === "questions" ? "Questions" : "Answer Sheet"}
          </button>
        ))}
      </div>

      <div className="grid flex-1 overflow-hidden sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <div
          className={`overflow-hidden border-r border-paper-line bg-paper-card ${
            mobileTab === "questions" ? "block" : "hidden"
          } sm:block`}
        >
          <QuestionsList
            result={result}
            selectedId={selectedId}
            onSelect={handleSelect}
          />
        </div>
        <div
          className={`overflow-hidden bg-paper-card ${
            mobileTab === "sheet" ? "block" : "hidden"
          } sm:block`}
        >
          <AnswerSheetViewer result={result} selectedId={selectedId} />
        </div>
      </div>
    </div>
  );
}
