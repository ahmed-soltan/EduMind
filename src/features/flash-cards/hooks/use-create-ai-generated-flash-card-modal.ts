import { useQueryState, parseAsBoolean } from "nuqs";

export const useCreateAIGeneratedFlashCardModal = () => {
  const [ isOpen, setIsOpen ] = useQueryState(
    "ai-flash-card",
    parseAsBoolean.withDefault(false).withOptions({ clearOnDefault: true })
  );

  const close = () => setIsOpen(false);
  const open = () => setIsOpen(true);

  return { open, setIsOpen, close, isOpen };
};
