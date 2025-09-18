"use client";
import dynamic from "next/dynamic";
import React from "react";

const MembersList = dynamic(
  () =>
    import("@/features/manage-members/components/members-list").then(
      (mod) => mod.MembersList
    ),
  { ssr: false }
);

const ManageMembersPage = () => {
  return (
    <div className="w-full h-full p-5">
      <MembersList />
    </div>
  );
};

export default ManageMembersPage;
