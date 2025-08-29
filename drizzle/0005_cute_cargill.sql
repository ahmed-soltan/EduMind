ALTER TABLE "flashcards" DROP CONSTRAINT "flashcards_document_id_documents_id_fk";
--> statement-breakpoint
ALTER TABLE "deck" ADD COLUMN "document_id" uuid;--> statement-breakpoint
ALTER TABLE "deck" ADD CONSTRAINT "deck_document_id_documents_id_fk" FOREIGN KEY ("document_id") REFERENCES "public"."documents"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "flashcards" DROP COLUMN "document_id";