import { attemptsAnswers, deck, flashcards, quizAttempts, quizQuestions, userActivities } from "@/db/schema";
import { InferSelectModel } from "drizzle-orm";
import { documents, quizzes, users } from "./schema";

export type User = InferSelectModel<typeof users>; // full row type
export type Document = InferSelectModel<typeof documents>; // full row type
export type Quiz = InferSelectModel<typeof quizzes>; // full row type
export type QuizAttempt = InferSelectModel<typeof quizAttempts>; // full row type
export type QuizQuestions = InferSelectModel<typeof quizQuestions>; // full row type
export type AttemptAnswers = InferSelectModel<typeof attemptsAnswers>;
export type Deck = InferSelectModel<typeof deck>;
export type FlashCard = InferSelectModel<typeof flashcards>;
export type UserActivity = InferSelectModel<typeof userActivities>;

export type QuizData = {
  quiz: Quiz;
  quizAttempt: QuizAttempt;
  totalAttempts: number;
};

export type Attempt = {
  attempt: QuizAttempt;
  attemptAnswers: AttemptAnswers[];
}

export type QuizInterface = {
  quiz: Quiz;
  attempt: QuizAttempt;
  questions: QuizQuestions[];
};

export type DeckData = Deck & {
  flashcardsCount: number;
};