"use client";

import { Loader2 } from "lucide-react";

import { ResponsiveModal } from "@/components/responsive-modal";
import { Button, ButtonProps } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface ConfirmModalProps {
  title: string;
  message: string;
  callbackFn: () => void;
  open: boolean;
  setOpen: (open: boolean) => void;
  isPending?: boolean;
  variant: ButtonProps["variant"];
}

export const ConfirmModal = ({
  title,
  message,
  callbackFn,
  open,
  setOpen,
  isPending,
  variant = "default",
}: ConfirmModalProps) => {
  const isModalOpen = open;

  if (!isModalOpen) {
    return null;
  }

  return (
    <ResponsiveModal open={open} onOpenChange={setOpen}>
      <Card className="w-full h-full border-neutral-500 shadow-none">
        <CardContent>
          <CardHeader className="p-0">
            <CardTitle>{title}</CardTitle>
            <CardDescription>{message}</CardDescription>
          </CardHeader>
          <div className="pt-4 w-full flex flex-col gap-y-2 lg:flex-row gap-x-2 items-center justify-end">
            <Button
              onClick={() => setOpen(false)}
              variant="outline"
              className="w-full lg:w-auto"
            >
              Cancel
            </Button>
            <Button
              onClick={async () => {
                await callbackFn();
                setOpen(false);
              }}
              variant={variant}
              className="w-full lg:w-auto flex items-center gap-2"
              disabled={isPending}
            >
              {isPending && <Loader2 className="animate-spin size-3" />}
              Confirm
            </Button>
          </div>
        </CardContent>
      </Card>
    </ResponsiveModal>
  );
};
