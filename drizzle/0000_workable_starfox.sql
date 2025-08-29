
--> statement-breakpoint
CREATE TABLE "quizzes" (
	"id" uuid PRIMARY KEY NOT NULL,
	"user_id" uuid NOT NULL,
	"document_id" uuid,
	"course_id" uuid,
	"topic" varchar(255),
	"prompt" text,
	"estimated_time" integer,
	"title" varchar(255),
	"description" text,
	"difficulty" "difficulty" DEFAULT 'medium',
	"num_questions" integer,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint

ALTER TABLE "quizzes" ADD CONSTRAINT "quizzes_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quizzes" ADD CONSTRAINT "quizzes_document_id_documents_id_fk" FOREIGN KEY ("document_id") REFERENCES "public"."documents"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quizzes" ADD CONSTRAINT "quizzes_course_id_courses_id_fk" FOREIGN KEY ("course_id") REFERENCES "public"."courses"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
