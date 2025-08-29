"use client";

import { UpdateFlashCardForm } from "./update-flash-card-form";
import { ResponsiveModal } from "@/components/responsive-modal";

import { useGetFlashCard } from "../api/use-get-flash-card";
import { useUpdateFlashCardModal } from "../hooks/use-update-flash-card-modal";

export const UpdateFlashCardModal = () => {
  const { close, flashCardId } = useUpdateFlashCardModal();
  const { data, isLoading } = useGetFlashCard(flashCardId!);

  if (isLoading) return null;

  return (
    <ResponsiveModal open={!!flashCardId} onOpenChange={close}>
      {flashCardId && data && (
        <UpdateFlashCardForm
          onCancel={close}
          initialData={{
            front: data?.front,
            back: data?.back,
            id: data?.id,
          }}
        />
      )}
    </ResponsiveModal>
  );
};
