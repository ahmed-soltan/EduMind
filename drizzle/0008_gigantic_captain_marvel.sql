
CREATE TABLE streaks (
    id UUID PRIMARY KEY,
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    current INTEGER NOT NULL DEFAULT 0,
    longest INTEGER NOT NULL DEFAULT 0,
    last_active_date DATE,
    tenant_member_id UUID NOT NULL REFERENCES tenant_members(id) ON DELETE CASCADE,
    tz VARCHAR(64) NOT NULL DEFAULT 'UTC',
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Index for tenant_member_id
CREATE INDEX streaks_member_idx ON streaks (tenant_member_id);


ALTER TABLE "settings" ADD COLUMN "tenant_member_id" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "settings" ADD CONSTRAINT "settings_tenant_member_id_tenant_members_id_fk" FOREIGN KEY ("tenant_member_id") REFERENCES "public"."tenant_members"("id") ON DELETE cascade ON UPDATE no action;