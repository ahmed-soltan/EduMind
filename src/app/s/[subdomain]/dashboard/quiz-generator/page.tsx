"use client";

import { Suspense } from "react";
import dynamic from "next/dynamic";
import { Loader2 } from "lucide-react";

import { QuizPageHeader } from "@/features/quiz/components/quiz-page-header";

const QuizList = dynamic(
  () =>
    import("@/features/quiz/components/quiz-list").then((mod) => mod.QuizList),
  { ssr: false }
);

const QuizGenerator = () => {
  return (
    <div className="flex flex-col gap-10">
      <QuizPageHeader />
      <Suspense
        fallback={
          <div className="flex items-center justify-center mt-10 w-full h-full">
            <Loader2 className="animate-spin size-5" />
          </div>
        }
      >
        <QuizList />
      </Suspense>
    </div>
  );
};

export default QuizGenerator;
