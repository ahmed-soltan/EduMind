"use client";

import { ResponsiveModal } from "@/components/responsive-modal";
import { useInviteMemberModal } from "../hooks/use-invite-member-modal";
import { InviteMemberForm } from "./invite-member-form";

export const InviteMemberModal = () => {
  const { isOpen, close } = useInviteMemberModal();

  return (
    <ResponsiveModal open={isOpen} onOpenChange={close}>
      <InviteMemberForm onCancel={close} />
    </ResponsiveModal>
  );
};
