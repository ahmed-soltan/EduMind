CREATE TABLE "tenant_invites" (
	"id" uuid PRIMARY KEY NOT NULL,
	"tenant_id" uuid NOT NULL,
	"email" varchar(255) NOT NULL,
	"token" varchar(255) NOT NULL,
	"role_id" uuid,
	"invited_by" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"expires_at" timestamp NOT NULL,
	"accepted_at" timestamp,
	CONSTRAINT "tenant_invites_token_unique" UNIQUE("token")
);
--> statement-breakpoint
ALTER TABLE "tenant_invites" ADD CONSTRAINT "tenant_invites_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tenant_invites" ADD CONSTRAINT "tenant_invites_role_id_tenant_roles_id_fk" FOREIGN KEY ("role_id") REFERENCES "public"."tenant_roles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tenant_invites" ADD CONSTRAINT "tenant_invites_invited_by_users_id_fk" FOREIGN KEY ("invited_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;