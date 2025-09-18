import { parseAsBoolean, useQueryState } from "nuqs";

export const useAccountModal = () => {
  const [isOpen, setIsOpen] = useQueryState(
    "account",
    parseAsBoolean.withDefault(false)
  );

  const openModal = () => setIsOpen(true);
  const closeModal = () => setIsOpen(false);

  return { isOpen, openModal, closeModal };
};
