import * as React from 'react';

interface InviteMemberEmailProps {
  inviterName: string;
  inviterEmail: string;
  tenantName: string;
  roleName: string;
  inviteLink: string;
  isExistingUser: boolean;
}

export function InviteMemberEmailTemplate({
  inviterName,
  inviterEmail,
  tenantName,
  roleName,
  inviteLink,
  isExistingUser,
}: InviteMemberEmailProps) {
  return (
    <div style={{
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
      lineHeight: '1.6',
      color: '#333333',
      maxWidth: '600px',
      margin: '0 auto',
      padding: '20px',
    }}>
      {/* Header */}
      <div style={{
        textAlign: 'center',
        marginBottom: '40px',
        paddingBottom: '20px',
        borderBottom: '1px solid #eee',
      }}>
        <div style={{
          width: '60px',
          height: '60px',
          backgroundColor: '#3b82f6',
          borderRadius: '12px',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '16px',
        }}>
          <span style={{ fontSize: '24px', color: 'white' }}>📧</span>
        </div>
        <h1 style={{
          margin: '0',
          fontSize: '28px',
          fontWeight: '700',
          color: '#1f2937',
        }}>
          {isExistingUser ? 'You\'ve been added to a team!' : 'You\'re invited to join a team!'}
        </h1>
      </div>

      {/* Main Content */}
      <div style={{ marginBottom: '32px' }}>
        <p style={{ fontSize: '16px', marginBottom: '16px', color: '#4b5563' }}>
          Hi there! 👋
        </p>
        
        <p style={{ fontSize: '16px', marginBottom: '24px', color: '#4b5563' }}>
          <strong>{inviterName}</strong> ({inviterEmail}) has invited you to join the <strong>{tenantName}</strong> team on EduMind as a <strong>{roleName}</strong>.
        </p>

        <div style={{
          backgroundColor: '#f0f9ff',
          border: '1px solid #7dd3fc',
          borderRadius: '8px',
          padding: '16px',
          marginBottom: '24px',
        }}>
          <p style={{ margin: '0', fontSize: '14px', color: '#0369a1' }}>
            <strong>Next Steps:</strong> Click the button below to review and accept your invitation. {isExistingUser ? 'You\'ll then be redirected to sign in to your existing account.' : 'You\'ll be guided through creating your EduMind account.'}
          </p>
        </div>

        <div style={{
          backgroundColor: '#f9fafb',
          border: '1px solid #e5e7eb',
          borderRadius: '8px',
          padding: '20px',
          marginBottom: '32px',
        }}>
          <h3 style={{
            margin: '0 0 12px 0',
            fontSize: '16px',
            fontWeight: '600',
            color: '#1f2937',
          }}>
            Team Details:
          </h3>
          <ul style={{ margin: '0', paddingLeft: '20px', color: '#4b5563' }}>
            <li><strong>Team:</strong> {tenantName}</li>
            <li><strong>Your role:</strong> {roleName}</li>
            <li><strong>Invited by:</strong> {inviterName}</li>
          </ul>
        </div>

        {/* CTA Button */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <a
            href={inviteLink}
            style={{
              display: 'inline-block',
              backgroundColor: '#3b82f6',
              color: 'white',
              padding: '12px 32px',
              borderRadius: '8px',
              textDecoration: 'none',
              fontSize: '16px',
              fontWeight: '600',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
            }}
          >
            Accept Invitation
          </a>
        </div>

        <p style={{ fontSize: '14px', color: '#6b7280', textAlign: 'center', marginBottom: '32px' }}>
          This invitation link will expire in 7 days for security reasons.
        </p>
      </div>

      {/* Features Section */}
      <div style={{
        backgroundColor: '#f8fafc',
        borderRadius: '8px',
        padding: '24px',
        marginBottom: '32px',
      }}>
        <h3 style={{
          margin: '0 0 16px 0',
          fontSize: '18px',
          fontWeight: '600',
          color: '#1f2937',
        }}>
          What you can do with EduMind:
        </h3>
        <div style={{ display: 'grid', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '20px' }}>🧠</span>
            <span style={{ fontSize: '14px', color: '#4b5563' }}>Create and take interactive quizzes</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '20px' }}>📚</span>
            <span style={{ fontSize: '14px', color: '#4b5563' }}>Build flashcard decks for effective learning</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '20px' }}>📄</span>
            <span style={{ fontSize: '14px', color: '#4b5563' }}>Upload and analyze documents with AI</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '20px' }}>📊</span>
            <span style={{ fontSize: '14px', color: '#4b5563' }}>Track learning progress and analytics</span>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div style={{
        borderTop: '1px solid #e5e7eb',
        paddingTop: '24px',
        textAlign: 'center',
      }}>
        <p style={{ fontSize: '12px', color: '#9ca3af', margin: '0 0 8px 0' }}>
          This email was sent to you because {inviterName} invited you to join {tenantName} on EduMind.
        </p>
        <p style={{ fontSize: '12px', color: '#9ca3af', margin: '0' }}>
          If you didn't expect this invitation, you can safely ignore this email.
        </p>
        <div style={{ marginTop: '16px' }}>
          <p style={{ fontSize: '12px', color: '#9ca3af', margin: '0' }}>
            © 2025 EduMind. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}