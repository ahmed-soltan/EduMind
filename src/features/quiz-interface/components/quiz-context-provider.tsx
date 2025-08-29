"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useMemo,
  ReactNode,
} from "react";

// Define the shape of an answered question
export type AnsweredQuestion = {
  questionId: string;
  answer: string | number | null;
};

type QuizContextType = {
  currentQuestionId: string | null;
  setCurrentQuestionId: (id: string | null) => void;
  answeredQuestions: AnsweredQuestion[];
  addAnsweredQuestion: (question: AnsweredQuestion) => void;
  removeAnsweredQuestion: (questionId: string) => void;
  resetQuiz: () => void;
};

const QuizContext = createContext<QuizContextType | undefined>(undefined);

export function QuizContextProvider({
  quizId,
  children,
}: {
  quizId: string;
  children: ReactNode;
}) {
  const STORAGE_KEY = `quiz_state_${quizId}`;

  const [currentQuestionId, setCurrentQuestionId] = useState<string | null>(() => {
    if (typeof window === "undefined") return null;
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved).currentQuestionId ?? null : null;
  });

  const [answeredQuestions, setAnsweredQuestions] = useState<AnsweredQuestion[]>(() => {
    if (typeof window === "undefined") return [];
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved).answeredQuestions ?? [] : [];
  });

  // Load state from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if ("currentQuestionId" in parsed) setCurrentQuestionId(parsed.currentQuestionId);
        if ("answeredQuestions" in parsed) setAnsweredQuestions(parsed.answeredQuestions);
      } catch (e) {
        console.error("Failed to parse quiz state from localStorage", e);
      }
    }
  }, [STORAGE_KEY]);

  // Persist state to localStorage whenever it changes
  useEffect(() => {
    const state = { currentQuestionId, answeredQuestions };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [currentQuestionId, answeredQuestions, STORAGE_KEY]);

  const addAnsweredQuestion = (question: AnsweredQuestion) => {
    setAnsweredQuestions((prev) => {
      const exists = prev.find((q) => q.questionId === question.questionId);
      if (exists) {
        return prev.map((q) =>
          q.questionId === question.questionId ? question : q
        );
      }
      return [...prev, question];
    });
  };

  const removeAnsweredQuestion = (questionId: string) => {
    setAnsweredQuestions((prev) => prev.filter((q) => q.questionId !== questionId));
  };

  const resetQuiz = () => {
    setCurrentQuestionId(null);
    setAnsweredQuestions([]);
    localStorage.removeItem(STORAGE_KEY);
  };

  // 🔑 Memoize the context value
  const value = useMemo(
    () => ({
      currentQuestionId,
      setCurrentQuestionId,
      answeredQuestions,
      addAnsweredQuestion,
      removeAnsweredQuestion,
      resetQuiz,
    }),
    [currentQuestionId, answeredQuestions]
  );

  return <QuizContext.Provider value={value}>{children}</QuizContext.Provider>;
}

export const useQuiz = () => {
  const context = useContext(QuizContext);
  if (!context) {
    throw new Error("useQuiz must be used within a QuizProvider");
  }
  return context;
};
