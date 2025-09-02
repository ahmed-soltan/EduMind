import { ResponsiveModal } from "@/components/responsive-modal";
import { useSettingsModal } from "../hooks/use-settings-modal";
import { SettingsForm } from "./settings-form";

export const SettingsModal = () => {
  const { isOpen, close } = useSettingsModal();

  return (
    <ResponsiveModal open={isOpen} onOpenChange={close}>
      <SettingsForm />
    </ResponsiveModal>
  );
};
