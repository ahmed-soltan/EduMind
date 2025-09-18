"use client";

import { toast } from "sonner";
import { useState } from "react";
import {
  Shield,
  Users,
  Edit3,
  Crown,
  UserCheck,
  Trash2,
  MoreVertical,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ConfirmModal } from "@/components/confirm-modal";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { useDeleteRole } from "../api/use-delete-role";
import { useEditRoleModal } from "../hooks/use-edit-role-modal";
import { useGetRoles } from "@/features/manage-members/api/use-get-roles";

export const RolesList = () => {
  const { data: roles, isLoading } = useGetRoles();
  const { open: openEditModal } = useEditRoleModal();
  const { mutate: deleteRole, isPending: isDeleting } = useDeleteRole();
  const [openConfirmModal, setOpenConfirmModal] = useState(false);

  const handleDeleteRole = (roleId: string, roleName: string) => {
    deleteRole(roleId, {
      onSuccess: () => {
        toast.success(`Role "${roleName}" deleted successfully`);
      },
      onError: (error: Error) => {
        toast.error(error.message);
      },
    });
  };

  const getRoleIcon = (roleName: string) => {
    const name = roleName.toLowerCase();
    if (name.includes("owner")) return <Crown className="w-4 h-4" />;
    if (name.includes("admin")) return <Shield className="w-4 h-4" />;
    if (name.includes("member")) return <UserCheck className="w-4 h-4" />;
    return <Users className="w-4 h-4" />;
  };

  const getRoleColor = (roleName: string) => {
    const name = roleName.toLowerCase();
    if (name.includes("owner"))
      return "bg-yellow-100 text-yellow-800 border-yellow-200";
    if (name.includes("admin"))
      return "bg-blue-100 text-blue-800 border-blue-200";
    if (name.includes("member"))
      return "bg-green-100 text-green-800 border-green-200";
    return "bg-gray-100 text-gray-800 border-gray-200";
  };

  if (isLoading) {
    return (
      <Card className="p-5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Team Roles
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="flex items-center justify-between p-4 border rounded-lg"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-muted animate-pulse rounded-full" />
                <div className="space-y-2">
                  <div className="h-4 w-24 bg-muted animate-pulse rounded" />
                  <div className="h-3 w-32 bg-muted animate-pulse rounded" />
                </div>
              </div>
              <div className="w-20 h-8 bg-muted animate-pulse rounded" />
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  console.log(roles)

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Team Roles
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {roles?.map((role) => (
            <div
              key={role.id}
              className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
            >
              <ConfirmModal
                title="Delete Role"
                message="Are you sure you want to delete this role? This action cannot be undone."
                open={openConfirmModal}
                setOpen={setOpenConfirmModal}
                callbackFn={() => handleDeleteRole(role.id, role.roleName)}
                variant={"destructive"}
                isPending={isDeleting}
              />
              <div className="flex items-center gap-3">
                <div
                  className={`p-2 rounded-full ${getRoleColor(role.roleName)}`}
                >
                  {getRoleIcon(role.roleName)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium">{role.roleName}</h3>
                    {role.isDefault && (
                      <Badge variant="outline" className="text-xs">
                        Default
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {role.roleDescription || "No description available"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="text-xs">
                  {role.permissionsCount || 0} Permission
                  {(role.permissionsCount || 0) !== 1 ? "s" : ""}
                </Badge>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => openEditModal(role.id)}>
                      <Edit3 className="w-4 h-4 mr-2" />
                      Edit Role
                    </DropdownMenuItem>
                    {!role.isDefault && !role.isProtected && (
                      <DropdownMenuItem
                        onClick={() => setOpenConfirmModal(true)}
                        className="text-red-600 focus:text-red-600"
                        disabled={isDeleting}
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete Role
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          ))}

          {roles?.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <Shield className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No roles found. Create your first role to get started.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </>
  );
};
