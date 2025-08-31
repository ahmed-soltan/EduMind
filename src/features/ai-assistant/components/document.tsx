// components/PdfViewer.tsx
'use client';

import { Viewer, Worker } from '@react-pdf-viewer/core';
import { defaultLayoutPlugin } from '@react-pdf-viewer/default-layout';
import '@react-pdf-viewer/core/lib/styles/index.css';
import '@react-pdf-viewer/default-layout/lib/styles/index.css';

export default function PdfViewer({ fileUrl }: { fileUrl: string }) {
  const defaultLayoutPluginInstance = defaultLayoutPlugin();

  if(!fileUrl) return null

  return (
    <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.4.120/build/pdf.worker.js">
      <div className='z-[-1] h-[85vh] lg:h-[94vh]'>
        <Viewer fileUrl={fileUrl} plugins={[defaultLayoutPluginInstance]} />
      </div>
    </Worker>
  );
}
