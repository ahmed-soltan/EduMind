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
  vector,
  date,
} from "drizzle-orm/pg-core";

export const billingCycle = pgEnum("billing_cycle", ["monthly", "yearly"]);
export const spokenLanguage = pgEnum("spoken_language", ["english", "العربيه"]);
export const difficultyEnum = pgEnum("difficulty", ["easy", "medium", "hard"]);
export const questionTypeEnum = pgEnum("question_type", [
  "mcq",
  "true_false",
  "short_answer",
]);
export const subscriptionStatus = pgEnum("subscription_status", [
  "active",
  "expired",
  "canceled",
  "failed",
  "pending",
]);

// ---------------- Plans ----------------
export const plans = pgTable("plans", {
  id: uuid().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  cents: integer("cents").notNull(),
  currency: varchar("currency", { length: 10 }).notNull().default("usd"),
  description: varchar("description", { length: 255 }),
  features: text("features").array().notNull(),
  annual_discount_percent: integer("annual_discount_percent")
    .notNull()
    .default(20),
});

export const planLimits = pgTable(
  "plan_limits",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    planId: uuid("plan_id")
      .notNull()
      .references(() => plans.id),
    feature: text("feature").notNull(), // e.g. "documents", "quizzes", "decks", "streak"
    limit: integer("limit"), // null = unlimited
    available: boolean("available").default(true),
  },
  (table) => [
    uniqueIndex("plan_feature_unique").on(table.planId, table.feature),
  ]
);

