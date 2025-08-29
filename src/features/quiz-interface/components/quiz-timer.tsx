"use client";
import React, { useEffect, useRef, useState } from "react";
import { QuizInterface, Attempt } from "@/db/types";

export function getInitialCounter(quizId: string, initial: number) {
  if (typeof window === "undefined") return initial;
  const stored = localStorage.getItem(`quiz-counter-${quizId}`);
  return stored ? parseInt(stored, 10) : initial;
}

interface QuizTimerProps {
  quiz: QuizInterface;
  attempt: Attempt | null; // If attempt exists → review mode
}

export const QuizTimer = React.memo(({ quiz, attempt }: QuizTimerProps) => {
  const estimatedTime = (quiz?.quiz.estimatedTime ?? 1) * 60;

  const [counter, setCounter] = useState(() =>
    getInitialCounter(quiz?.quiz.id, estimatedTime)
  );
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Only run timer if no attempt (quiz taking mode)
  useEffect(() => {
    if (attempt?.attempt) return; // REVIEW MODE → do not start timer
    if (typeof window === "undefined" || counter <= 0) return;

    intervalRef.current = setInterval(() => {
      setCounter((prev) => {
        if (prev <= 1) {
          localStorage.setItem(`quiz-counter-${quiz?.quiz.id}`, "0");
          if (intervalRef.current) clearInterval(intervalRef.current);
          return 0;
        }
        localStorage.setItem(`quiz-counter-${quiz?.quiz.id}`, String(prev - 1));
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [quiz?.quiz.id, counter, attempt]);

  // Reset counter when quiz changes
  useEffect(() => {
    if (!attempt) {
      setCounter(getInitialCounter(quiz?.quiz.id, estimatedTime));
    }
  }, [quiz?.quiz.id, estimatedTime, attempt]);

  if (attempt?.attempt) {
    // REVIEW MODE → show score instead of timer
    const totalQuestions = quiz?.questions.length ?? 0;
    const correctAnswers =
      attempt?.attemptAnswers?.filter((ans) => ans.isCorrect).length ?? 0;

    return (
      <div className="flex flex-col items-center">
        <span className="text-xs text-muted-foreground">Your Score</span>
        <span className="text-2xl font-mono font-bold px-2 py-1 rounded bg-background border border-border">
          {correctAnswers} / {totalQuestions}
        </span>
      </div>
    );
  }

  // QUIZ MODE → show timer
  return (
    <div className="flex flex-col items-center">
      <span className="text-xs text-muted-foreground">Time Remaining</span>
      <span className="text-2xl font-mono font-bold px-2 py-1 rounded bg-background border border-border">
        {`${Math.floor(counter / 60)}:${(counter % 60)
          .toString()
          .padStart(2, "0")}`}
      </span>
    </div>
  );
});
