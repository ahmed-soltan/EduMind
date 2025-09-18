import { Clock } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { useTenantInvoices } from "../api/use-tenant-invoices";

export const InvoicesTab = () => {
  const { data, isLoading } = useTenantInvoices();

  const InvoiceItemSkeleton = () => (
    <div className="flex items-center justify-between p-3 border border-neutral-500 rounded-lg gap-3">
      <div className="space-y-2 flex-1">
        <Skeleton className="h-4 w-48" />
        <Skeleton className="h-3 w-24" />
      </div>
      <div className="text-right space-y-2">
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-6 w-12 rounded-full" />
      </div>
    </div>
  );

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="w-5 h-5" />
          Billing History
        </CardTitle>
        <CardDescription>
          Your recent billing history and invoices
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {isLoading ? (
            <>
              <InvoiceItemSkeleton />
              <InvoiceItemSkeleton />
              <InvoiceItemSkeleton />
              <InvoiceItemSkeleton />
              <InvoiceItemSkeleton />
            </>
          ) : (
            data?.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between p-3 border border-neutral-500 rounded-lg gap-3"
              >
                <div className="space-y-2">
                  <p className="font-medium">{item.plan} Plan - {item.billingCycle}</p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(item.paidAt || item.issuedAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="text-right space-y-2">
                  <p className="font-medium">{(item.amountCents / 100).toFixed(2)}</p>
                  <Badge variant="default">
                      {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                  </Badge>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};
