"use client";

import { BookOpen } from "lucide-react";

import { QuizCard } from "./quiz-card";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { useGetQuizzes } from "../api/use-get-quizzes";

import { QuizData } from "@/db/types";

export const QuizList = () => {
  const { data, isLoading } = useGetQuizzes();

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
  if (!data || data.quizzes.length === 0) {
    return (
      <div className="text-center flex items-center justify-center flex-col py-16">
        <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
          <BookOpen className="w-10 h-10 text-muted-foreground" />
        </div>
        <h3 className="text-xl font-heading font-semibold text-foreground mb-2">
          No quizzes found
        </h3>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-5">
      {data.quizzes.map((quizData: QuizData) => (
        <QuizCard
          quiz={quizData.quiz}
          key={quizData.quiz.id}
          quizAttempt={quizData.quizAttempt}
        />
      ))}
    </div>
  );
};
