"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useMemo, useState } from "react";
import { CheckCircle, Loader2, XCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { QuizInterfaceSidebar } from "./quiz-interface-sidebar";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

import { getInitialCounter } from "./quiz-timer";
import { useQuiz } from "./quiz-context-provider";
import { useQuizAttempt } from "../api/use-quiz-attempt";
import { useQuizAnswering } from "../hooks/use-quiz-answering";

import { cn } from "@/lib/utils";
import { Attempt, QuizInterface as QuizInterfaceT } from "@/db/types";



interface QuizInterfaceProps {
  quiz: QuizInterfaceT;
  attempt: Attempt | null; // null if in solving mode
  subdomain: string | null;
}

export const QuizInterface = React.memo(
  ({ quiz, attempt, subdomain }: QuizInterfaceProps) => {
    const { answeredQuestions, addAnsweredQuestion, resetQuiz } = useQuiz();

    const {
      currentAnswer,
      handleAnswer,
      handleNext,
      handleBack,
      isFirstQuestion,
      isLastQuestion,
      currentQuestion,
      currentQuestionCorrectAnswer,
      currentQuestionExplanation,
    } = useQuizAnswering(quiz);

    const [error, setError] = useState<string | null>(null);
    const router = useRouter();
    const { mutateAsync, isPending } = useQuizAttempt(quiz.quiz.id);

    if (!quiz) return null;

    /** Build a lookup of answers when reviewing an attempt */
    const attemptAnswersMap = useMemo(() => {
      if (!attempt?.attemptAnswers) return new Map();
      return new Map(
        attempt.attemptAnswers.map((ans) => [
          ans.questionId,
          { answer: ans.answer, isCorrect: ans.isCorrect ?? false },
        ])
      );
    }, [attempt]);

    const isReviewMode = !!attempt?.attempt; // solving vs reviewing

    const handleSubmit = async () => {
      const initialCounter = getInitialCounter(quiz.quiz.id, 0);

      if (initialCounter === 0) {
        setError("Time is up!");
        return;
      }

      await mutateAsync({ answers: answeredQuestions });
      localStorage.removeItem(`quiz-counter-${quiz.quiz.id}`);
      router.push(`${quiz.quiz.id}/result`);
      resetQuiz();
    };

    return (
      <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
        {/* Sidebar with question navigation */}
        <div className="col-span-1 border-r">
          <QuizInterfaceSidebar quizQuestions={quiz.questions} />
        </div>

        {/* Main content */}
        <div className="col-span-1 md:col-span-5 p-4">
          {currentQuestion ? (
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="text-xl">
                  {currentQuestion.questionText}
                </CardTitle>
              </CardHeader>

              <CardContent>
                {/* Options */}
                <RadioGroup
                  value={
                    isReviewMode
                      ? attemptAnswersMap.get(currentQuestion.id)?.answer ?? ""
                      : (currentAnswer as string)
                  }
                  onValueChange={!isReviewMode ? handleAnswer : undefined}
                  className="space-y-2"
                >
                  {currentQuestion.options?.map((opt: string, idx: number) => (
                    <label
                      key={idx}
                      htmlFor={`${currentQuestion.id}-${idx}`}
                      className={cn(
                        "flex items-center space-x-2 rounded-lg border p-2 cursor-pointer",
                        (isReviewMode
                          ? attemptAnswersMap.get(currentQuestion.id)?.answer
                          : currentAnswer) === opt &&
                          "bg-primary/10 border-primary"
                      )}
                    >
                      <RadioGroupItem
                        value={opt}
                        id={`${currentQuestion.id}-${idx}`}
                        disabled={isReviewMode} // disable inputs in review mode
                      />
                      <span>{opt}</span>
                    </label>
                  ))}
                </RadioGroup>

                {/* Feedback when reviewing */}
                {isReviewMode && (
                  <div
                    className={cn(
                      "flex flex-col gap-3 my-4 rounded-xl p-5 border shadow-sm transition",
                      attemptAnswersMap.get(currentQuestion.id)?.isCorrect
                        ? "bg-emerald-300/20 border-emerald-500 text-emerald-500"
                        : "bg-red-300/20 border-red-500 text-red-600"
                    )}
                  >
                    <div className="flex items-center gap-2">
                      {attemptAnswersMap.get(currentQuestion.id)?.isCorrect ? (
                        <CheckCircle className="w-6 h-6 text-emerald-600" />
                      ) : (
                        <XCircle className="w-6 h-6 text-red-600" />
                      )}
                      <h1 className="font-semibold text-lg">
                        {attemptAnswersMap.get(currentQuestion.id)?.isCorrect
                          ? "Correct!"
                          : "Incorrect"}
                      </h1>
                    </div>

                    {attemptAnswersMap.get(currentQuestion.id)?.isCorrect ? (
                      <p className="text-sm">
                        ✅ Your answer{" "}
                        <span className="font-medium">
                          {attemptAnswersMap.get(currentQuestion.id)?.answer}
                        </span>{" "}
                        is correct.
                      </p>
                    ) : (
                      <div className="space-y-2 text-sm">
                        <p>
                          ❌ Your answer:{" "}
                          <span className="font-medium">
                            {attemptAnswersMap.get(currentQuestion.id)?.answer}
                          </span>
                        </p>
                        <p>
                          ✅ Correct answer:{" "}
                          <span className="font-medium">
                            {currentQuestionCorrectAnswer}
                          </span>
                        </p>
                      </div>
                    )}

                    {currentQuestionExplanation && (
                      <div className="my-2 rounded-lg p-4 border bg-slate-50 text-slate-700">
                        <h2 className="font-semibold mb-1">Explanation</h2>
                        <p className="text-sm">{currentQuestionExplanation}</p>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            <p>Select a question from the sidebar</p>
          )}

          {/* Actions */}
          <div className="flex gap-2 mt-4">
            <Button
              variant="secondary"
              onClick={handleBack}
              disabled={isFirstQuestion}
            >
              Back
            </Button>

            {isLastQuestion ? (
              error ? (
                <div className="flex items-center gap-5">
                  <Button asChild>
                    <Link href={`/${subdomain}/dashboard/quiz-generator`}>
                      Back To Dashboard
                    </Link>
                  </Button>
                  <p className="text-red-600 font-medium">{error}</p>
                </div>
              ) : !isReviewMode && (
                <Button
                  onClick={handleSubmit}
                  disabled={
                    answeredQuestions.length < quiz.questions.length ||
                    isPending ||
                    !!error
                  }
                >
                  {isPending ? (
                    <div className="flex items-center gap-1">
                      <Loader2 className="size-4 animate-spin" /> Calculating
                      your Result
                    </div>
                  ) : (
                    "Submit"
                  )}
                </Button>
              )
            ) : (
              !isReviewMode && (
                <Button onClick={handleNext} disabled={!currentAnswer}>
                  Next
                </Button>
              )
            )}
            {isReviewMode && (
              <Button asChild>
                <Link href={`/${subdomain}/dashboard/quiz-generator`}>
                  Back To Dashboard
                </Link>
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  }
);
