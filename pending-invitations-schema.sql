-- Add this to your schema.ts file

export const pendingInvitations = pgTable('pending_invitations', {
  id: varchar('id').primaryKey(),
  token: varchar('token', { length: 64 }).unique().notNull(),
  email: varchar('email', { length: 255 }).notNull(),
  tenantId: varchar('tenant_id').notNull(),
  roleId: varchar('role_id').notNull(),
  invitedBy: varchar('invited_by').notNull(),
  isUsed: boolean('is_used').default(false),
  expiresAt: timestamp('expires_at').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
  usedAt: timestamp('used_at'),
}, (table) => ({
  tokenIdx: index('pending_invitations_token_idx').on(table.token),
  emailIdx: index('pending_invitations_email_idx').on(table.email),
  tenantIdx: index('pending_invitations_tenant_idx').on(table.tenantId),
}));

// Relations
export const pendingInvitationsRelations = relations(pendingInvitations, ({ one }) => ({
  tenant: one(tenants, {
    fields: [pendingInvitations.tenantId],
    references: [tenants.id],
  }),
  role: one(tenantRoles, {
    fields: [pendingInvitations.roleId],
    references: [tenantRoles.id],
  }),
  inviter: one(users, {
    fields: [pendingInvitations.invitedBy],
    references: [users.id],
  }),
}));