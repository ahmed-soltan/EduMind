"use client";
import { ResponsiveModal } from "@/components/responsive-modal";
import { useCreateFlashCardModal } from "../hooks/use-create-flash-card-modal";
import { CreateFlashCardForm } from "./create-flash-card-form";


export const CreateFlashCardModal = () => {
  const { close, isOpen, setIsOpen } = useCreateFlashCardModal();
  return (
    <ResponsiveModal open={isOpen} onOpenChange={setIsOpen}>
      <CreateFlashCardForm onCancel={close} />
    </ResponsiveModal>
  );
};
