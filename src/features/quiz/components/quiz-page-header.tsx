"use client";

import { useRouter } from "next/navigation";
import { Brain, Plus, Crown, ArrowUp, Lock } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

import { useCanCreate } from "@/hooks/use-can-create-feature";
import { useGenerateQuizModal } from "../hooks/use-generate-quiz-modal";
import { useHasPermission } from "@/features/dashboard/api/use-has-permission";
import { AccessRestricted } from "@/components/access-restricted";

export const QuizPageHeader = () => {
  const { open } = useGenerateQuizModal();
  const { data: canCreateQuizzes, isLoading: isQuizzesLoading } =
    useCanCreate("quizzes");
  const { data: hasPermission, isLoading: isPermissionLoading } =
    useHasPermission("quiz:create");
  const router = useRouter();

  const hasReachedLimit = !canCreateQuizzes?.quizzes.canCreate;
  const isLoading = isQuizzesLoading || isPermissionLoading;

  return (
    <div className="space-y-4">
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

        {!hasReachedLimit && hasPermission ? (
          <Button onClick={open} className="w-full md:max-w-[200px]">
            <Plus className="size-5" /> Generate New Quiz
          </Button>
        ) : (
          <Button disabled className="w-full md:max-w-[200px] opacity-50">
            <Plus className="size-5" /> Generate New Quiz
          </Button>
        )}
      </header>

      {/* Plan Limit Reached Notice */}
      {hasReachedLimit && hasPermission && !isLoading && (
        <Card className="mx-5 border-blue-200 bg-gradient-to-r from-blue-50 to-primary/5 dark:from-blue-950/20 dark:to-primary/5 dark:border-blue-800">
          <CardContent className="p-4">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-full">
                  <Crown className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="text-lg font-semibold text-blue-800 dark:text-blue-200">
                    Quiz Limit Reached
                  </h3>
                  <Badge
                    variant="outline"
                    className="border-blue-300 text-blue-700 dark:border-blue-600 dark:text-blue-300"
                  >
                    Limit Reached
                  </Badge>
                </div>
                <p className="text-sm text-blue-700 dark:text-blue-300 mb-4">
                  You've reached your current plan's quiz generation limit.
                  Upgrade to continue creating unlimited quizzes and unlock
                  premium features.
                </p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button
                    size="sm"
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                    onClick={() => router.push("/pricing")}
                  >
                    <ArrowUp className="w-4 h-4 mr-2" />
                    Upgrade Plan
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-blue-300 text-blue-700 hover:bg-blue-50 dark:border-blue-600 dark:text-blue-300 dark:hover:bg-blue-900/20"
                    onClick={() => router.push("/pricing")}
                  >
                    View Plan Details
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
      {!hasPermission && !isLoading && (
        <AccessRestricted feature="quiz creation" />
      )}
    </div>
  );
};
