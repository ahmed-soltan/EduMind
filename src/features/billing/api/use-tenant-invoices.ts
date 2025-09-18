import { Invoices } from "@/db/types";
import { useQuery } from "@tanstack/react-query";

export const useTenantInvoices = () => {
  return useQuery<void, Error, Invoices[]>({
    queryKey: ["tenant-invoices"],
    queryFn: async () => {
      const res = await fetch("/api/invoices", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (!res.ok) {
        throw new Error("Failed to fetch tenant invoices");
      }
      return res.json();
    },
  });
};
