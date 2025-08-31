// src/lib/extractPdfText.ts
// browser-only PDF text extraction using pdfjs-dist
import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf";
import worker from "pdfjs-dist/legacy/build/pdf.worker.entry";

(pdfjsLib as any).GlobalWorkerOptions.workerSrc = worker;

export async function extractPdfTextFromArrayBuffer(ab: ArrayBuffer): Promise<string> {
  const uint8 = new Uint8Array(ab);
  const loadingTask = (pdfjsLib as any).getDocument({ data: uint8 });
  const pdfDoc = await loadingTask.promise;

  const pageTexts: string[] = [];
  for (let i = 1; i <= pdfDoc.numPages; i++) {
    const page = await pdfDoc.getPage(i);
    const textContent = await page.getTextContent();
    const pageText = textContent.items.map((it: any) => it.str || "").join(" ");
    pageTexts.push(pageText);
  }
  return pageTexts.join("\n\n");
}
