// pdfjs-dist ships its main types under the package root, but this project
// dynamically imports the legacy "build/pdf" subpath (needed for the classic
// GlobalWorkerOptions API used in lib/pdf.ts), which has no bundled .d.ts.
// This ambient declaration silences that specific type error during `next build`.
declare module "pdfjs-dist/build/pdf";
