CREATE TABLE "user_activities" (
	"id" uuid PRIMARY KEY NOT NULL,
	"user_id" uuid NOT NULL,
	"activity_title" varchar(255) NOT NULL,
	"activity_description" text NOT NULL,
	"activity_type" varchar(50) NOT NULL,
	"activity_date" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "user_activities" ADD CONSTRAINT "user_activities_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "user_activities_user_id_idx" ON "user_activities" USING btree ("user_id");