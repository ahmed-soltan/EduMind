"use client";

import { ResponsiveModal } from "@/components/responsive-modal";
import { CreateAIGeneratedFlashCardForm } from "./create-ai-generate-flashcards-form";

import { useCreateAIGeneratedFlashCardModal } from "../hooks/use-create-ai-generated-flash-card-modal";


export const CreateAIGeneratedFlashCardModal = () => {
  const { close, isOpen, setIsOpen } = useCreateAIGeneratedFlashCardModal();
  return (
    <ResponsiveModal open={isOpen} onOpenChange={setIsOpen}>
      <CreateAIGeneratedFlashCardForm onCancel={close} />
    </ResponsiveModal>
  );
};
