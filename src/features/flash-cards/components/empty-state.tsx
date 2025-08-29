import { Button } from "@/components/ui/button";
import { Brain, Plus, Sparkles } from "lucide-react";
import { useCreateFlashCardModal } from "../hooks/use-create-flash-card-modal";
import { useCreateAIGeneratedFlashCardModal } from "../hooks/use-create-ai-generated-flash-card-modal";

export const EmptyState = () => {
  const { open: openCreateFlashCardModal } = useCreateFlashCardModal();
  const { open: openCreateAIGeneratedFlashCardModal } =
    useCreateAIGeneratedFlashCardModal();

  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mb-6">
        <Brain className="w-12 h-12 text-primary" />
      </div>
      <h3 className="text-xl font-semibold mb-2">No flashcards yet</h3>
      <p className="text-muted-foreground text-center mb-6 max-w-md">
        Start building your knowledge by creating flashcards or let AI generate
        them for you.
      </p>
      <div className="flex gap-3">
        <Button
          className="bg-primary hover:bg-primary/90"
          onClick={openCreateFlashCardModal}
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Flashcard
        </Button>
        <Button variant="outline" onClick={openCreateAIGeneratedFlashCardModal}>
          <Sparkles className="w-4 h-4 mr-2" />
          Generate with AI
        </Button>
      </div>
    </div>
  );
};
