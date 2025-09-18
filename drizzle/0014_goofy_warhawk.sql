CREATE TABLE "invoices" (
	"id" uuid PRIMARY KEY NOT NULL,
	"subscription_id" uuid NOT NULL,
	"amount_cents" integer NOT NULL,
	"currency" varchar(3) DEFAULT 'egp' NOT NULL,
	"issued_at" timestamp DEFAULT now() NOT NULL,
	"due_at" timestamp NOT NULL,
	"paid_at" timestamp
);
--> statement-breakpoint
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_subscription_id_subscriptions_id_fk" FOREIGN KEY ("subscription_id") REFERENCES "public"."subscriptions"("id") ON DELETE cascade ON UPDATE no action;