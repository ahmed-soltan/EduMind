CREATE TABLE "assistant_messages" (
	"id" uuid PRIMARY KEY NOT NULL,
	"document_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"role" varchar(20) NOT NULL,
	"message" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);

CREATE INDEX "assistant_messages_document_id_idx" ON "assistant_messages" USING btree ("document_id");--> statement-breakpoint
CREATE INDEX "assistant_messages_user_id_idx" ON "assistant_messages" USING btree ("user_id");--> statement-breakpoint
