import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trophy, XCircle } from "lucide-react";
import { QuizAttempt } from "@/db/types";
import Link from "next/link";
import { protocol, rootDomain } from "@/lib/utils";

export default function QuizResult({
  quizAttempt,
  subdomain,
}: {
  quizAttempt: QuizAttempt;
  subdomain: string;
}) {
  const passed = quizAttempt.score! >= 50; // change threshold as needed

  return (
    <div className="h-full w-full flex items-center justify-center p-6">
      <Card className="w-full max-w-md rounded-2xl shadow-xl">
        <CardContent className="p-8 flex flex-col items-center gap-6">
          {/* Icon & Title */}
          <div className="flex flex-col items-center">
            {passed ? (
              <Trophy className="w-16 h-16 text-yellow-500 mb-3" />
            ) : (
              <XCircle className="w-16 h-16 text-red-500 mb-3" />
            )}
            <h2 className="text-2xl font-bold">
              {passed ? "Congratulations! 🎉" : "Better Luck Next Time!"}
            </h2>
            <p className="text-muted-foreground text-sm">
              {passed
                ? "You did a great job completing the quiz."
                : "Don’t worry — review and try again!"}
            </p>
          </div>

          {/* Score */}
          <div className="w-full flex flex-col items-center gap-2">
            <h1 className="text-2xl text-center font-bold my-3">Your Score</h1>
            <div className="relative w-32 h-32">
              <svg
                className="absolute top-0 left-0 w-full h-full"
                viewBox="0 0 36 36"
              >
                <path
                  className="text-slate-200"
                  strokeWidth="3.8"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845
                     a 15.9155 15.9155 0 0 1 0 31.831
                     a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className={passed ? "text-green-500" : "text-red-500"}
                  strokeWidth="3.8"
                  stroke="currentColor"
                  fill="none"
                  strokeDasharray={`${quizAttempt.score}, 100`}
                  d="M18 2.0845
                     a 15.9155 15.9155 0 0 1 0 31.831
                     a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-bold">{quizAttempt.score}%</span>
              </div>
            </div>
            {/* <p className="text-sm text-muted-foreground">
              You scored {quizAttempt.score} out of {quizAttempt.total}
            </p> */}
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <Button variant="default" asChild>
              <Link href={`/dashboard/quiz-generator`}>
                Return to Dashboard
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href={`/quiz-interface/${quizAttempt.quizId}`}>
                View Answers
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
