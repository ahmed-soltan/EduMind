"use client";

import { Plus, Sparkles, Crown } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Hint } from "@/components/hint";
import { useCanCreate } from "@/hooks/use-can-create-feature";

import { useCreateFlashCardModal } from "../hooks/use-create-flash-card-modal";
import { useCreateAIGeneratedFlashCardModal } from "../hooks/use-create-ai-generated-flash-card-modal";
import { AccessRestricted } from "@/components/access-restricted";
import { useHasPermission } from "@/features/dashboard/api/use-has-permission";

export const FlashCardActionButtons = () => {
  const { open: createFlashCardModal } = useCreateFlashCardModal();
  const { open: openCreateAIGeneratedFlashCardModal } =
    useCreateAIGeneratedFlashCardModal();

  // Check limits for flashcards and AI generation
  const { data: flashCardLimits } = useCanCreate("flashcards");
  const { data: hasPermission, isLoading } = useHasPermission("flashcard:create");

  const canCreateFlashCard = flashCardLimits?.canCreate ?? true;

  return (
    <>
      <Hint
        label={
          !canCreateFlashCard
            ? "Upgrade your plan to create more flashcards"
            : "Add a new flashcard"
        }
        side="bottom"
      >
        <div className={!canCreateFlashCard ? "cursor-not-allowed" : ""}>
          <Button
            className="gap-2"
            onClick={canCreateFlashCard ? createFlashCardModal : undefined}
            disabled={!canCreateFlashCard}
          >
            <Plus className="w-4 h-4" />
            Add Flashcard
            {!canCreateFlashCard && (
              <Crown className="w-4 h-4 ml-1 text-yellow-500" />
            )}
          </Button>
        </div>
      </Hint>

      <Hint
        label={
          !canCreateFlashCard
            ? "Upgrade your plan to use AI-powered flashcard generation"
            : "Generate flashcards using AI"
        }
        side="bottom"
      >
        <div className={!canCreateFlashCard ? "cursor-not-allowed" : ""}>
          <Button
            variant="outline"
            className="gap-2"
            onClick={
              canCreateFlashCard
                ? openCreateAIGeneratedFlashCardModal
                : undefined
            }
            disabled={!canCreateFlashCard || !hasPermission}
          >
            <Sparkles className="w-4 h-4" />
            Generate with AI
            {!canCreateFlashCard && (
              <Crown className="w-4 h-4 ml-1 text-yellow-500" />
            )}
          </Button>
        </div>
      </Hint>
    </>
  );
};
