import { InviteMemberEmailTemplate } from "@/components/email-template";

interface InviteMemberEmailProps {
  inviterName: string;
  inviterEmail: string;
  tenantName: string;
  roleName: string;
  inviteLink: string;
  isExistingUser: boolean;
}

export function generateInviteEmailText({
  inviterName,
  inviterEmail,
  tenantName,
  roleName,
  inviteLink,
  isExistingUser,
}: InviteMemberEmailProps): string {
  return `
You're invited to join a team!

Hi there! 👋

${inviterName} (${inviterEmail}) has invited you to join the ${tenantName} team on EduMind as a ${roleName}.

Next Steps: Click the link below to review and accept your invitation. ${isExistingUser ? 'You\'ll then be redirected to sign in to your existing account.' : 'You\'ll be guided through creating your EduMind account.'}

Team Details:
• Team: ${tenantName}
• Your role: ${roleName}
• Invited by: ${inviterName}

Accept your invitation:
${inviteLink}

This invitation link will expire in 7 days for security reasons.

What you can do with EduMind:
🧠 Create and take interactive quizzes
📚 Build flashcard decks for effective learning
📄 Upload and analyze documents with AI
📊 Track learning progress and analytics

---

This email was sent to you because ${inviterName} invited you to join ${tenantName} on EduMind.
If you didn't expect this invitation, you can safely ignore this email.

© 2025 EduMind. All rights reserved.
  `.trim();
}

export { InviteMemberEmailTemplate };