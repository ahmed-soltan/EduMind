import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Quiz, QuizAttempt } from "@/db/types";
import { cn } from "@/lib/utils";
import { Clock, Eye, Hash, Play, Trash2 } from "lucide-react";
import Link from "next/link";
import { useDeleteQuiz } from "../api/use-delete-quiz";
import { useState } from "react";
import { ConfirmModal } from "@/components/confirm-modal";

interface QuizCardProps {
  quiz: Quiz;
  quizAttempt: QuizAttempt;
}

export const QuizCard = ({ quiz, quizAttempt }: QuizCardProps) => {
  const [open, setOpen] = useState(false);
  const { mutate: deleteQuiz, isPending } = useDeleteQuiz();
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "easy":
        return "bg-emerald-300/20 text-emerald-300 border-success/30";
      case "medium":
        return "bg-yellow-500/20 text-yellow-300 border-warning/30";
      case "hard":
        return "bg-red-500/20 text-red-300 border-destructive/30";
      default:
        return "bg-muted/20 text-muted-foreground border-muted/30";
    }
  };

  const getDifficultyIcon = (difficulty: string) => {
    switch (difficulty) {
      case "easy":
        return "🟢";
      case "medium":
        return "🟡";
      case "hard":
        return "🔴";
      default:
        return "⚪";
    }
  };

  return (
    <>
      <ConfirmModal
        title="Are you sure you want to delete this quiz?"
        message="This action cannot be undone."
        callbackFn={() => deleteQuiz(quiz.id)}
        open={open}
        setOpen={setOpen}
        variant="destructive"
      />
      <Card
        key={quiz.id}
        className="bg-card border-border shadow-soft hover:shadow-elegant transition-all duration-300 group cursor-select"
      >
        <CardHeader className="pb-4">
          <div className="flex items-start justify-between mb-3">
            <Badge
              variant="secondary"
              className="bg-primary/10 text-primary border-primary/20"
            >
              {quiz.topic}
            </Badge>
            <div className="flex items-center gap-1 text-sm">
              <span>{getDifficultyIcon(quiz.difficulty!)}</span>
              <Badge className={getDifficultyColor(quiz.difficulty!)}>
                {quiz.difficulty}
              </Badge>
              {quizAttempt ? (
                <Badge variant="secondary" className="bg-[#10B981] ml-1">
                  Solved
                </Badge>
              ) : (
                <Badge
                  variant="secondary"
                  className="bg-blue-400/20 text-blue-500 border-blue-600 ml-1"
                >
                  {new Date(quiz.createdAt).getTime() < Date.now() + 1
                    ? "New"
                    : "Not Attempted"}
                </Badge>
              )}
            </div>
          </div>
          <div className="flex items-center justify-between flex-wrap">
            <CardTitle className="text-foreground font-heading group-hover:text-primary transition-colors">
              {quiz.title}
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              {new Date(quiz.createdAt).toLocaleDateString()}
            </p>
          </div>
        </CardHeader>

        <CardContent className="pb-4">
          <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
            {quiz.description}
          </p>

          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Hash className="w-4 h-4" />
              <span>{quiz.numQuestions} questions</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              <span>{quiz.estimatedTime} min</span>
            </div>
            {quizAttempt && (
              <div>
                Score:{" "}
                <span
                  className={cn(
                    quizAttempt.score! >= 80
                      ? "text-emerald-500"
                      : quizAttempt.score! >= 50
                      ? "text-yellow-500"
                      : "text-red-500"
                  )}
                >
                  {quizAttempt.score}%
                </span>
              </div>
            )}
          </div>
        </CardContent>

        <CardFooter className="pt-0 mt-auto flex items-center gap-2">
          {quizAttempt ? (
            <Button
              asChild
              variant={"outline"}
              className="flex-1"
              disabled={isPending}
            >
              <Link href={`/quiz-interface/${quiz.id}/result`}>
                <Eye className="w-4 h-4 mr-2" />
                View Result
              </Link>
            </Button>
          ) : (
            <Button asChild className="flex-1" disabled={isPending}>
              <Link href={`/quiz-interface/${quiz.id}`}>
                <Play className="w-4 h-4 mr-2" />
                Start Quiz
              </Link>
            </Button>
          )}
          <Button
            size={"icon"}
            type="button"
            className="bg-red-500/60 hover:bg-red-500/70"
            onClick={() => setOpen(true)}
            disabled={isPending}
          >
            <Trash2 className="size-5" />
          </Button>
        </CardFooter>
      </Card>
    </>
  );
};
