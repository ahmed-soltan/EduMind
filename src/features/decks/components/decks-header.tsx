"use client";

import { Button } from "@/components/ui/button";
import { Brain, Plus } from "lucide-react";
import { useCreateDeckModal } from "../hooks/use-create-deck-modal";

export const DecksHeader = () => {
  const { open } = useCreateDeckModal();
  return (
    <header className="bg-neutral-900 p-5 flex justify-between items-center gap-y-4 flex-wrap">
      <div className="flex items-center gap-3">
        <Brain className="size-10 rounded-lg bg-blue-600" />
        <div className="flex flex-col">
          <h1 className="text-2xl font-semibold">Flashcard Decks</h1>
          <p className="text-md text-neutral-400">
            Organize your knowledge and master topics with flashcards
          </p>
        </div>
      </div>
      <Button onClick={open} className="w-full md:max-w-[200px]">
        <Plus className="size-5" /> Create New Deck
      </Button>
    </header>
  );
};
