"use client";

import { BookOpen } from "lucide-react";

import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { DeckData } from "@/db/types";
import { useGetDecks } from "../api/use-get-decks";
import { DeckCard } from "./deck-card";

export const DecksList = () => {
  const { data, isLoading } = useGetDecks();

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-5">
        {Array.from({ length: 3 }).map((_, index) => (
          <Card key={index}>
            <CardHeader>
              <CardTitle>
                <Skeleton className="h-4 w-3/4" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Skeleton className="h-24 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }


  if (!data || data.length === 0) {
    return (
      <div className="text-center flex items-center justify-center flex-col py-16">
        <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
          <BookOpen className="w-10 h-10 text-muted-foreground" />
        </div>
        <h3 className="text-xl font-heading font-semibold text-foreground mb-2">
          No decks found
        </h3>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-5">
      {data.map((deck: DeckData) => (
        <DeckCard
          deck={deck}
          key={deck.id}
        />
      ))}
    </div>
  );
};
