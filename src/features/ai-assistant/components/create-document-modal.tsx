"use client"
import { ResponsiveModal } from "@/components/responsive-modal";
import { AddDocumentForm } from "./add-document-form";
import { useCreateDocumentModal } from "../hooks/use-create-document-modal";

export const CreateDocumentModal = () => {
    const { open, close, isOpen, setIsOpen } = useCreateDocumentModal();
  return (
    <ResponsiveModal open={isOpen} onOpenChange={setIsOpen}>
      <AddDocumentForm onCancel={close}  />
    </ResponsiveModal>
  );
};
