"use client";

import { CreditCard } from "lucide-react";

import { PlansTab } from "./plans-tab";
import { UsageTab } from "./usage-tab";
import { InvoicesTab } from "./invoices-tab";
import { SubscriptionTab } from "./subscription-tab";
import { useBillingModal } from "../hooks/use-billing-modal";
import { ResponsiveModal } from "@/components/responsive-modal";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const BillingModal = () => {
  const { isOpen, closeModal } = useBillingModal();

  return (
    <ResponsiveModal open={isOpen} onOpenChange={closeModal}>
      <div className="p-6 w-full mx-auto border border-neutral-500 rounded-lg">
        <div className="mb-6">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <CreditCard className="w-6 h-6" />
            Billing & Usage
          </h2>
          <p className="text-muted-foreground">
            Manage your subscription and monitor feature usage
          </p>
        </div>

        <Tabs defaultValue="usage" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="usage">Usage</TabsTrigger>
            <TabsTrigger value="subscription">Subscription</TabsTrigger>
            <TabsTrigger value="plans">Plans</TabsTrigger>
            <TabsTrigger value="billing">Billing</TabsTrigger>
          </TabsList>

          <TabsContent value="usage" className="space-y-4">
            <UsageTab />
          </TabsContent>

          <TabsContent value="subscription" className="space-y-4">
            <SubscriptionTab />
          </TabsContent>

          <TabsContent value="plans" className="space-y-4">
            <PlansTab />
          </TabsContent>

          <TabsContent value="billing" className="space-y-4">
            <InvoicesTab />
          </TabsContent>
        </Tabs>
      </div>
    </ResponsiveModal>
  );
};
