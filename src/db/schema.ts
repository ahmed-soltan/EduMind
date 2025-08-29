import { relations } from "drizzle-orm";
import {
  pgTable,
  varchar,
  integer,
  pgEnum,
  timestamp,
  text,
  boolean,
  uuid,
  json,
  doublePrecision,
  index,
  uniqueIndex,
} from "drizzle-orm/pg-core";

export const billingCycle = pgEnum("billing_cycle", ["monthly", "yearly"]);
export const spokenLanguage = pgEnum("spoken_language", ["english", "العربيه"]);
export const difficultyEnum = pgEnum("difficulty", ["easy", "medium", "hard"]);
export const questionTypeEnum = pgEnum("question_type", [
  "mcq",
  "true_false",
  "short_answer",
]);

// ---------------- Plans ----------------
export const plans = pgTable("plans", {
  id: uuid().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  price: integer("price").notNull(),
  description: varchar("description", { length: 255 }),
  features: text("features").array().notNull(),
  billing_cycle: billingCycle("billing_cycle").default("monthly"),
  annual_discount_percent: integer("annual_discount_percent").default(20),
});

// ---------------- Users ----------------
export const users = pgTable(
  "users",
  {
    id: uuid().primaryKey(),
    firstName: varchar("first_name", { length: 255 }).notNull(),
    lastName: varchar("last_name", { length: 255 }).notNull(),
    email: varchar("email", { length: 255 }).notNull().unique(),
    avatar: varchar("avatar", { length: 255 }),
    password: varchar("password", { length: 255 }).notNull(),
    hasOnboarded: boolean("has_onboarded").default(false),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("name_idx").on(table.firstName, table.lastName),
    uniqueIndex("email_idx").on(table.email),
  ]
);

// ---------------- Subscriptions ----------------
export const subscriptions = pgTable(
  "subscriptions",
  {
    id: uuid().primaryKey(),

    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),

    planId: uuid("plan_id")
      .notNull()
      .references(() => plans.id, { onDelete: "cascade" }),

    billingCycle: varchar("billing_cycle", { length: 10 })
      .notNull()
      .default("monthly"),

    status: varchar("status", { length: 20 }).notNull().default("active"),

    startDate: timestamp("start_date").defaultNow().notNull(),
    endDate: timestamp("end_date"),
    canceledAt: timestamp("canceled_at"),
    renewalDate: timestamp("renewal_date"),
  },
  (table) => [index("subscription_user_id_idx").on(table.userId)]
);

// ---------------- Settings ----------------
export const settings = pgTable(
  "settings",
  {
    id: uuid().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    subdomain: varchar("subdomain", { length: 255 }).notNull().unique(),
    nickName: varchar("nick_name", { length: 255 }),
    bio: varchar("bio", { length: 255 }),
    interests: varchar("interests", { length: 255 }).array(),
  },
  (table) => [
    index("settings_user_id_idx").on(table.userId),
    index("settings_subdomain_idx").on(table.subdomain),
  ]
);

// ---------------- AI Customization ----------------
export const aiCustomization = pgTable("ai_customization", {
  id: uuid().primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  spokenLanguage: spokenLanguage("spoken_language").default("english"),
});

