import { useQueryState, parseAsBoolean } from "nuqs";

export const useCreateDeckModal = () => {
  const [ isOpen, setIsOpen ] = useQueryState(
    "create-deck",
    parseAsBoolean.withDefault(false).withOptions({ clearOnDefault: true })
  );

  const close = () => setIsOpen(false);
  const open = () => setIsOpen(true);

  return { open, setIsOpen, close, isOpen };
};
