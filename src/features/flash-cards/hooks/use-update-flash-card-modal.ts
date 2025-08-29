import { useQueryState, parseAsString } from "nuqs";

export const useUpdateFlashCardModal = () => {
  const [flashCardId, setFlashCardId] = useQueryState("update-flash-card", parseAsString);

  const close = () => setFlashCardId(null);
  const open = (id: string) => setFlashCardId(id);

  return { open, setFlashCardId, close, flashCardId };
};
