"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { UploadButton, UploadDropzone } from "@/utils/uploadthing";
import { useState } from "react";
import { useAddDocument } from "../api/use-add-document";
import { Loader2 } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";

interface AddDocumentFormProps {
  onCancel: () => void;
}

export type UploadedFile = {
  key: string;
  title: string; // original file name
  size: number; // in bytes
  type: string; // MIME type, e.g. application/pdf
  url: string; // short utfs.io URL
};

export const AddDocumentForm = ({ onCancel }: AddDocumentFormProps) => {
  const [value, setValue] = useState<any>(undefined);
  const { mutateAsync, isPending } = useAddDocument();
  const router = useRouter();
  const pathname = usePathname()

  const handleAddDocument = async () => {
    const documentId = await mutateAsync({
      title: value.name, // file name
      url: value.ufsUrl, // public URL
      size: value.size, // file size
      type: value.type,
      key: value.key
    });

    router.push(`${pathname}/${documentId}`);
    onCancel?.();
  };

  return (
    <Card className="w-full border-0">
      <CardContent className="w-full space-y-4">
        <CardHeader className="p-0">
          <CardTitle>
            <h1 className="text-2xl">Add Document</h1>
          </CardTitle>
        </CardHeader>
        <UploadDropzone
          endpoint="pdfUploader"
          onClientUploadComplete={(res) => {
            // Do something with the response
            setValue(res[0]);
          }}
          onUploadError={(error: Error) => {
            // Do something with the error.
            alert(`ERROR! ${error.message}`);
          }}
          className="
    w-full h-48 rounded-2xl p-5 border-1 border-dashed border-slate-400
    bg-transparent
    flex items-center justify-center text-center
    transition-all duration-300 ease-in-out
    hover:border-blue-400 hover:from-slate-700 hover:to-slate-800
    shadow-lg
    cursor-pointer
    ut-label:text-lg ut-label:font-semibold ut-label:text-slate-200
    ut-allowed-content:text-slate-400 ut-allowed-content:text-sm
    ut-button:bg-secondary ut-button:hover:bg-blue-500 ut-button:text-white ut-button:w-full ut-button:max-w-[200px]
    ut-uploading:animate-pulse ut-uploading:ut-label:text-blue-300
  "
        />
        <CardFooter className="flex justify-end p-0">
          <Button disabled={!value || isPending} onClick={handleAddDocument}>
            {isPending && <Loader2 className="animate-spin size-4" />}
            Add Document
          </Button>
        </CardFooter>
      </CardContent>
    </Card>
  );
};
