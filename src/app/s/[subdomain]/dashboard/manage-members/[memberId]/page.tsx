import { MemberDetailsContent } from "@/features/manage-members/components/member-details-content";
import React from "react";

interface MemberDetailsPageProps {
  params: Promise<{ subdomain: string; memberId: string }>;
}

const MemberDetailsPage = async ({ params }: MemberDetailsPageProps) => {
  const { memberId } = await params;

  return (
    <div className="w-full h-full p-5">
      <MemberDetailsContent memberId={memberId} />
    </div>
  );
};

export default MemberDetailsPage;