ALTER TABLE "flashcards" DROP CONSTRAINT "flashcards_deck_id_deck_id_fk";
--> statement-breakpoint
ALTER TABLE "flashcards" ADD CONSTRAINT "flashcards_deck_id_deck_id_fk" FOREIGN KEY ("deck_id") REFERENCES "public"."deck"("id") ON DELETE cascade ON UPDATE no action;