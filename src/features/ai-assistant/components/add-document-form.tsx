// components/AddDocumentForm.tsx  (or wherever you keep it)
"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { UploadDropzone } from "@/utils/uploadthing";
import { useState } from "react";
import { useAddDocument } from "../api/use-add-document";
import { Loader2 } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { extractPdfTextFromArrayBuffer } from "@/utils/extract-pdf-text";

interface AddDocumentFormProps {
  onCancel: () => void;
}

export type UploadedFileMetadata = {
  key: string;
  title: string;
  size: number;
  type: string;
  url: string;
};

export const AddDocumentForm = ({ onCancel }: AddDocumentFormProps) => {
  const [value, setValue] = useState<UploadedFileMetadata | null>(null);
  const [extractedText, setExtractedText] = useState<string | null>(null);
  const { mutateAsync, isPending } = useAddDocument();
  const router = useRouter();
  const pathname = usePathname();

  const handleAddDocument = async () => {
    if (!value) return;

    const payload = {
      title: value.title,
      url: value.url,
      size: value.size,
      type: value.type,
      key: value.key,
      text: extractedText ?? undefined,
    };

    const documentId = await mutateAsync(payload);
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
          onClientUploadComplete={async (res) => {
            // UploadThing returns an array; pick first item
            const uploaded = res?.[0];
            if (!uploaded) {
              alert("Upload failed or returned no file metadata.");
              return;
            }

            // normalize shape
            const meta: UploadedFileMetadata = {
              key: uploaded.key ?? "",
              title: uploaded.name ?? uploaded.key ?? "untitled",
              size: uploaded.size ?? 0,
              type: uploaded.type ?? "application/pdf",
              url: uploaded.ufsUrl ?? uploaded.url  ?? "",
            };

            setValue(meta);

            // try to fetch the uploaded file (browser). Might fail due to CORS or signed/private urls
            try {
              const resp = await fetch(meta.url);
              if (!resp.ok) throw new Error("Fetch failed: " + resp.status);
              const ab = await resp.arrayBuffer();

              // quick sanity check on magic bytes (optional)
              const magic = new Uint8Array(ab).slice(0, 8);
              // if PDF it usually starts with '%PDF'
              // console.log("magic bytes:", new TextDecoder().decode(magic));

              const text = await extractPdfTextFromArrayBuffer(ab);
              setExtractedText(text);
            } catch (err) {
              // fallback: call server proxy that fetches and extracts
              console.warn("Client fetch/extract failed, calling server proxy:", err);
              try {
                const proxyRes = await fetch("/api/extract-proxy", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ url: meta.url }),
                });
                const json = await proxyRes.json();
                if (!proxyRes.ok) {
                  console.warn("Proxy failed:", json);
                  setExtractedText(null);
                } else {
                  setExtractedText(json.text ?? "");
                }
              } catch (e2) {
                console.error("Server proxy failed:", e2);
                setExtractedText(null);
              }
            }
          }}
          onUploadError={(error: Error) => {
            alert(`ERROR! ${error.message}`);
          }}
          className="w-full h-48 rounded-2xl p-5 border-1 border-dashed border-slate-400 bg-transparent flex items-center justify-center text-center transition-all duration-300 ease-in-out hover:border-blue-400 hover:from-slate-700 hover:to-slate-800 shadow-lg cursor-pointer ut-label:text-lg ut-label:font-semibold ut-label:text-slate-200 ut-allowed-content:text-slate-400 ut-allowed-content:text-sm ut-button:bg-secondary -ut-button:py-4 ut-button:hover:bg-blue-500 ut-button:text-white ut-button:w-full ut-button:max-w-[200px] ut-uploading:animate-pulse ut-uploading:ut-label:text-blue-300"
        />

        <div>
          <div className="mb-2 font-semibold">Preview:</div>
          <div className="text-sm text-slate-500">
            {value ? (
              <>
                <div>{value.title}</div>
                <div className="text-xs text-slate-400">{value.size} bytes</div>
                <div className="text-xs text-slate-400">{value.url}</div>
              </>
            ) : (
              <div>No file selected</div>
            )}
          </div>
        </div>

        <CardFooter className="flex justify-end p-0">
          <Button disabled={!value || isPending || !extractedText} onClick={handleAddDocument}>
            {isPending && <Loader2 className="animate-spin size-4" />}
            Add Document
          </Button>
        </CardFooter>
      </CardContent>
    </Card>
  );
};
