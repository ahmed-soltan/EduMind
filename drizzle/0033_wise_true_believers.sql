ALTER TABLE "courses" DROP CONSTRAINT "courses_created_by_tenant_members_id_fk";
--> statement-breakpoint
ALTER TABLE "deck" DROP CONSTRAINT "deck_created_by_tenant_members_id_fk";
--> statement-breakpoint
ALTER TABLE "documents" DROP CONSTRAINT "documents_uploaded_by_tenant_members_id_fk";
--> statement-breakpoint
ALTER TABLE "flashcards" DROP CONSTRAINT "flashcards_created_by_tenant_members_id_fk";
--> statement-breakpoint
ALTER TABLE "quizzes" DROP CONSTRAINT "quizzes_created_by_tenant_members_id_fk";
--> statement-breakpoint
ALTER TABLE "courses" ADD CONSTRAINT "courses_created_by_tenant_members_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."tenant_members"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "deck" ADD CONSTRAINT "deck_created_by_tenant_members_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."tenant_members"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "documents" ADD CONSTRAINT "documents_uploaded_by_tenant_members_id_fk" FOREIGN KEY ("uploaded_by") REFERENCES "public"."tenant_members"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "flashcards" ADD CONSTRAINT "flashcards_created_by_tenant_members_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."tenant_members"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quizzes" ADD CONSTRAINT "quizzes_created_by_tenant_members_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."tenant_members"("id") ON DELETE cascade ON UPDATE no action;