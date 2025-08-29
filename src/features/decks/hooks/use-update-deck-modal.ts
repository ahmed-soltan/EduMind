import { useQueryState, parseAsString } from "nuqs";

export const useUpdateDeckModal = () => {
  const [deckId, setDeckId] = useQueryState("update-deck", parseAsString);

  const close = () => setDeckId(null);
  const open = (id: string) => setDeckId(id);

  return { open, setDeckId, close, deckId };
};
