"use client";

const QuizList = dynamic(
  () =>
    import("@/features/quiz/components/quiz-list").then(
      (mod) => mod.QuizList
    ),
  { ssr: false, loading: () => <div>Loading quizzes...</div> }
);
const QuizPageHeader = dynamic(
  () =>
    import("@/features/quiz/components/quiz-page-header").then(
      (mod) => mod.QuizPageHeader
    ),
  { ssr: false, loading: () => <div>Loading quizzes...</div> }
);

import dynamic from "next/dynamic";
import { Suspense } from "react";

const QuizGenerator = () => {
  return (
    <div className="flex flex-col gap-10">
      <QuizPageHeader />
      <Suspense fallback={<div>Loading quizzes...</div>}>
        <QuizList />
      </Suspense>
    </div>
  );
};

export default QuizGenerator;
