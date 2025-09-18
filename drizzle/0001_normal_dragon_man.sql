ALTER TABLE "tenants" DROP CONSTRAINT "tenants_tenant_name_unique";--> statement-breakpoint
DROP INDEX "tenant_name_idx";--> statement-breakpoint
CREATE UNIQUE INDEX "tenant_name_idx" ON "tenants" USING btree ("name");--> statement-breakpoint
ALTER TABLE "tenants" DROP COLUMN "tenant_name";