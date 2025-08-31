// global.d.ts
declare module "*.mjs?url" {
  const url: string;
  export default url;
}


declare module "pdfjs-dist/legacy/build/pdf.worker.entry";