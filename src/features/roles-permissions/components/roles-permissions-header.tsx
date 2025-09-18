"use client";

import { Button } from "@/components/ui/button";
import { Shield, Plus, Users } from "lucide-react";
import { useGetRoles } from "@/features/manage-members/api/use-get-roles";
import { useCreateRoleModal } from "../hooks/use-create-role-modal";

export const RolesAndPermissionsHeader = () => {
  const { open } = useCreateRoleModal();
  const { data: roles } = useGetRoles();

  const totalRoles = roles?.length || 0;

  return (
    <header className="bg-neutral-900 p-5 flex justify-between items-center gap-y-4 flex-wrap">
      {/* Left side - Title and Stats */}
      <div className="flex items-center gap-4">
        <div className="bg-blue-600 p-2 rounded-lg">
          <Shield className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-xl font-semibold text-white">
            Roles & Permissions
          </h1>
          <p className="text-neutral-400 text-sm">
            Manage team roles and control access permissions
          </p>
        </div>
        <div className="hidden sm:flex items-center gap-2 bg-neutral-800 px-3 py-1.5 rounded-full">
          <Users className="w-4 h-4 text-neutral-400" />
          <span className="text-sm text-neutral-300">
            {totalRoles} Role{totalRoles !== 1 ? 's' : ''}
          </span>
        </div>
      </div>

      {/* Right side - Actions */}
      <div className="flex items-center gap-3">
        <Button
          onClick={open}
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create Role
        </Button>
      </div>
    </header>
  );
};