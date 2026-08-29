"use client";

import { useState } from "react";
import UploadStep from "@/components/UploadStep";
import ProcessingStep from "@/components/ProcessingStep";
import ResultsView from "@/components/ResultsView";
import Header from "@/components/Header";
import { filesToPageImages } from "@/lib/pdf";
import { buildAssessmentResult, applyGrades } from "@/lib/matching";
import type {
  AssessmentResult,
  ExtractedQuestion,
  AnswerBlock,
  ProcessingStage
} from "@/lib/types";

type Step = "upload" | "processing" | "results";

export default function Home() {
  const [step, setStep] = useState<Step>("upload");
  const [stage, setStage] = useState<ProcessingStage>("idle");
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AssessmentResult | null>(null);

  const goHome = () => {
    setStep("upload");
    setStage("idle");
    setError(null);
    setResult(null);
  };

  const runPipeline = async (questionFiles: File[], answerFiles: File[]) => {
    setError(null);
    setStep("processing");

    try {
      setStage("rendering-files");
      const [questionPages, answerPages] = await Promise.all([
        filesToPageImages(questionFiles),
        filesToPageImages(answerFiles)
      ]);

      setStage("extracting-questions");
      const qRes = await fetch("/api/extract-questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pages: questionPages.map((p) => ({
            page: p.page,
            base64: p.base64,
            mimeType: p.mimeType
          }))
        })
      });
      const qData = await qRes.json();
      if (!qRes.ok) throw new Error(qData.error ?? "Question extraction failed.");
      const questions: ExtractedQuestion[] = qData.questions;

      setStage("extracting-answers");
      const aRes = await fetch("/api/extract-answers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pages: answerPages.map((p) => ({
            page: p.page,
            base64: p.base64,
            mimeType: p.mimeType
          })),
          questionLabels: questions.map((q) => q.number)
        })
      });
      const aData = await aRes.json();
      if (!aRes.ok) throw new Error(aData.error ?? "Answer extraction failed.");
      const blocks: AnswerBlock[] = aData.blocks;

      setStage("mapping");
      let assessment = buildAssessmentResult(questions, blocks, answerPages);

      setStage("grading");
      const gradeItems = assessment.questions
        .filter((q) => q.status === "answered")
        .map((q) => ({
          questionId: q.id,
          questionNumber: q.number,
          questionText: q.text,
          maxMarks: q.maxMarks,
          answerText: q.answerBlocks.map((b) => b.text).join("\n")
        }));

      if (gradeItems.length > 0) {
        const gRes = await fetch("/api/grade", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ items: gradeItems })
        });
        const gData = await gRes.json();
        if (gRes.ok) {
          assessment = applyGrades(assessment, gData.grades);
        }
      }

      setResult(assessment);
      setStage("done");
      setStep("results");
    } catch (err: any) {
      setError(err?.message ?? "Something went wrong.");
      setStage("error");
    }
  };

  if (step === "results" && result) {
    return (
      <main className="min-h-screen bg-paper">
        <ResultsView result={result} onHome={goHome} />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-paper">
      <Header />
      {step === "upload" && <UploadStep onSubmit={runPipeline} />}
      {step === "processing" && <ProcessingStep stage={stage} error={error} />}
    </main>
  );
}
