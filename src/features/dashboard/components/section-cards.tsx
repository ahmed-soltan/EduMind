"use client";

import Link from "next/link";
import {
  IconCards,
  IconTrendingDown,
  IconTrendingUp,
} from "@tabler/icons-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { cn } from "@/lib/utils";

import { useGetFlashCards } from "../api/use-get-flash-cards";
import { useGetQuizzes } from "../../quiz/api/use-get-quizzes";
import { useGetDocuments } from "@/features/ai-assistant/api/use-get-documents";
import { useGetDecks } from "@/features/decks/api/use-get-decks";

export function SectionCards() {
  const { data: quizzes, isLoading: isLoadingQuizzes } = useGetQuizzes();
  const { data: flashcards, isLoading: isLoadingFlashcards } =
    useGetFlashCards();
  const { data: documents, isLoading: isLoadingDocuments } = useGetDocuments();
  const { data: decks, isLoading: isLoadingDecks } = useGetDecks();

  const isLoading =
    isLoadingQuizzes ||
    isLoadingFlashcards ||
    isLoadingDocuments ||
    isLoadingDecks;

  if (isLoading) {
    return (
      <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
        <Card className="@container/card h-40 border-neutral-500">
          <CardHeader>
            <Skeleton className="w-32 h-10" />
            <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
              <Skeleton className="w-32 h-5" />
            </CardTitle>
            <CardAction>
              <Badge variant="outline">
                <Skeleton className="w-32 h-5" />
              </Badge>
            </CardAction>
          </CardHeader>
        </Card>
        <Card className="@container/card h-40 border-neutral-500">
          <CardHeader>
            <Skeleton className="w-32 h-10" />
            <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
              <Skeleton className="w-32 h-5" />
            </CardTitle>
            <CardAction>
              <Badge variant="outline">
                <Skeleton className="w-32 h-5" />
              </Badge>
            </CardAction>
          </CardHeader>
        </Card>
        <Card className="@container/card h-40 border-neutral-500">
          <CardHeader>
            <Skeleton className="w-32 h-10" />
            <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
              <Skeleton className="w-32 h-5" />
            </CardTitle>
            <CardAction>
              <Badge variant="outline">
                <Skeleton className="w-32 h-5" />
              </Badge>
            </CardAction>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-3">
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Total Quizzes</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {quizzes.quizzes.length}
          </CardTitle>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1 text-sm">
          <div className="line-clamp-1 flex gap-1 font-medium items-center">
            Average Score:{" "}
            <span
              className={cn(
                quizzes.averageScore < 50 ? "text-red-500" : "text-green-500",
                "font-semibold"
              )}
            >
              {quizzes.averageScore.toFixed(2)}%
            </span>{" "}
            {quizzes.averageScore < 50 ? (
              <IconTrendingDown className="size-4" />
            ) : (
              <IconTrendingUp className="size-4" />
            )}
          </div>
          <div className="text-muted-foreground">
            Total Attempts: {quizzes.totalAttempts}
          </div>
        </CardFooter>
      </Card>
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Total Flashcards Decks</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {decks.length || 0}
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <IconCards className="size-4" />
              {flashcards.flashcards.length}
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start text-sm">
          <div className="line-clamp-1 flex font-medium">
            
            <p className="block">
              Total flashcards: {flashcards.flashcards.length}
            </p>
          </div>
          <Button variant="link" className="px-0 text-sm">
            <Link href={"dashboard/decks"} className="text-blue-500">
              View all Flashcards Decks →
            </Link>
          </Button>
        </CardFooter>
      </Card>
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Total Documents</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {documents.length || 0}
          </CardTitle>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-2 text-sm">
          <Button variant="link" className="px-0 text-sm">
            <Link href={"dashboard/ai-assistant"} className="text-blue-500">
              View all documents →
            </Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
