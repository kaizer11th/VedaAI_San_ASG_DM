"use client";

import { useEffect, useMemo, useState } from "react";
import type { AssessmentResult, AnswerBlock } from "@/lib/types";

function bboxStyle(bbox: [number, number, number, number]) {
  const [yMin, xMin, yMax, xMax] = bbox;
  return {
    top: `${yMin / 10}%`,
    left: `${xMin / 10}%`,
    width: `${(xMax - xMin) / 10}%`,
    height: `${(yMax - yMin) / 10}%`
  };
}

const ZOOM_STEPS = [0.75, 1, 1.25, 1.5, 2];

export default function AnswerSheetViewer({
  result,
  selectedId
}: {
  result: AssessmentResult;
  selectedId: string | null;
}) {
  const { answerSheetPages } = result;
  const [pageIndex, setPageIndex] = useState(0);
  const [zoomIdx, setZoomIdx] = useState(1); // index into ZOOM_STEPS

  const selectedBlocks: AnswerBlock[] = useMemo(() => {
    if (!selectedId) return [];
    if (selectedId.startsWith("unmatched:")) {
      const blockId = selectedId.replace("unmatched:", "");
      const b = result.unmatchedAnswers.find((a) => a.id === blockId);
      return b ? [b] : [];
    }
    const q = result.questions.find((q) => q.id === selectedId);
    return q?.answerBlocks ?? [];
  }, [selectedId, result]);

  // Jump to the first page that contains a highlighted block whenever selection changes.
  useEffect(() => {
    if (selectedBlocks.length > 0) {
      const firstPage = selectedBlocks[0].page;
      const idx = answerSheetPages.findIndex((p) => p.page === firstPage);
      if (idx >= 0) setPageIndex(idx);
    }
  }, [selectedBlocks, answerSheetPages]);

  const currentPage = answerSheetPages[pageIndex];
  const blocksOnCurrentPage = selectedBlocks.filter(
    (b) => b.page === currentPage?.page
  );
  const otherPagesWithBlocks = Array.from(
    new Set(selectedBlocks.map((b) => b.page).filter((p) => p !== currentPage?.page))
  );
  const highlightedPageSet = useMemo(
    () => new Set(selectedBlocks.map((b) => b.page)),
    [selectedBlocks]
  );

  if (!currentPage) {
    return (
      <div className="flex h-full items-center justify-center text-sm text-ink-faint">
        No answer sheet pages.
      </div>
    );
  }

  const zoom = ZOOM_STEPS[zoomIdx];

  return (
    <div className="flex h-full flex-col">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-paper-line p-3">
        <h2 className="font-display text-sm font-semibold text-ink">Answer Sheet</h2>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 font-mono text-[11px] text-ink-soft">
            <button
              onClick={() => setPageIndex((i) => Math.max(0, i - 1))}
              disabled={pageIndex === 0}
              className="rounded-md border border-ink/10 px-2 py-1 disabled:opacity-30"
            >
              ‹
            </button>
            <span className="px-1">
              {currentPage.page} / {answerSheetPages.length}
            </span>
            <button
              onClick={() =>
                setPageIndex((i) => Math.min(answerSheetPages.length - 1, i + 1))
              }
              disabled={pageIndex === answerSheetPages.length - 1}
              className="rounded-md border border-ink/10 px-2 py-1 disabled:opacity-30"
            >
              ›
            </button>
          </div>
          <div className="flex items-center gap-1 font-mono text-[11px] text-ink-soft">
            <button
              onClick={() => setZoomIdx((i) => Math.max(0, i - 1))}
              disabled={zoomIdx === 0}
              className="rounded-md border border-ink/10 px-2 py-1 disabled:opacity-30"
            >
              −
            </button>
            <span className="w-9 text-center">{Math.round(zoom * 100)}%</span>
            <button
              onClick={() => setZoomIdx((i) => Math.min(ZOOM_STEPS.length - 1, i + 1))}
              disabled={zoomIdx === ZOOM_STEPS.length - 1}
              className="rounded-md border border-ink/10 px-2 py-1 disabled:opacity-30"
            >
              +
            </button>
          </div>
        </div>
      </div>

      {otherPagesWithBlocks.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 border-b border-warn/20 bg-warn-soft px-3 py-2 text-xs text-warn">
          This answer also continues on page{otherPagesWithBlocks.length > 1 ? "s" : ""}:
          {otherPagesWithBlocks.map((p) => (
            <button
              key={p}
              onClick={() => {
                const idx = answerSheetPages.findIndex((pg) => pg.page === p);
                if (idx >= 0) setPageIndex(idx);
              }}
              className="rounded-md bg-white px-2 py-0.5 font-mono font-semibold text-warn"
            >
              {p}
            </button>
          ))}
        </div>
      )}

      <div className="flex flex-1 overflow-hidden">
        {/* Thumbnail rail — real PDF-viewer style page navigation */}
        {answerSheetPages.length > 1 && (
          <div className="hidden w-20 shrink-0 space-y-2 overflow-y-auto border-r border-paper-line bg-paper p-2 sm:block">
            {answerSheetPages.map((p, i) => (
              <button
                key={p.page}
                onClick={() => setPageIndex(i)}
                className={`relative block w-full overflow-hidden rounded-md border-2 transition ${
                  i === pageIndex ? "border-accent" : "border-transparent hover:border-ink/15"
                }`}
              >
                <img src={p.dataUrl} alt={`Page ${p.page} thumbnail`} className="w-full" />
                {highlightedPageSet.has(p.page) && (
                  <span className="absolute right-0.5 top-0.5 h-2 w-2 rounded-full bg-accent" />
                )}
                <span className="absolute bottom-0 left-0 right-0 bg-ink/70 py-0.5 text-center font-mono text-[9px] text-white">
                  {p.page}
                </span>
              </button>
            ))}
          </div>
        )}

        <div className="relative flex-1 overflow-auto bg-paper p-4">
          <div
            className="relative mx-auto transition-[width] duration-150"
            style={{ width: `${zoom * 100}%`, maxWidth: zoom <= 1 ? "640px" : "none" }}
          >
            <img
              src={currentPage.dataUrl}
              alt={`Answer sheet page ${currentPage.page}`}
              className="w-full rounded-lg border border-ink/10 bg-white shadow-sm"
            />
            {blocksOnCurrentPage.map((b) => (
              <div
                key={b.id}
                style={bboxStyle(b.bbox)}
                className="absolute rounded-md border-2 border-dashed border-accent bg-accent/10 shadow-[0_0_0_2px_rgba(255,255,255,0.6)]"
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
