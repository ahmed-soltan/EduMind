"use client";

import { useMemo } from "react";
import { Loader2 } from "lucide-react";

import { FlashCard } from "./flash-card";
import { EmptyState } from "./empty-state";

import { FlashCard as FlashCardT } from "@/db/types";

import { useFilters } from "../hooks/use-search-query";
import { useGetFlashCards } from "../api/use-get-flash-cards";

interface FlashCardsListProps {
  deckId: string;
}

export const FlashCardsList = ({ deckId }: FlashCardsListProps) => {
  const { data, isLoading } = useGetFlashCards(deckId);

  const { filters } = useFilters();

  const filteredFlashCards = useMemo(() => {
    if (!data) return [];
    const filtered = data.filter(
      (card: FlashCardT) =>
        card.front.toLowerCase().includes(filters.query?.toLowerCase() || "") &&
        (filters.source === "all" || card.source === filters.source)
    );
    return filters.sort === "asc" ? [...filtered].reverse() : filtered;
  }, [data, filters.query, filters.sort, filters.source]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full w-full">
        <Loader2 className="size-6 animate-spin" />
      </div>
    );
  }

  if (filteredFlashCards.length === 0) {
    return <EmptyState />;
  }

  return (
    <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {filteredFlashCards.map((card: FlashCardT) => {
        return <FlashCard key={card.id} card={card} />;
      })}
    </div>
  );
};
