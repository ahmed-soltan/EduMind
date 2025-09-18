ALTER TABLE "settings" DROP CONSTRAINT "settings_tenant_member_id_tenant_members_id_fk";
--> statement-breakpoint
ALTER TABLE "settings" DROP COLUMN "tenant_member_id";