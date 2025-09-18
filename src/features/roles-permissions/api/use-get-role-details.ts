import { useQuery } from "@tanstack/react-query";

interface RoleDetails {
  id: string;
  roleName: string;
  roleDescription: string | null;
  isDefault: boolean;
  permissions: string[];
}

export const useGetRoleDetails = (roleId: string | null) => {
  return useQuery({
    queryKey: ["role-details", roleId],
    queryFn: async (): Promise<RoleDetails> => {
      if (!roleId) throw new Error("Role ID is required");
      
      const res = await fetch(`/api/roles/${roleId}`, {
        credentials: "include",
      });
      
      if (!res.ok) {
        throw new Error("Failed to fetch role details");
      }
      
      return res.json();
    },
    enabled: !!roleId,
  });
};