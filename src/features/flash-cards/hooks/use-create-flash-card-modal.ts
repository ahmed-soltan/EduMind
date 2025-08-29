import { useQueryState, parseAsBoolean } from "nuqs";

export const useCreateFlashCardModal = () => {
  const [ isOpen, setIsOpen ] = useQueryState(
    "create-flash-card",
    parseAsBoolean.withDefault(false).withOptions({ clearOnDefault: true })
  );

  const close = () => setIsOpen(false);
  const open = () => setIsOpen(true);

  return { open, setIsOpen, close, isOpen };
};
