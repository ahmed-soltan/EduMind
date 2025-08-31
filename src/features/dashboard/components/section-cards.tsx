"use client";
import { IconTrendingDown, IconTrendingUp } from "@tabler/icons-react";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useGetQuizzes } from "../../quiz/api/use-get-quizzes";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { useGetFlashCards } from "../api/use-get-flash-cards";

export function SectionCards() {
  const { data: quizzes, isLoading: isLoadingQuizzes } = useGetQuizzes();
  const { data: flashcards, isLoading: isLoadingFlashcards } =
    useGetFlashCards();

  const isLoading = isLoadingQuizzes || isLoadingFlashcards;

  if (isLoading) {
    return (
      <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
        <Card className="@container/card h-40">
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
        <Card className="@container/card h-40">
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
        <Card className="@container/card h-40">
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
    <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Total Quizzes</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {quizzes.quizzes.length}
          </CardTitle>
          {/* <CardAction>
            <Badge variant="outline">
              <IconTrendingUp />
              +12.5%
            </Badge>
          </CardAction> */}
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
          <CardDescription>Total Flash Cards</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {flashcards.length || 0}
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              {flashcards.flashCardsIncreasePercentage < 0 ? (
                <>
                  <IconTrendingDown />-{flashcards.flashCardsIncreasePercentage}
                  %
                </>
              ) : (
                <>
                  <IconTrendingUp />+{flashcards.flashCardsIncreasePercentage}%
                </>
              )}
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            {flashcards.flashCardsIncreasePercentage < 0 ? (
              <>
                <IconTrendingDown />
              </>
            ) : (
              <>
                <IconTrendingUp />
              </>
            )}
            <p className="block">
              {flashcards.flashCardsIncreasePercentage < 0 ? "Down" : "Up"}{" "}
              {Math.abs(
                flashcards.flashCardsThisMonth - flashcards.flashCardsLastMonth
              )}{" "}
              this Month{" "}
            </p>
          </div>
        </CardFooter>
      </Card>
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Active Accounts</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            45,678
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <IconTrendingUp />
              +12.5%
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Strong user retention <IconTrendingUp className="size-4" />
          </div>
          <div className="text-muted-foreground">Engagement exceed targets</div>
        </CardFooter>
      </Card>
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Growth Rate</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            4.5%
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <IconTrendingUp />
              +4.5%
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Steady performance increase <IconTrendingUp className="size-4" />
          </div>
          <div className="text-muted-foreground">Meets growth projections</div>
        </CardFooter>
      </Card>
    </div>
  );
}
