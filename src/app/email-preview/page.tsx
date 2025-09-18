"use client";

import { InviteMemberEmailTemplate } from "@/components/email-template";

export default function EmailPreview() {
  const sampleProps = {
    inviterName: "John Doe",
    inviterEmail: "john@example.com",
    tenantName: "Acme Learning Team",
    roleName: "Member",
    inviteLink: "https://app.edumind.com/acme/dashboard",
    isExistingUser: false,
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Email Template Preview</h1>
      
      <div className="mb-8">
        <h2 className="text-lg font-semibold mb-2">New User Invitation</h2>
        <div className="border rounded-lg p-4 bg-white">
          <InviteMemberEmailTemplate {...sampleProps} />
        </div>
      </div>

      <div className="mb-8">
        <h2 className="text-lg font-semibold mb-2">Existing User Invitation</h2>
        <div className="border rounded-lg p-4 bg-white">
          <InviteMemberEmailTemplate {...sampleProps} isExistingUser={true} />
        </div>
      </div>
    </div>
  );
}