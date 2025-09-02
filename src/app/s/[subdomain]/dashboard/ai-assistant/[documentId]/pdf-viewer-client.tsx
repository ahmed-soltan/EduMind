// components/PdfViewerClient.tsx

'use client';

import dynamic from 'next/dynamic';

const PdfViewer = dynamic(() => import('@/features/ai-assistant/components/document'), {
  ssr: false,
});

export default function PdfViewerClient({ fileUrl }: { fileUrl: string }) {
  return <PdfViewer fileUrl={fileUrl} />;
}
