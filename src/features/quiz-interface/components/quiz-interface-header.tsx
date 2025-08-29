"use client";
import React from "react";
import { Logo } from "@/components/logo";
import { QuizTimer } from "./quiz-timer";
import { Attempt, QuizInterface } from "@/db/types";

interface QuizInterfaceHeaderProps {
  quiz: QuizInterface;
  attempt: Attempt | null;
}

export const QuizInterfaceHeader = React.memo(
  ({ quiz, attempt }: QuizInterfaceHeaderProps) => {
    return (
      <header className="w-full bg-neutral-900 p-5 border-b border-border">
        <div className="w-full max-w-[1000px] mx-auto flex items-center justify-between">
          <Logo />
          <div className="flex items-center gap-6">
            <QuizTimer quiz={quiz} attempt={attempt} />
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold">{quiz?.quiz.title}</h1>
            </div>
          </div>
        </div>
      </header>
    );
  }
);
