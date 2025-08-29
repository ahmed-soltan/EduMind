"use client";

import { UpdateDeckForm } from "./update-deck-form";
import { ResponsiveModal } from "@/components/responsive-modal";

import { useGetDeck } from "../api/use-get-deck";
import { useUpdateDeckModal } from "../hooks/use-update-deck-modal";

export const UpdateDeckModal = () => {
  const { close, deckId } = useUpdateDeckModal();
  const { data, isLoading } = useGetDeck(deckId);

  if (isLoading) return null;

  return (
    <ResponsiveModal open={!!deckId} onOpenChange={close}>
      {deckId && data && (
          <UpdateDeckForm
            onCancel={close}
            initialData={{
              title: data?.title,
              description: data?.description,
              id: data?.id,
            }}
          />
        )}
    </ResponsiveModal>
  );
};
