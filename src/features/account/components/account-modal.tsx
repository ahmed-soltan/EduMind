"use client";

import { User2 } from "lucide-react";

import { AccountTab } from "./account-tab";
import { ProfileTab } from "./profile-tab";
import { ResponsiveModal } from "@/components/responsive-modal";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { useAccountModal } from "../hooks/use-account-modal";

export const AccountModal = () => {
  const { isOpen, closeModal } = useAccountModal();

  return (
    <ResponsiveModal open={isOpen} onOpenChange={closeModal}>
      <div className="p-6 w-full mx-auto border border-neutral-500 rounded-lg">
        <div className="mb-6">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <User2 className="w-6 h-6" />
            Account & Profile
          </h2>
          <p className="text-muted-foreground">
            Manage your Account and Profile
          </p>
        </div>

        <Tabs defaultValue="account" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="account">Account</TabsTrigger>
            <TabsTrigger value="profile">Profile</TabsTrigger>
          </TabsList>

          <TabsContent value="account" className="space-y-4">
            <AccountTab />
          </TabsContent>

          <TabsContent value="profile" className="space-y-4">
            <ProfileTab />
          </TabsContent>
        </Tabs>
      </div>
    </ResponsiveModal>
  );
};