// ---------------- Documents (PDFs) ----------------
export const documents = pgTable(
  "documents",
  {
    id: uuid().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    title: varchar("title", { length: 255 }),
    url: varchar("url", { length: 500 }).notNull(),
    size: integer("size").notNull(),
    type: varchar("type", { length: 100 }).notNull(),
    key: varchar("key", { length: 100 }).notNull(),
    contentText: text("content_text"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [index("documents_user_id_idx").on(table.userId)]
);

// ---------------- AI Assistant ----------------
export const assistantSessions = pgTable(
  "assistant_sessions",
  {
    id: uuid().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    documentId: uuid("document_id").references(() => documents.id),
    title: varchar("title", { length: 255 }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("assistant_sessions_user_id_idx").on(table.userId),
    index("assistant_sessions_document_id_idx").on(table.documentId),
  ]
);

export const assistantMessages = pgTable(
  "assistant_messages",
  {
    id: uuid().primaryKey(),
    sessionId: uuid("session_id")
      .notNull()
      .references(() => assistantSessions.id, { onDelete: "cascade" }),
    role: varchar("role", { length: 20 }).notNull(), // user | assistant
    message: text("message").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [index("assistant_messages_session_id_idx").on(table.sessionId)]
);

// ---------------- Quizzes ----------------
export const quizzes = pgTable(
  "quizzes",
  {
    id: uuid().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    documentId: uuid("document_id").references(() => documents.id),
    courseId: uuid("course_id").references(() => courses.id),
    topic: varchar("topic", { length: 255 }),
    prompt: text("prompt"),
    estimatedTime: integer("estimated_time"),
    title: varchar("title", { length: 255 }),
    isPublic: boolean("is_public").default(true),
    description: text("description"),
    difficulty: difficultyEnum("difficulty").default("medium"),
    numQuestions: integer("num_questions"),
    // invitedPeople: varchar("invited_people", { length: 255 }).array(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [index("quizzes_user_id_idx").on(table.userId)]
);

export const quizQuestions = pgTable(
  "quiz_questions",
  {
    id: uuid().primaryKey(),
    quizId: uuid("quiz_id")
      .notNull()
      .references(() => quizzes.id, { onDelete: "cascade" }),
    questionText: text("question_text").notNull(),
    questionType: questionTypeEnum("question_type").default("mcq"),
    options: json("options"),
    answer: text("answer"),
    explanation: text("explanation"),
  },
  (table) => [index("questions_quiz_id_idx").on(table.quizId)]
);

export const quizAttempts = pgTable(
  "quiz_attempts",
  {
    id: uuid().primaryKey(),
    quizId: uuid("quiz_id")
      .notNull()
      .references(() => quizzes.id, { onDelete: "cascade" }),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    score: doublePrecision("score"),
    completedAt: timestamp("completed_at").defaultNow(),
  },
  (table) => [
    index("attempts_quiz_id_idx").on(table.quizId),
    index("attempts_user_id_idx").on(table.userId),
  ]
);

export const attemptsAnswers = pgTable(
  "attempts_answers",
  {
    id: uuid().primaryKey(),
    attemptId: uuid("attempt_id")
      .notNull()
      .references(() => quizAttempts.id, { onDelete: "cascade" }),
    questionId: uuid("question_id")
      .notNull()
      .references(() => quizQuestions.id, { onDelete: "cascade" }),
    answer: text("user_answer").notNull(),
    isCorrect: boolean("is_correct").default(false),
  },
  (table) => [
    index("answers_attempt_id_idx").on(table.attemptId),
    index("answers_question_id_idx").on(table.questionId),
  ]
);

export const courses = pgTable("courses", {
  id: uuid().primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const deck = pgTable(
  "deck",
  {
    id: uuid().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    courseId: uuid("course_id").references(() => courses.id),
    documentId: uuid("document_id").references(() => documents.id),
    title: varchar("title", { length: 255 }).notNull(),
    description: text("description"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("deck_user_id_idx").on(table.userId),
    index("deck_course_id_idx").on(table.courseId),
  ]
);

// ---------------- Flashcards ----------------
export const flashcards = pgTable(
  "flashcards",
  {
    id: uuid().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    deckId: uuid("deck_id").references(() => deck.id, { onDelete: "cascade" }),
    front: text("front").notNull(),
    back: text("back").notNull(),
    hint: text("hint"),
    source: varchar("source", { length: 20 }).default("manual"), // manual | quiz | assistant
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("flashcards_user_id_idx").on(table.userId),
    index("flashcards_deck_id_idx").on(table.deckId),
  ]
);

export const notes = pgTable("notes", {
  id: uuid().primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  title: varchar("title", { length: 255 }).notNull(),
  content: text("content").notNull(),
  bgColor: varchar("bg_color", { length: 20 }).default("#000000"),
  tags: varchar("tags", { length: 50 }).array(),
  pinned: boolean("pinned").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ---------------- Progress Tracking ----------------
export const progressTracking = pgTable(
  "progress_tracking",
  {
    id: uuid().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    studyHours: doublePrecision("study_hours").default(0),
    documentsRead: integer("documents_read").default(0),
    quizzesCompleted: integer("quizzes_completed").default(0),
    flashcardsReviewed: integer("flashcards_reviewed").default(0),
    streakDays: integer("streak_days").default(0),
    lastActivity: timestamp("last_activity"),
  },
  (table) => [index("progress_user_id_idx").on(table.userId)]
);

// ---------------- Relations ----------------
export const usersRelations = relations(users, ({ one, many }) => ({
  settings: one(settings, {
    fields: [users.id],
    references: [settings.userId],
  }),
  aiCustomization: one(aiCustomization, {
    fields: [users.id],
    references: [aiCustomization.userId],
  }),
  subscriptions: one(subscriptions, {
    fields: [users.id],
    references: [subscriptions.userId],
  }),
  documents: many(documents),
  assistantSessions: many(assistantSessions),
  quizzes: many(quizzes),
  flashcards: many(flashcards),
  progress: one(progressTracking, {
    fields: [users.id],
    references: [progressTracking.userId],
  }),
  courses: many(courses),
  notes: many(notes),
}));

export const planRelations = relations(plans, ({ many }) => ({
  subscriptions: many(subscriptions),
}));

export const courseRelations = relations(courses, ({ one, many }) => ({
  user: one(users, {
    fields: [courses.userId],
    references: [users.id],
  }),
  decks: many(deck),
  quizzes: many(quizzes),
}));

export const deckRelations = relations(deck, ({ one, many }) => ({
  user: one(users, {
    fields: [deck.userId],
    references: [users.id],
  }),
  course: one(courses, {
    fields: [deck.courseId],
    references: [courses.id],
  }),
  flashcards: many(flashcards),
}));
