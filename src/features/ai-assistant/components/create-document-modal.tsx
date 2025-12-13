"use client";

import { ResponsiveModal } from "@/components/responsive-modal";
import { AddDocumentForm } from "./add-document-form";

import { useCreateDocumentModal } from "../hooks/use-create-document-modal";

export const CreateDocumentModal = () => {
  const { close, isOpen } = useCreateDocumentModal();
  return (
    <ResponsiveModal open={isOpen} onOpenChange={close}>
      <AddDocumentForm onCancel={close} />
    </ResponsiveModal>
  );
};
