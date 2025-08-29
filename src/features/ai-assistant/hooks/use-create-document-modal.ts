import { useQueryState, parseAsBoolean } from "nuqs";

export const useCreateDocumentModal = () => {
  const [ isOpen, setIsOpen ] = useQueryState(
    "create-document",
    parseAsBoolean.withDefault(false).withOptions({ clearOnDefault: true })
  );

  const close = () => setIsOpen(false);
  const open = () => setIsOpen(true);

  return { open, setIsOpen, close, isOpen };
};
