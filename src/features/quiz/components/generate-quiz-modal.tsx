"use client"
import { ResponsiveModal } from "@/components/responsive-modal";
import { useGenerateQuizModal } from "../hooks/use-generate-quiz-modal";
import { GenerateQuizForm } from "./generate-quiz-form";

export const GenerateQuizModal = () => {
    const { close, isOpen, setIsOpen } = useGenerateQuizModal();
  return (
    <ResponsiveModal open={isOpen} onOpenChange={setIsOpen}>
      <GenerateQuizForm onCancel={close}  />
    </ResponsiveModal>
  );
};
