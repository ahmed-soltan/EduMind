CREATE TABLE "plan_limits" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"plan_id" uuid NOT NULL,
	"feature" text NOT NULL,
	"limit" integer
);
--> statement-breakpoint
ALTER TABLE "plan_limits" ADD CONSTRAINT "plan_limits_plan_id_plans_id_fk" FOREIGN KEY ("plan_id") REFERENCES "public"."plans"("id") ON DELETE no action ON UPDATE no action;