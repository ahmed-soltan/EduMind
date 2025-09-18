import { parseAsBoolean, useQueryState } from "nuqs";

export const useBillingModal = () => {
  const [isOpen, setIsOpen] = useQueryState(
    "billing",
    parseAsBoolean.withDefault(false)
  );

  const openModal = () => setIsOpen(true);
  const closeModal = () => setIsOpen(false);

  return {
    isOpen,
    openModal,
    closeModal,
  };
};
