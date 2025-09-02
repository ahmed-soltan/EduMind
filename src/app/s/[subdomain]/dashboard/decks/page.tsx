import { DecksHeader } from "@/features/decks/components/decks-header";
import { DecksList } from "@/features/decks/components/decks-list";
import React, { Suspense } from "react";

const DecksPage = () => {
  return (
    <div className="flex flex-col gap-10">
      <DecksHeader />
      <Suspense fallback={<div>Loading quizzes...</div>}>
        <DecksList />
      </Suspense>
    </div>
  );
};

export default DecksPage;
