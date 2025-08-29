CREATE TABLE "attempts_answers" (
	"id" uuid PRIMARY KEY NOT NULL,
	"attempt_id" uuid NOT NULL,
	"question_id" uuid NOT NULL,
	"user_answer" text NOT NULL,
	"is_correct" boolean DEFAULT false
);
--> statement-breakpoint
ALTER TABLE "attempts_answers" ADD CONSTRAINT "attempts_answers_attempt_id_quiz_attempts_id_fk" FOREIGN KEY ("attempt_id") REFERENCES "public"."quiz_attempts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "attempts_answers" ADD CONSTRAINT "attempts_answers_question_id_quiz_questions_id_fk" FOREIGN KEY ("question_id") REFERENCES "public"."quiz_questions"("id") ON DELETE cascade ON UPDATE no action;