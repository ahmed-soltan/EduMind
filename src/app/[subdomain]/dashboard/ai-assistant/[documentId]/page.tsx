import React from "react";

const DocumentIdPage = async ({
  params,
}: {
  params: Promise<{ documentId: string }>;
}) => {
  const {documentId} = await params;
  return <div className="w-full">DocumentIdPage: {documentId}</div>;
};

export default DocumentIdPage;
