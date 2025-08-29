import { useQueryState, parseAsBoolean } from "nuqs";

export const useGenerateQuizModal = () => {
  const [ isOpen, setIsOpen ] = useQueryState(
    "generate-quiz",
    parseAsBoolean.withDefault(false).withOptions({ clearOnDefault: true })
  );

  const close = () => setIsOpen(false);
  const open = () => setIsOpen(true);

  return { open, setIsOpen, close, isOpen };
};
