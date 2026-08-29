"use client";

import type { PageImage } from "./types";

const PDFJS_VERSION = "3.11.174";
const WORKER_SRC = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${PDFJS_VERSION}/pdf.worker.min.js`;

let pdfjsLibPromise: Promise<any> | null = null;

async function getPdfjs() {
  if (!pdfjsLibPromise) {
    // @ts-ignore — pdfjs-dist's deep "build/pdf" subpath has no bundled .d.ts;
    // the top-level package types don't cover this legacy entry point either.
    pdfjsLibPromise = import("pdfjs-dist/build/pdf").then((pdfjs: any) => {
      pdfjs.GlobalWorkerOptions.workerSrc = WORKER_SRC;
      return pdfjs;
    });
  }
  return pdfjsLibPromise;
}

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function dataUrlToBase64(dataUrl: string): string {
  return dataUrl.split(",")[1] ?? "";
}

async function renderPdfToPages(file: File): Promise<PageImage[]> {
  const pdfjs = await getPdfjs();
  const arrayBuffer = await file.arrayBuffer();
  const loadingTask = pdfjs.getDocument({ data: arrayBuffer });
  const pdf = await loadingTask.promise;
  const pages: PageImage[] = [];

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const viewport = page.getViewport({ scale: 2 });
    const canvas = document.createElement("canvas");
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    const ctx = canvas.getContext("2d")!;
    await page.render({ canvasContext: ctx, viewport }).promise;
    const dataUrl = canvas.toDataURL("image/png");
    pages.push({
      page: i,
      dataUrl,
      base64: dataUrlToBase64(dataUrl),
      mimeType: "image/png",
      width: viewport.width,
      height: viewport.height
    });
  }

  return pages;
}

async function imageFileToPage(file: File, pageNumber: number): Promise<PageImage> {
  const dataUrl = await fileToDataUrl(file);
  const dims = await new Promise<{ w: number; h: number }>((resolve) => {
    const img = new Image();
    img.onload = () => resolve({ w: img.width, h: img.height });
    img.src = dataUrl;
  });
  return {
    page: pageNumber,
    dataUrl,
    base64: dataUrlToBase64(dataUrl),
    mimeType: file.type || "image/png",
    width: dims.w,
    height: dims.h
  };
}

// Accepts multiple files (e.g. multiple photos of pages, or a single PDF)
// and returns an ordered array of page images.
export async function filesToPageImages(files: File[]): Promise<PageImage[]> {
  const allPages: PageImage[] = [];
  let pageCounter = 1;

  for (const file of files) {
    if (file.type === "application/pdf") {
      const pdfPages = await renderPdfToPages(file);
      for (const p of pdfPages) {
        allPages.push({ ...p, page: pageCounter });
        pageCounter++;
      }
    } else if (file.type.startsWith("image/")) {
      const page = await imageFileToPage(file, pageCounter);
      allPages.push(page);
      pageCounter++;
    }
  }

  return allPages;
}
