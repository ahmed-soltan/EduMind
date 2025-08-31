
import { cookies } from "next/headers";
import React from "react";
import PdfViewerClient from "./pdf-viewer-client";

const DocumentIdPage = async ({
  params,
}: {
  params: Promise<{ documentId: string }>;
}) => {
  const { documentId } = await params;
  const cookieStore = await cookies();

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL}/api/documents/${documentId}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Cookie: cookieStore.toString(),
      },
    }
  );
  const data = await res.json();

  if (!data) return null;

  return (
    <div className="w-full">
      <PdfViewerClient fileUrl={data.url} />
    </div>
  );
};

export default DocumentIdPage;
