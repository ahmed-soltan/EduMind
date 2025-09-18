"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Crown, ArrowUp } from "lucide-react";

import { FlashCard } from "./flash-card";
import { EmptyState } from "./empty-state";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

import { FlashCard as FlashCardT } from "@/db/types";
import { useCanCreate } from "@/hooks/use-can-create-feature";

import { useFilters } from "../hooks/use-search-query";
import { useGetFlashCards } from "../api/use-get-flash-cards";
import { useHasPermission } from "@/features/dashboard/api/use-has-permission";
import { AccessRestricted } from "@/components/access-restricted";

interface FlashCardsListProps {
  deckId: string;
}

export const FlashCardsList = ({ deckId }: FlashCardsListProps) => {
  const { data, isLoading } = useGetFlashCards(deckId);
  const { data: flashCardLimits, isLoading: limitsLoading } = useCanCreate("flashcards");
  const { data: hasPermission, isLoading: permissionLoading } = useHasPermission("flashcard:create");
  const router = useRouter();

  const { filters } = useFilters();

  const hasReachedLimit = !flashCardLimits?.flashcards.canCreate;

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

  return (
    <div className="space-y-4">
      {/* Plan Limit Reached Notice */}
      {hasReachedLimit && !limitsLoading && (
        <Card className="border-blue-200 bg-gradient-to-r from-blue-50 to-primary/5 dark:from-blue-950/20 dark:to-primary/5 dark:border-blue-800">
          <CardContent className="p-4">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-full">
                  <Crown className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="text-lg font-semibold text-blue-800 dark:text-blue-200">
                    Flashcard Limit Reached
                  </h3>
                  <Badge variant="outline" className="border-blue-300 text-blue-700 dark:border-blue-600 dark:text-blue-300">
                    Limit Reached
                  </Badge>
                </div>
                <p className="text-sm text-blue-700 dark:text-blue-300 mb-4">
                  You've reached your current plan's flashcard creation limit. Upgrade to continue creating unlimited flashcards and unlock premium AI-powered features.
                </p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button 
                    size="sm" 
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                    onClick={() => router.push('/pricing')}
                  >
                    <ArrowUp className="w-4 h-4 mr-2" />
                    Upgrade Plan
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="border-blue-300 text-blue-700 hover:bg-blue-50 dark:border-blue-600 dark:text-blue-300 dark:hover:bg-blue-900/20"
                    onClick={() => router.push('/pricing')}
                  >
                    View Plan Details
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {!hasPermission && !permissionLoading && (
        <AccessRestricted feature="flashcard creation" />
      )}

      {filteredFlashCards.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {filteredFlashCards.map((card: FlashCardT) => {
            return <FlashCard key={card.id} card={card} />;
          })}
        </div>
      )}
    </div>
  );
};
