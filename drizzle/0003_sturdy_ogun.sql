ALTER TABLE "plans" ALTER COLUMN "annual_discount_percent" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "assistant_messages" ADD COLUMN "tenant_member_id" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "courses" ADD COLUMN "is_public" boolean DEFAULT true;--> statement-breakpoint
ALTER TABLE "courses" ADD COLUMN "created_by" uuid;--> statement-breakpoint
ALTER TABLE "courses" ADD COLUMN "updated_at" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "deck" ADD COLUMN "is_public" boolean DEFAULT true;--> statement-breakpoint
ALTER TABLE "deck" ADD COLUMN "created_by" uuid;--> statement-breakpoint
ALTER TABLE "documents" ADD COLUMN "uploaded_by" uuid;--> statement-breakpoint
ALTER TABLE "documents" ADD COLUMN "num_pages" integer;--> statement-breakpoint
ALTER TABLE "flashcards" ADD COLUMN "created_by" uuid;--> statement-breakpoint
ALTER TABLE "progress_tracking" ADD COLUMN "tenant_member_id" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "quiz_attempts" ADD COLUMN "tenant_member_id" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "quiz_attempts" ADD COLUMN "total_questions" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "quiz_attempts" ADD COLUMN "correct_answers" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "streaks" ADD COLUMN "tenant_member_id" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "study_days" ADD COLUMN "tenant_member_id" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "user_activities" ADD COLUMN "tenant_member_id" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "assistant_messages" ADD CONSTRAINT "assistant_messages_tenant_member_id_tenant_members_id_fk" FOREIGN KEY ("tenant_member_id") REFERENCES "public"."tenant_members"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "courses" ADD CONSTRAINT "courses_created_by_tenant_members_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."tenant_members"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "deck" ADD CONSTRAINT "deck_created_by_tenant_members_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."tenant_members"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "documents" ADD CONSTRAINT "documents_uploaded_by_tenant_members_id_fk" FOREIGN KEY ("uploaded_by") REFERENCES "public"."tenant_members"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "flashcards" ADD CONSTRAINT "flashcards_created_by_tenant_members_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."tenant_members"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "progress_tracking" ADD CONSTRAINT "progress_tracking_tenant_member_id_tenant_members_id_fk" FOREIGN KEY ("tenant_member_id") REFERENCES "public"."tenant_members"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quiz_attempts" ADD CONSTRAINT "quiz_attempts_tenant_member_id_tenant_members_id_fk" FOREIGN KEY ("tenant_member_id") REFERENCES "public"."tenant_members"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "streaks" ADD CONSTRAINT "streaks_tenant_member_id_tenant_members_id_fk" FOREIGN KEY ("tenant_member_id") REFERENCES "public"."tenant_members"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "study_days" ADD CONSTRAINT "study_days_tenant_member_id_tenant_members_id_fk" FOREIGN KEY ("tenant_member_id") REFERENCES "public"."tenant_members"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_activities" ADD CONSTRAINT "user_activities_tenant_member_id_tenant_members_id_fk" FOREIGN KEY ("tenant_member_id") REFERENCES "public"."tenant_members"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "deck_created_by_idx" ON "deck" USING btree ("created_by");--> statement-breakpoint
CREATE INDEX "progress_member_id_idx" ON "progress_tracking" USING btree ("tenant_member_id");--> statement-breakpoint
CREATE INDEX "attempts_tenant_member_id_idx" ON "quiz_attempts" USING btree ("tenant_member_id");--> statement-breakpoint
CREATE INDEX "streaks_member_idx" ON "streaks" USING btree ("tenant_member_id");--> statement-breakpoint
CREATE INDEX "study_days_member_idx" ON "study_days" USING btree ("tenant_member_id");--> statement-breakpoint
CREATE INDEX "user_activities_member_id_idx" ON "user_activities" USING btree ("tenant_member_id");