"use client";

import dynamic from "next/dynamic";

import { useGetDocument } from "@/features/ai-assistant/api/use-get-document";

const PdfViewerClient = dynamic(() => import("./pdf-viewer-client"), {
  ssr: false,
});

const DocumentIdPage = () => {
  const { data, isLoading } = useGetDocument();

  if (isLoading) return <div>Loading...</div>;

  return (
    <div className="w-full">
      <PdfViewerClient fileUrl={data.url} />
    </div>
  );
};

export default DocumentIdPage;
