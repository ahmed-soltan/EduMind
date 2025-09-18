import { parseAsBoolean, parseAsString, useQueryState } from "nuqs";
import { useState } from "react";

export const useEditRoleModal = () => {
  const [isOpen, setIsOpen] = useQueryState(
    "edit-role",
    parseAsBoolean.withDefault(false)
  );
  const [roleId, setRoleId] = useQueryState("role-id", parseAsString);

  const open = (roleId: string) => {
    setRoleId(roleId);
    setIsOpen(true);
  }
  const close = () => {
    setIsOpen(false);
    setRoleId(null);
  };

  return {
    isOpen,
    open,
    close,
    roleId
  };
};
