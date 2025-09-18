CREATE TYPE "public"."subscription_status" AS ENUM('free', 'active', 'expired', 'canceled');--> statement-breakpoint
CREATE TABLE "ai_customization" (
	"id" uuid PRIMARY KEY NOT NULL,
	"tenant_id" uuid NOT NULL,
	"spoken_language" "spoken_language" DEFAULT 'english'
);
--> statement-breakpoint
CREATE TABLE "assistant_messages" (
	"id" uuid PRIMARY KEY NOT NULL,
	"document_id" uuid NOT NULL,
	"tenant_id" uuid NOT NULL,
	"role" varchar(20) NOT NULL,
	"message" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "attempts_answers" (
	"id" uuid PRIMARY KEY NOT NULL,
	"attempt_id" uuid NOT NULL,
	"question_id" uuid NOT NULL,
	"user_answer" text NOT NULL,
	"is_correct" boolean DEFAULT false
);
--> statement-breakpoint
CREATE TABLE "chunks" (
	"id" uuid PRIMARY KEY NOT NULL,
	"document_id" uuid NOT NULL,
	"content" text NOT NULL,
	"embedding" vector(768)
);
--> statement-breakpoint
CREATE TABLE "courses" (
	"id" uuid PRIMARY KEY NOT NULL,
	"tenant_id" uuid NOT NULL,
	"title" varchar(255) NOT NULL,
	"description" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "deck" (
	"id" uuid PRIMARY KEY NOT NULL,
	"tenant_id" uuid NOT NULL,
	"course_id" uuid,
	"document_id" uuid,
	"title" varchar(255) NOT NULL,
	"description" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "documents" (
	"id" uuid PRIMARY KEY NOT NULL,
	"tenant_id" uuid NOT NULL,
	"title" varchar(255),
	"url" varchar(500) NOT NULL,
	"size" integer NOT NULL,
	"type" varchar(100) NOT NULL,
	"key" varchar(100) NOT NULL,
	"content_text" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "flashcards" (
	"id" uuid PRIMARY KEY NOT NULL,
	"tenant_id" uuid NOT NULL,
	"deck_id" uuid,
	"front" text NOT NULL,
	"back" text NOT NULL,
	"hint" text,
	"source" varchar(20) DEFAULT 'manual',
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "notes" (
	"id" uuid PRIMARY KEY NOT NULL,
	"tenant_id" uuid NOT NULL,
	"title" varchar(255) NOT NULL,
	"content" text NOT NULL,
	"bg_color" varchar(20) DEFAULT '#000000',
	"tags" varchar(50)[],
	"pinned" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "permissions" (
	"id" uuid PRIMARY KEY NOT NULL,
	"name" varchar(100) NOT NULL,
	"description" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "permissions_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "plans" (
	"id" uuid PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"cents" integer NOT NULL,
	"currency" varchar(10) DEFAULT 'usd' NOT NULL,
	"description" varchar(255),
	"features" text[] NOT NULL,
	"billing_cycle" "billing_cycle" DEFAULT 'monthly',
	"annual_discount_percent" integer DEFAULT 20
);
--> statement-breakpoint
CREATE TABLE "progress_tracking" (
	"id" uuid PRIMARY KEY NOT NULL,
	"tenant_id" uuid NOT NULL,
	"study_hours" double precision DEFAULT 0,
	"documents_read" integer DEFAULT 0,
	"quizzes_completed" integer DEFAULT 0,
	"flashcards_reviewed" integer DEFAULT 0,
	"streak_days" integer DEFAULT 0,
	"last_activity" timestamp
);
--> statement-breakpoint
CREATE TABLE "quiz_attempts" (
	"id" uuid PRIMARY KEY NOT NULL,
	"quiz_id" uuid NOT NULL,
	"tenant_id" uuid NOT NULL,
	"score" double precision,
	"completed_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "quiz_questions" (
	"id" uuid PRIMARY KEY NOT NULL,
	"quiz_id" uuid NOT NULL,
	"question_text" text NOT NULL,
	"question_type" "question_type" DEFAULT 'mcq',
	"options" json,
	"answer" text,
	"explanation" text
);
--> statement-breakpoint
CREATE TABLE "quizzes" (
	"id" uuid PRIMARY KEY NOT NULL,
	"tenant_id" uuid NOT NULL,
	"document_id" uuid,
	"course_id" uuid,
	"topic" varchar(255),
	"prompt" text,
	"estimated_time" integer,
	"title" varchar(255),
	"is_public" boolean DEFAULT true,
	"description" text,
	"difficulty" "difficulty" DEFAULT 'medium',
	"num_questions" integer,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "role_permissions" (
	"id" uuid PRIMARY KEY NOT NULL,
	"role_id" uuid NOT NULL,
	"permission_id" uuid NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "settings" (
	"id" uuid PRIMARY KEY NOT NULL,
	"tenant_id" uuid NOT NULL,
	"nick_name" varchar(255),
	"bio" varchar(255),
	"interests" varchar(255)[]
);
--> statement-breakpoint
CREATE TABLE "streaks" (
	"tenant_id" uuid PRIMARY KEY NOT NULL,
	"current" integer DEFAULT 0 NOT NULL,
	"longest" integer DEFAULT 0 NOT NULL,
	"last_active_date" date,
	"tz" varchar(64) DEFAULT 'UTC' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "study_days" (
	"id" uuid PRIMARY KEY NOT NULL,
	"tenant_id" uuid NOT NULL,
	"activity_date" date NOT NULL,
	"first_event_at" timestamp DEFAULT now() NOT NULL,
	"source" varchar(20) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "subscriptions" (
	"id" uuid PRIMARY KEY NOT NULL,
	"tenant_id" uuid NOT NULL,
	"plan_id" uuid NOT NULL,
	"price_cents" integer,
	"currency" varchar(3),
	"provider_id" varchar(255),
	"billing_cycle" varchar(10) DEFAULT 'monthly',
	"subscription_status" "subscription_status" DEFAULT 'free',
	"start_date" timestamp DEFAULT now() NOT NULL,
	"end_date" timestamp,
	"canceled_at" timestamp,
	"renewal_date" timestamp,
	CONSTRAINT "subscriptions_provider_id_unique" UNIQUE("provider_id")
);
--> statement-breakpoint
CREATE TABLE "tenant_members" (
	"id" uuid PRIMARY KEY NOT NULL,
	"tenant_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"role_id" uuid,
	"joined_at" timestamp DEFAULT now() NOT NULL,
	"invited_by" uuid,
	"is_active" boolean DEFAULT true NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tenant_roles" (
	"id" uuid PRIMARY KEY NOT NULL,
	"tenant_id" uuid NOT NULL,
	"role_name" varchar(50) NOT NULL,
	"role_description" text,
	"is_default" boolean DEFAULT false NOT NULL,
	"is_protected" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tenants" (
	"id" uuid PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"owner_id" uuid NOT NULL,
	"tenant_name" varchar(255) NOT NULL,
	"subdomain" varchar(255) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "tenants_tenant_name_unique" UNIQUE("tenant_name"),
	CONSTRAINT "tenants_subdomain_unique" UNIQUE("subdomain")
);
--> statement-breakpoint
CREATE TABLE "user_activities" (
	"id" uuid PRIMARY KEY NOT NULL,
	"tenant_id" uuid NOT NULL,
	"activity_title" varchar(255) NOT NULL,
	"activity_description" text NOT NULL,
	"activity_type" varchar(50) NOT NULL,
	"activity_date" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY NOT NULL,
	"first_name" varchar(255) NOT NULL,
	"last_name" varchar(255) NOT NULL,
	"email" varchar(255) NOT NULL,
	"avatar" varchar(255),
	"password" varchar(255) NOT NULL,
	"has_onboarded" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "ai_customization" ADD CONSTRAINT "ai_customization_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "assistant_messages" ADD CONSTRAINT "assistant_messages_document_id_documents_id_fk" FOREIGN KEY ("document_id") REFERENCES "public"."documents"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "assistant_messages" ADD CONSTRAINT "assistant_messages_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "attempts_answers" ADD CONSTRAINT "attempts_answers_attempt_id_quiz_attempts_id_fk" FOREIGN KEY ("attempt_id") REFERENCES "public"."quiz_attempts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "attempts_answers" ADD CONSTRAINT "attempts_answers_question_id_quiz_questions_id_fk" FOREIGN KEY ("question_id") REFERENCES "public"."quiz_questions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "chunks" ADD CONSTRAINT "chunks_document_id_documents_id_fk" FOREIGN KEY ("document_id") REFERENCES "public"."documents"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "courses" ADD CONSTRAINT "courses_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "deck" ADD CONSTRAINT "deck_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "deck" ADD CONSTRAINT "deck_course_id_courses_id_fk" FOREIGN KEY ("course_id") REFERENCES "public"."courses"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "deck" ADD CONSTRAINT "deck_document_id_documents_id_fk" FOREIGN KEY ("document_id") REFERENCES "public"."documents"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "documents" ADD CONSTRAINT "documents_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "flashcards" ADD CONSTRAINT "flashcards_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "flashcards" ADD CONSTRAINT "flashcards_deck_id_deck_id_fk" FOREIGN KEY ("deck_id") REFERENCES "public"."deck"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notes" ADD CONSTRAINT "notes_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "progress_tracking" ADD CONSTRAINT "progress_tracking_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quiz_attempts" ADD CONSTRAINT "quiz_attempts_quiz_id_quizzes_id_fk" FOREIGN KEY ("quiz_id") REFERENCES "public"."quizzes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quiz_attempts" ADD CONSTRAINT "quiz_attempts_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quiz_questions" ADD CONSTRAINT "quiz_questions_quiz_id_quizzes_id_fk" FOREIGN KEY ("quiz_id") REFERENCES "public"."quizzes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quizzes" ADD CONSTRAINT "quizzes_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quizzes" ADD CONSTRAINT "quizzes_document_id_documents_id_fk" FOREIGN KEY ("document_id") REFERENCES "public"."documents"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quizzes" ADD CONSTRAINT "quizzes_course_id_courses_id_fk" FOREIGN KEY ("course_id") REFERENCES "public"."courses"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "role_permissions" ADD CONSTRAINT "role_permissions_role_id_tenant_roles_id_fk" FOREIGN KEY ("role_id") REFERENCES "public"."tenant_roles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "role_permissions" ADD CONSTRAINT "role_permissions_permission_id_permissions_id_fk" FOREIGN KEY ("permission_id") REFERENCES "public"."permissions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "settings" ADD CONSTRAINT "settings_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "streaks" ADD CONSTRAINT "streaks_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "study_days" ADD CONSTRAINT "study_days_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_plan_id_plans_id_fk" FOREIGN KEY ("plan_id") REFERENCES "public"."plans"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tenant_members" ADD CONSTRAINT "tenant_members_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tenant_members" ADD CONSTRAINT "tenant_members_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tenant_members" ADD CONSTRAINT "tenant_members_role_id_tenant_roles_id_fk" FOREIGN KEY ("role_id") REFERENCES "public"."tenant_roles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tenant_members" ADD CONSTRAINT "tenant_members_invited_by_users_id_fk" FOREIGN KEY ("invited_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tenant_roles" ADD CONSTRAINT "tenant_roles_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tenants" ADD CONSTRAINT "tenants_owner_id_users_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_activities" ADD CONSTRAINT "user_activities_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "assistant_messages_document_id_idx" ON "assistant_messages" USING btree ("document_id");--> statement-breakpoint
CREATE INDEX "assistant_messages_tenant_id_idx" ON "assistant_messages" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "answers_attempt_id_idx" ON "attempts_answers" USING btree ("attempt_id");--> statement-breakpoint
CREATE INDEX "answers_question_id_idx" ON "attempts_answers" USING btree ("question_id");--> statement-breakpoint
CREATE INDEX "deck_tenant_id_idx" ON "deck" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "deck_course_id_idx" ON "deck" USING btree ("course_id");--> statement-breakpoint
CREATE INDEX "documents_tenant_id_idx" ON "documents" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "flashcards_tenant_id_idx" ON "flashcards" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "flashcards_deck_id_idx" ON "flashcards" USING btree ("deck_id");--> statement-breakpoint
CREATE INDEX "progress_tenant_id_idx" ON "progress_tracking" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "attempts_quiz_id_idx" ON "quiz_attempts" USING btree ("quiz_id");--> statement-breakpoint
CREATE INDEX "attempts_tenant_id_idx" ON "quiz_attempts" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "questions_quiz_id_idx" ON "quiz_questions" USING btree ("quiz_id");--> statement-breakpoint
CREATE INDEX "quizzes_tenant_id_idx" ON "quizzes" USING btree ("tenant_id");--> statement-breakpoint
CREATE UNIQUE INDEX "role_perm_unique" ON "role_permissions" USING btree ("role_id","permission_id");--> statement-breakpoint
CREATE INDEX "settings_tenant_id_idx" ON "settings" USING btree ("tenant_id");--> statement-breakpoint
CREATE UNIQUE INDEX "study_days_tenant_date_uniq" ON "study_days" USING btree ("tenant_id","activity_date");--> statement-breakpoint
CREATE INDEX "study_days_tenant_idx" ON "study_days" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "study_days_date_idx" ON "study_days" USING btree ("activity_date");--> statement-breakpoint
CREATE INDEX "subscription_tenant_id_idx" ON "subscriptions" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "subscription_plan_id_idx" ON "subscriptions" USING btree ("plan_id");--> statement-breakpoint
CREATE UNIQUE INDEX "tenant_user_idx" ON "tenant_members" USING btree ("tenant_id","user_id");--> statement-breakpoint
CREATE INDEX "tenant_id_idx" ON "tenant_members" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "user_id_idx" ON "tenant_members" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "tenant_role_name_unique" ON "tenant_roles" USING btree ("tenant_id","role_name");--> statement-breakpoint
CREATE UNIQUE INDEX "tenant_name_idx" ON "tenants" USING btree ("tenant_name");--> statement-breakpoint
CREATE UNIQUE INDEX "subdomain_idx" ON "tenants" USING btree ("subdomain");--> statement-breakpoint
CREATE UNIQUE INDEX "owner_id_idx" ON "tenants" USING btree ("owner_id");--> statement-breakpoint
CREATE INDEX "user_activities_tenant_id_idx" ON "user_activities" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "name_idx" ON "users" USING btree ("first_name","last_name");--> statement-breakpoint
CREATE UNIQUE INDEX "email_idx" ON "users" USING btree ("email");