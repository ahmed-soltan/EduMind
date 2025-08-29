"use client";

import { Button } from "@/components/ui/button";
import { Brain, Plus } from "lucide-react";
import { useGenerateQuizModal } from "../hooks/use-generate-quiz-modal";

export const QuizPageHeader = () => {
  const { open } = useGenerateQuizModal();
  return (
    <header className="bg-neutral-900 p-5 flex justify-between items-center gap-y-4 flex-wrap">
      <div className="flex items-center gap-3">
        <Brain className="size-10 rounded-lg bg-blue-600" />
        <div className="flex flex-col">
          <h1 className="text-2xl font-semibold">Quiz Generator</h1>
          <p className="text-md text-neutral-400">
            Challenge yourself with AI-generated quizzes
          </p>
        </div>
      </div>
      <Button onClick={open} className="w-full md:max-w-[200px]">
        <Plus className="size-5" /> Generate New Quiz
      </Button>
    </header>
  );
};
