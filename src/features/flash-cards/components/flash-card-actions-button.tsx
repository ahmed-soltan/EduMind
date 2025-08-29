"use client";

import { Plus, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";

import { useCreateFlashCardModal } from "../hooks/use-create-flash-card-modal";
import { useCreateAIGeneratedFlashCardModal } from "../hooks/use-create-ai-generated-flash-card-modal";

export const FlashCardActionButtons = () => {
  const { open: createFlashCardModal } = useCreateFlashCardModal();
  const { open: openCreateAIGeneratedFlashCardModal } =
    useCreateAIGeneratedFlashCardModal();
  return (
    <>
      <Button className="gap-2" onClick={createFlashCardModal}>
        <Plus className="w-4 h-4" />
        Add Flashcard
      </Button>
      <Button
        variant="outline"
        className="gap-2"
        onClick={openCreateAIGeneratedFlashCardModal}
      >
        <Sparkles className="w-4 h-4" />
        Generate with AI
      </Button>
    </>
  );
};
