import { cn } from "@/lib/utils";
import { useQuiz } from "./quiz-context-provider";
import { QuizQuestions } from "@/db/types";

export const QuizInterfaceSidebar = ({
  quizQuestions,
}: {
  quizQuestions: QuizQuestions[];
}) => {
  const { currentQuestionId, answeredQuestions, setCurrentQuestionId } =
    useQuiz();

  return (
    <div className="flex flex-col items-start gap-4 border-r border-border h-full w-full p-2 ">
      <h1>Quiz Progress</h1>
      <ul className="flex flex-col items-start justify-start gap-2 w-full pr-2 md:h-full h-[250px] overflow-y-auto">
        {Array.from({ length: quizQuestions.length }, (_, i) => (
          <li
            key={i}
            className={cn(
              "flex items-center flex-wrap gap-2 group hover:bg-blue-500/20 w-full rounded-md cursor-pointer p-2",
              {
                "bg-blue-500/20":
                  currentQuestionId === quizQuestions[i].id ||
                  answeredQuestions.some(
                    (q) => q.questionId === quizQuestions[i].id
                  ),
              }
            )}
            onClick={() => setCurrentQuestionId(quizQuestions[i].id)}
          >
            <span
              className={cn(
                "bg-neutral-800 rounded-full size-7 group-hover:bg-blue-500 text-center",
                {
                  "bg-blue-500": currentQuestionId === quizQuestions[i].id,
                  "opacity-50":
                    currentQuestionId !== quizQuestions[i].id &&
                    answeredQuestions.some(
                      (q) => q.questionId === quizQuestions[i].id
                    ),
                }
              )}
            >
              {currentQuestionId !== quizQuestions[i].id &&
              answeredQuestions.some(
                (q) => q.questionId === quizQuestions[i].id
              )
                ? "✓"
                : i + 1}
            </span>
            Question {i + 1}
          </li>
        ))}
      </ul>
    </div>
  );
};
