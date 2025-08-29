"use client";

import {
  Dropzone,
  DropzoneContent,
  DropzoneEmptyState,
} from "@/components/ui/kibo-ui/dropzone";
import { useState } from "react";

interface FileUploadProps {
  value: File[] | undefined | File;
  onChange: (files: File[] | File) => void;
  accept: string;
  max?: number;
}

export const FileUpload = ({ value, onChange, accept, max=1 }: FileUploadProps) => {
  const [files, setFiles] = useState<File[] | undefined>();

  const handleDrop = (files: File[]) => {
    onChange(files);
    setFiles(files);
  };

  return (
    <Dropzone
      accept={{ [accept]: [] }}
      maxFiles={max}
      maxSize={1024 * 1024 * 10}
      minSize={1024}
      onDrop={handleDrop}
      onError={console.error}
      src={files}
    >
      <DropzoneEmptyState />
      <DropzoneContent />
    </Dropzone>
  );
};
