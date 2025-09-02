import { parseAsBoolean, useQueryState } from "nuqs";

export const useSettingsModal = () => {
  const [isOpen, setIsOpen] = useQueryState(
    "settings",
    parseAsBoolean.withDefault(false)
  );

  return {
    isOpen,
    open: () => setIsOpen(true),
    close: () => setIsOpen(false),
  };
};
