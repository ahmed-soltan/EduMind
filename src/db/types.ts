import {
  attemptsAnswers,
  deck,
  flashcards,
  invoices,
  permissions,
  planLimits,
  plans,
  quizAttempts,
  quizQuestions,
  subscriptions,
  tenantRoles,
  tenants,
  userActivities,
} from "@/db/schema";
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
export type Plans = InferSelectModel<typeof plans>;
export type Subscription = InferSelectModel<typeof subscriptions>;
export type Invoice = InferSelectModel<typeof invoices>;
export type Permissions = InferSelectModel<typeof permissions>;
export type PlanLimits = InferSelectModel<typeof planLimits>
export type TenantRole = InferSelectModel<typeof tenantRoles>;
export type Tenant = InferSelectModel<typeof tenants>;
export type Roles = InferSelectModel<typeof tenantRoles>;

export type Invoices = {
  id: string;
  amountCents: number;
  currency: string;
  issuedAt: Date;
  paidAt: Date | null;
  status: string;
  plan: string;
  billingCycle: string;
}

export type TenantSubscription = {
  subscriptions: Subscription;
  plans: Plans;
};

export type QuizData = {
  quiz: Quiz;
  quizAttempt: QuizAttempt;
  totalAttempts: number;
};

export type Attempt = {
  attempt: QuizAttempt;
  attemptAnswers: AttemptAnswers[];
};

export type QuizInterface = {
  quiz: Quiz;
  attempt: QuizAttempt;
  questions: QuizQuestions[];
};

export type DeckData = Deck & {
  flashcardsCount: number;
};


export type TenantMemberContext = {
  id: string;
  tenantId: string;
  roleId: string;
  isActive: boolean;
  subscriptionId?: string | null;
  planId?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  email?: string | null;
  permissions: Permissions[];
};