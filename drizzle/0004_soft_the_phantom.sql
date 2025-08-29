ALTER TABLE "flashcards" RENAME COLUMN "course_id" TO "deck_id";--> statement-breakpoint
ALTER TABLE "flashcards" DROP CONSTRAINT "flashcards_course_id_courses_id_fk";
--> statement-breakpoint
ALTER TABLE "deck" ADD COLUMN "course_id" uuid;--> statement-breakpoint
ALTER TABLE "deck" ADD CONSTRAINT "deck_course_id_courses_id_fk" FOREIGN KEY ("course_id") REFERENCES "public"."courses"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "flashcards" ADD CONSTRAINT "flashcards_deck_id_deck_id_fk" FOREIGN KEY ("deck_id") REFERENCES "public"."deck"("id") ON DELETE no action ON UPDATE no action;