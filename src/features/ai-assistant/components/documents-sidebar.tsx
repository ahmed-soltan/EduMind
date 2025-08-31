"use client";

import { useState } from "react";
import { IconFiles } from "@tabler/icons-react";
import { Loader2, Menu, Plus } from "lucide-react";

import { DocumentCard } from "./document-card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { SIDEBAR_WIDTH_MOBILE } from "@/components/ui/sidebar";

import { useGetDocuments } from "../api/use-get-documents";
import { useCreateDocumentModal } from "../hooks/use-create-document-modal";

import { Document } from "@/db/types";

export const DocumentsSidebar = () => {
  const [open, setOpen] = useState(false);
  const { data: documents, isLoading } = useGetDocuments();
  const { open: openAddDocumentModal } = useCreateDocumentModal();

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild className="absolute bottom-5 left-5">
        <Button variant="secondary" size={"icon"} className="max-w-[50px] z-50">
          <Menu className="size-6" />
        </Button>
      </SheetTrigger>
      <SheetContent
        data-sidebar="sidebar"
        data-slot="sidebar"
        data-mobile="true"
        overlayClassNames={"inset-x-[15%] z-0 w-full"}
        className="text-sidebar-foreground [&>button]:hidden z-[2] p-4 space-y-2 h-full fixed 
        md:left-72 left-0 top-13 w-max-sm sm:w-full"
        style={
          {
            "--sidebar-width": SIDEBAR_WIDTH_MOBILE,
          } as React.CSSProperties
        }
        side={"left"}
      >
        <SheetHeader className="p-0">
          <SheetTitle className="flex items-center justify-start text-3xl gap-1">
            <IconFiles className="size-8" />
            Documents ({documents?.length ?? 0})
          </SheetTitle>
        </SheetHeader>
        <div className="w-full">
          <Button className="w-full" onClick={openAddDocumentModal}>
            <Plus className="size-5" />
            Add New Document
          </Button>
        </div>
        <Separator />
        <div className="flex h-full w-full flex-col">
          {isLoading ? (
            <div className="h-full flex items-center justify-center">
              <Loader2 className="animate-spin size-5" />
            </div>
          ) : documents && documents.length > 0 ? (
            <div className="overflow-y-auto gap-4 flex flex-col">
              {documents.map((doc: Document) => (
                <DocumentCard key={doc.id} document={doc} />
              ))}
            </div>
          ) : (
            <div className="h-full flex items-center justify-center">
              No documents found.
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};
