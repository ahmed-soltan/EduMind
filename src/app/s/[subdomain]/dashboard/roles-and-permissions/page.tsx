"use client";

import React from "react";
import { RolesAndPermissionsHeader } from "@/features/roles-permissions/components/roles-permissions-header";
import { RolesList } from "@/features/roles-permissions/components/roles-list";
import { PermissionsOverview } from "@/features/roles-permissions/components/permissions-overview";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Shield, Lock } from "lucide-react";
import { useHasPermission } from "@/features/dashboard/api/use-has-permission";
import dynamic from "next/dynamic";

const CreateRoleModal = dynamic(() =>
  import("@/features/roles-permissions/components/create-role-modal").then(
    (mod) => mod.CreateRoleModal
  )
);

const EditRoleModal = dynamic(() =>
  import("@/features/roles-permissions/components/edit-role-modal").then(
    (mod) => mod.EditRoleModal
  )
);

const RolesAndPermissionsPage = () => {
  const { data: hasPermission, isLoading } = useHasPermission("tenant:manage");

  if (isLoading) {
    return (
      <div className="space-y-6 p-5">
        <div className="h-24 bg-muted animate-pulse rounded-lg" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-32 bg-muted animate-pulse rounded-lg" />
            ))}
          </div>
          <div className="space-y-4">
            <div className="h-48 bg-muted animate-pulse rounded-lg" />
          </div>
        </div>
      </div>
    );
  }

  if (!hasPermission) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Alert className="max-w-md border-red-200 bg-red-50 dark:bg-red-950/20 dark:border-red-800">
          <Lock className="h-4 w-4 text-red-600 dark:text-red-400" />
          <AlertDescription className="text-red-700 dark:text-red-300">
            You don't have permission to manage roles and permissions. Contact
            your team administrator for access.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <RolesAndPermissionsHeader />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-5">
        <div className="lg:col-span-2">
          <RolesList />
        </div>
        <div>
          <PermissionsOverview />
        </div>
      </div>

      <CreateRoleModal />
      <EditRoleModal />
    </div>
  );
};

export default RolesAndPermissionsPage;
