import { Invoices } from "@/db/types";
import apiClient from "@/lib/api";
import { useQuery } from "@tanstack/react-query";

export const useTenantInvoices = () => {
  return useQuery<void, Error, Invoices[]>({
    queryKey: ["tenant-invoices"],
    queryFn: async () => {
      const res = await apiClient("/api/invoices", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
      return res.data;
    },
  });
};
