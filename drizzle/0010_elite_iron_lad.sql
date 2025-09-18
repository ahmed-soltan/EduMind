ALTER TABLE "tenants" ALTER COLUMN "name" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "subscriptions" ADD COLUMN "provider_pending_id" varchar(255);