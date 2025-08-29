import { useMemo } from "react";
import { useQuiz } from "../components/quiz-context-provider";

export const useQuizAnswering = (data: any) => {
  const {
    currentQuestionId,
    addAnsweredQuestion,
    setCurrentQuestionId,
    answeredQuestions,
  } = useQuiz();

  const currentIndex = useMemo(() => {
    if (!data?.questions) return -1;
    return data.questions.findIndex((q: any) => q.id === currentQuestionId);
  }, [data, currentQuestionId]);

  const currentQuestion =
    currentIndex >= 0 ? data?.questions?.[currentIndex] : null;

    const currentQuestionCorrectAnswer = currentQuestion?.answer;

    const currentQuestionExplanation = currentQuestion?.explanation;

  const isLastQuestion =
    currentIndex >= 0 && currentIndex === data.questions.length - 1;
  const isFirstQuestion = currentIndex === 0;

  const currentAnswer = answeredQuestions.find(
    (a) => a.questionId === currentQuestionId
  )?.answer;

  const handleAnswer = (answer: string) => {
    if (!currentQuestion) return;
    addAnsweredQuestion({ questionId: currentQuestion.id, answer });
  };

  const handleNext = () => {
    if (data?.questions && currentIndex < data.questions.length - 1) {
      setCurrentQuestionId(data.questions[currentIndex + 1].id);
    }
  };

  const handleBack = () => {
    if (data?.questions && currentIndex > 0) {
      setCurrentQuestionId(data.questions[currentIndex - 1].id);
    }
  };


  return {
    currentAnswer: currentAnswer ?? null,
    handleAnswer,
    handleNext,
    handleBack,
    isFirstQuestion,
    isLastQuestion,
    currentQuestion,
    currentQuestionCorrectAnswer,
    currentQuestionExplanation
  };
};
