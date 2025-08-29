"use client";
import { ResponsiveModal } from "@/components/responsive-modal";
import { useCreateDeckModal } from "../hooks/use-create-deck-modal";
import { CreateDeckForm } from "./create-deck-form";

export const CreateDeckModal = () => {
  const { close, isOpen, setIsOpen } = useCreateDeckModal();
  return (
    <ResponsiveModal open={isOpen} onOpenChange={setIsOpen}>
      <CreateDeckForm onCancel={close} />
    </ResponsiveModal>
  );
};
