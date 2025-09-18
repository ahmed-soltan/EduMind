CREATE TABLE "pending_invitations" (
	"id" varchar PRIMARY KEY NOT NULL,
	"token" varchar(64) NOT NULL,
	"email" varchar(255) NOT NULL,
	"tenant_id" varchar NOT NULL,
	"role_id" varchar NOT NULL,
	"invited_by" varchar NOT NULL,
	"is_used" boolean DEFAULT false,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"used_at" timestamp,
	CONSTRAINT "pending_invitations_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE INDEX "pending_invitations_token_idx" ON "pending_invitations" USING btree ("token");--> statement-breakpoint
CREATE INDEX "pending_invitations_email_idx" ON "pending_invitations" USING btree ("email");--> statement-breakpoint
CREATE INDEX "pending_invitations_tenant_idx" ON "pending_invitations" USING btree ("tenant_id");