// ---------------- Users ----------------
export const users = pgTable(
  "users",
  {
    id: uuid().primaryKey(),
    firstName: varchar("first_name", { length: 255 }).notNull(),
    lastName: varchar("last_name", { length: 255 }).notNull(),
    email: varchar("email", { length: 255 }).notNull().unique(),
    password: varchar("password", { length: 255 }).notNull(),
    hasOnboarded: boolean("has_onboarded").default(false),
    lastActiveTenantSubdomain: varchar("last_active_tenant_subdomain", {
      length: 255,
    }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("name_idx").on(table.firstName, table.lastName),
    uniqueIndex("email_idx").on(table.email),
  ]
);

export const tenants = pgTable(
  "tenants",
  {
    id: uuid().primaryKey(),
    name: varchar("name", { length: 255 }).unique(),
    ownerId: uuid("owner_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    subdomain: varchar("subdomain", { length: 255 }).unique(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("tenant_name_idx").on(table.name),
    uniqueIndex("subdomain_idx").on(table.subdomain),
    uniqueIndex("owner_id_idx").on(table.ownerId),
  ]
);

export const tenantRoles = pgTable(
  "tenant_roles",
  {
    id: uuid().primaryKey(),
    tenantId: uuid("tenant_id").references(() => tenants.id, {
      onDelete: "cascade",
    }),
    roleName: varchar("role_name", { length: 50 }).notNull(),
    roleDescription: text("role_description"),
    isDefault: boolean("is_default").default(false).notNull(), // NEW
    isProtected: boolean("is_protected").default(false).notNull(), // NEW optional: block deletion for builtin roles
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow(),
  },
  (table) => [
    // unique role name per tenant
    uniqueIndex("tenant_role_name_unique").on(table.tenantId, table.roleName),
    // we will create a partial unique index for isDefault via raw SQL migration
  ]
);

export const tenantMembers = pgTable(
  "tenant_members",
  {
    id: uuid().primaryKey(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    roleId: uuid("role_id").references(() => tenantRoles.id),
    joinedAt: timestamp("joined_at").defaultNow().notNull(),
    invitedBy: uuid("invited_by").references(() => users.id),
    isActive: boolean("is_active").default(true).notNull(),
  },
  (table) => [
    uniqueIndex("tenant_user_idx").on(table.tenantId, table.userId),
    index("tenant_id_idx").on(table.tenantId),
    index("user_id_idx").on(table.userId),
  ]
);

export const tenantInvites = pgTable("tenant_invites", {
  id: uuid().primaryKey(),
  tenantId: uuid("tenant_id")
    .notNull()
    .references(() => tenants.id, { onDelete: "cascade" }),
  email: varchar("email", { length: 255 }).notNull(),
  token: varchar("token", { length: 255 }).notNull().unique(),
  roleId: uuid("role_id").references(() => tenantRoles.id),
  invitedBy: uuid("invited_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  acceptedAt: timestamp("accepted_at"),
});

export const pendingInvitations = pgTable(
  "pending_invitations",
  {
    id: varchar("id").primaryKey(),
    token: varchar("token", { length: 64 }).unique().notNull(),
    email: varchar("email", { length: 255 }).notNull(),
    tenantId: varchar("tenant_id").notNull(),
    roleId: varchar("role_id").notNull(),
    invitedBy: varchar("invited_by").notNull(),
    isUsed: boolean("is_used").default(false),
    expiresAt: timestamp("expires_at").notNull(),
    createdAt: timestamp("created_at").defaultNow(),
    usedAt: timestamp("used_at"),
  },
  (table) => ({
    tokenIdx: index("pending_invitations_token_idx").on(table.token),
    emailIdx: index("pending_invitations_email_idx").on(table.email),
    tenantIdx: index("pending_invitations_tenant_idx").on(table.tenantId),
  })
);

export const permissions = pgTable("permissions", {
  id: uuid().primaryKey(),
  name: varchar("name", { length: 100 }).notNull().unique(),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const rolePermission = pgTable(
  "role_permissions",
  {
    id: uuid().primaryKey(),
    roleId: uuid("role_id")
      .notNull()
      .references(() => tenantRoles.id, { onDelete: "cascade" }),
    permissionId: uuid("permission_id")
      .notNull()
      .references(() => permissions.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("role_perm_unique").on(table.roleId, table.permissionId),
  ]
);

// ---------------- Subscriptions ----------------
export const subscriptions = pgTable(
  "subscriptions",
  {
    id: uuid().primaryKey(),

    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),

    planId: uuid("plan_id")
      .notNull()
      .references(() => plans.id, { onDelete: "cascade" }),

    price_cents: integer("price_cents"),
    currency: varchar("currency", { length: 3 }),

    providerId: varchar("provider_id", { length: 255 }).unique(),
    providerPendingId: varchar("provider_pending_id", { length: 255 }),
    providerSubscriptionId: varchar("provider_subscription_id", {
      length: 255,
    }),
    providerTransactionId: varchar("provider_transaction_id", { length: 255 }),

    billingCycle: varchar("billing_cycle", { length: 10 }).default("monthly"),

    status: subscriptionStatus("subscription_status").default("pending"),

    startDate: timestamp("start_date").defaultNow().notNull(),
    endDate: timestamp("end_date"),
    canceledAt: timestamp("canceled_at"),
    renewalDate: timestamp("renewal_date"),
  },
  (table) => [
    index("subscription_tenant_id_idx").on(table.tenantId),
    index("subscription_plan_id_idx").on(table.planId),
  ]
);

export const invoices = pgTable(
  "invoices",
  {
    id: uuid().primaryKey(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    subscriptionId: uuid("subscription_id")
      .notNull()
      .references(() => subscriptions.id, { onDelete: "cascade" }),
    amountCents: integer("amount_cents").notNull(),
    currency: varchar("currency", { length: 3 }).notNull().default("egp"),
    issuedAt: timestamp("issued_at").defaultNow().notNull(),
    dueAt: timestamp("due_at").notNull(),
    paidAt: timestamp("paid_at"),
  },
  (table) => [index("invoices_tenant_id_idx").on(table.tenantId)]
);

// ---------------- Settings ----------------
export const settings = pgTable(
  "settings",
  {
    id: uuid().primaryKey(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    tenantMemberId: uuid("tenant_member_id")
      .notNull()
      .references(() => tenantMembers.id, { onDelete: "cascade" }),
    nickName: varchar("nick_name", { length: 255 }),
    bio: varchar("bio", { length: 255 }),
    avatar: varchar("avatar", { length: 255 }),
    timezone: varchar("timezone", { length: 100 }).default("UTC"),
    interests: varchar("interests", { length: 255 }).array(),
  },
  (table) => [index("settings_tenant_id_idx").on(table.tenantId)]
);

// ---------------- AI Customization ----------------
export const aiCustomization = pgTable("ai_customization", {
  id: uuid().primaryKey(),
  tenantId: uuid("tenant_id")
    .notNull()
    .references(() => tenants.id, { onDelete: "cascade" }),
  spokenLanguage: spokenLanguage("spoken_language").default("english"),
});

// ---------------- Documents (PDFs) ----------------
export const documents = pgTable(
  "documents",
  {
    id: uuid().primaryKey(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    title: varchar("title", { length: 255 }),
    url: varchar("url", { length: 500 }).notNull(),
    size: integer("size").notNull(),
    type: varchar("type", { length: 100 }).notNull(),
    key: varchar("key", { length: 100 }).notNull(),
    contentText: text("content_text"),
    uploadedBy: uuid("uploaded_by").references(() => tenantMembers.id, { onDelete: "cascade" }),
    numPages: integer("num_pages"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [index("documents_tenant_id_idx").on(table.tenantId)]
);

export const chunks = pgTable("chunks", {
  id: uuid().primaryKey(),
  documentId: uuid("document_id")
    .notNull()
    .references(() => documents.id),
  content: text("content").notNull(),
  embedding: vector("embedding", { dimensions: 768 }), // matches Gemini embeddings
});

export const assistantMessages = pgTable(
  "assistant_messages",
  {
    id: uuid().primaryKey(),
    documentId: uuid("document_id")
      .notNull()
      .references(() => documents.id, { onDelete: "cascade" }),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    tenantMemberId: uuid("tenant_member_id")
      .notNull()
      .references(() => tenantMembers.id, { onDelete: "cascade" }),
    memberName: varchar("member_name", { length: 255 }),
    role: varchar("role", { length: 20 }).notNull(), // user | assistant
    message: text("message").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("assistant_messages_document_id_idx").on(table.documentId),
    index("assistant_messages_tenant_id_idx").on(table.tenantId),
  ]
);

// ---------------- Quizzes ----------------
export const quizzes = pgTable(
  "quizzes",
  {
    id: uuid().primaryKey(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
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
    createdBy: uuid("created_by").references(() => tenantMembers.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [index("quizzes_tenant_id_idx").on(table.tenantId)]
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
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    tenantMemberId: uuid("tenant_member_id")
      .notNull()
      .references(() => tenantMembers.id, { onDelete: "cascade" }),
    totalQuestions: integer("total_questions").notNull().default(0),
    correctAnswers: integer("correct_answers").notNull().default(0),
    score: doublePrecision("score"),
    completedAt: timestamp("completed_at").defaultNow(),
  },
  (table) => [
    index("attempts_quiz_id_idx").on(table.quizId),
    index("attempts_tenant_id_idx").on(table.tenantId),
    index("attempts_tenant_member_id_idx").on(table.tenantMemberId),
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
  tenantId: uuid("tenant_id")
    .notNull()
    .references(() => tenants.id, { onDelete: "cascade" }),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  isPublic: boolean("is_public").default(true),
  createdBy: uuid("created_by").references(() => tenantMembers.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const deck = pgTable(
  "deck",
  {
    id: uuid().primaryKey(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    courseId: uuid("course_id").references(() => courses.id),
    documentId: uuid("document_id").references(() => documents.id),
    title: varchar("title", { length: 255 }).notNull(),
    description: text("description"),
    isPublic: boolean("is_public").default(true),
    createdBy: uuid("created_by").references(() => tenantMembers.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("deck_tenant_id_idx").on(table.tenantId),
    index("deck_course_id_idx").on(table.courseId),
    index("deck_created_by_idx").on(table.createdBy),
  ]
);

// ---------------- Flashcards ----------------
export const flashcards = pgTable(
  "flashcards",
  {
    id: uuid().primaryKey(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    deckId: uuid("deck_id").references(() => deck.id, { onDelete: "cascade" }),
    front: text("front").notNull(),
    back: text("back").notNull(),
    hint: text("hint"),
    createdBy: uuid("created_by").references(() => tenantMembers.id, { onDelete: "cascade" }),
    source: varchar("source", { length: 20 }).default("manual"), // manual | quiz | assistant
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("flashcards_tenant_id_idx").on(table.tenantId),
    index("flashcards_deck_id_idx").on(table.deckId),
  ]
);

export const notes = pgTable("notes", {
  id: uuid().primaryKey(),
  tenantId: uuid("tenant_id")
    .notNull()
    .references(() => tenants.id, { onDelete: "cascade" }),
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
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    tenantMemberId: uuid("tenant_member_id")
      .notNull()
      .references(() => tenantMembers.id, { onDelete: "cascade" }),
    studyHours: doublePrecision("study_hours").default(0),
    documentsRead: integer("documents_read").default(0),
    quizzesCompleted: integer("quizzes_completed").default(0),
    flashcardsReviewed: integer("flashcards_reviewed").default(0),
    streakDays: integer("streak_days").default(0),
    lastActivity: timestamp("last_activity"),
  },
  (table) => [
    index("progress_tenant_id_idx").on(table.tenantId),
    index("progress_member_id_idx").on(table.tenantMemberId),
  ]
);

export const studyDays = pgTable(
  "study_days",
  {
    id: uuid().primaryKey(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    activityDate: date("activity_date").notNull(), // Local date for the user
    firstEventAt: timestamp("first_event_at").notNull().defaultNow(), // UTC timestamp
    // quiz | flashcards | both (you can keep varchar+checks or create a PG enum)
    tenantMemberId: uuid("tenant_member_id").references(
      () => tenantMembers.id,
      { onDelete: "cascade" }
    ),
    source: varchar("source", { length: 20 }).notNull(),
  },
  (t) => [
    uniqueIndex("study_days_tenant_date_uniq").on(t.tenantId, t.activityDate),
    index("study_days_tenant_idx").on(t.tenantId),
    index("study_days_date_idx").on(t.activityDate),
    index("study_days_member_idx").on(t.tenantMemberId),
  ]
);

export const streaks = pgTable(
  "streaks",
  {
    id: uuid().primaryKey(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    current: integer("current").notNull().default(0),
    longest: integer("longest").notNull().default(0),
    // Local calendar date in user's timezone for last day with activity:
    lastActiveDate: date("last_active_date"),
    // IANA timezone used to interpret the user's day boundary (e.g., "Africa/Cairo")
    tenantMemberId: uuid("tenant_member_id")
      .notNull()
      .references(() => tenantMembers.id, { onDelete: "cascade" }),
    tz: varchar("tz", { length: 64 }).notNull().default("UTC"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (table) => [index("streaks_member_idx").on(table.tenantMemberId)]
);

export const userActivities = pgTable(
  "user_activities",
  {
    id: uuid().primaryKey(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    activityTitle: varchar("activity_title", { length: 255 }).notNull(),
    activityDescription: text("activity_description").notNull(),
    activityType: varchar("activity_type", { length: 50 }).notNull(),
    activityDate: timestamp("activity_date").defaultNow().notNull(),
    tenantMemberId: uuid("tenant_member_id")
      .notNull()
      .references(() => tenantMembers.id, { onDelete: "cascade" }),
  },
  (table) => [
    index("user_activities_tenant_id_idx").on(table.tenantId),
    index("user_activities_member_id_idx").on(table.tenantMemberId),
  ]
);

// ---------------- Relations ----------------
export const tenantsRelations = relations(tenants, ({ one, many }) => ({
  settings: one(settings, {
    fields: [tenants.id],
    references: [settings.tenantId],
  }),
  aiCustomization: one(aiCustomization, {
    fields: [tenants.id],
    references: [aiCustomization.tenantId],
  }),
  subscriptions: one(subscriptions, {
    fields: [tenants.id],
    references: [subscriptions.tenantId],
  }),
  documents: many(documents),
  assistantMessages: many(assistantMessages),
  quizzes: many(quizzes),
  flashcards: many(flashcards),
  progress: one(progressTracking, {
    fields: [tenants.id],
    references: [progressTracking.tenantId],
  }),
  courses: many(courses),
  notes: many(notes),
  userActivities: many(userActivities),
}));

export const planRelations = relations(plans, ({ many }) => ({
  subscriptions: many(subscriptions),
}));

export const courseRelations = relations(courses, ({ one, many }) => ({
  user: one(users, {
    fields: [courses.tenantId],
    references: [users.id],
  }),
  decks: many(deck),
  quizzes: many(quizzes),
}));

export const deckRelations = relations(deck, ({ one, many }) => ({
  user: one(users, {
    fields: [deck.tenantId],
    references: [users.id],
  }),
  course: one(courses, {
    fields: [deck.courseId],
    references: [courses.id],
  }),
  flashcards: many(flashcards),
}));

export const subscriptionsRelations = relations(subscriptions, ({ one }) => ({
  plan: one(plans, {
    fields: [subscriptions.planId],
    references: [plans.id],
  }),
}));

// Relations
export const pendingInvitationsRelations = relations(
  pendingInvitations,
  ({ one }) => ({
    tenant: one(tenants, {
      fields: [pendingInvitations.tenantId],
      references: [tenants.id],
    }),
    role: one(tenantRoles, {
      fields: [pendingInvitations.roleId],
      references: [tenantRoles.id],
    }),
    inviter: one(users, {
      fields: [pendingInvitations.invitedBy],
      references: [users.id],
    }),
  })
);
