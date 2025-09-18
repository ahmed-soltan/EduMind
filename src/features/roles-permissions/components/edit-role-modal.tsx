"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useGetAllPermissions } from "@/features/roles-permissions/api/use-get-all-permissions";
import { useGetRoleDetails } from "@/features/roles-permissions/api/use-get-role-details";
import { useUpdateRole } from "@/features/roles-permissions/api/use-update-role";
import { Shield, Key } from "lucide-react";
import { toast } from "sonner";
import { ResponsiveModal } from "@/components/responsive-modal";
import { useEditRoleModal } from "../hooks/use-edit-role-modal";
import { Permissions } from "@/db/types";

const EditRoleSchema = z.object({
  roleName: z
    .string()
    .min(1, "Role name is required")
    .max(50, "Role name must be less than 50 characters"),
  description: z
    .string()
    .max(200, "Description must be less than 200 characters")
    .optional(),
  permissions: z
    .array(z.string())
    .min(1, "At least one permission is required"),
});

type EditRoleFormData = z.infer<typeof EditRoleSchema>;

export const EditRoleModal = () => {
  const { isOpen, close, roleId } = useEditRoleModal();
  const { data: allPermissions, isLoading: isLoadingPermissions } =
    useGetAllPermissions();
  const { data: roleDetails, isLoading: isLoadingRole } =
    useGetRoleDetails(roleId);
  const { mutate: updateRole, isPending } = useUpdateRole();

  const form = useForm<EditRoleFormData>({
    resolver: zodResolver(EditRoleSchema),
    defaultValues: {
      roleName: "",
      description: "",
      permissions: [],
    },
  });

  // When roleDetails loads, populate the form with fetched data
  useEffect(() => {
    if (roleDetails) {
      // Normalize permissions to array of IDs (in case API returns objects)
      const permissionsIds =
        (roleDetails.permissions || []).map((p: any) =>
          typeof p === "string" ? p : p.id
      ) ?? [];

      
      form.reset({
        roleName: roleDetails.roleName || "",
        description: roleDetails.roleDescription || "",
        permissions: permissionsIds,
      });
    } else {
      // Optionally reset to empty when there's no roleDetails (e.g. closing modal)
      form.reset({
        roleName: "",
        description: "",
        permissions: [],
      });
    }
    // we intentionally only listen to roleDetails (and form) because that's when we want to reset
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roleDetails]);

  const handleSubmit = (data: EditRoleFormData) => {
    if (!roleId) return;

    updateRole(
      {
        roleId,
        ...data,
      },
      {
        onSuccess: () => {
          toast.success("Role updated successfully");
          close();
        },
        onError: (error: any) => {
          toast.error(error.message || "Failed to update role");
        },
      }
    );
  };
  
  const groupPermissionsByCategory = (permissions: Permissions[]) => {
    const groups = permissions.reduce((acc, permission) => {
      const category = permission.name.split(":")[0];
      if (!acc[category]) acc[category] = [];
      acc[category].push(permission);
      return acc;
    }, {} as Record<string, Permissions[]>);

    return Object.entries(groups).sort(([a], [b]) => a.localeCompare(b));
  };

  const formatPermissionName = (permission: string) => {
    return permission
    .split(":")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
  };

  const isLoading = isLoadingRole || isLoadingPermissions;
  const isDefaultRole = !!roleDetails?.isDefault;

  return (
    <ResponsiveModal open={isOpen} onOpenChange={close}>
      {isLoading ? (
        <div className="space-y-4 p-5">
          <div className="space-y-2">
            <div className="h-4 w-20 bg-muted animate-pulse rounded" />
            <div className="h-10 bg-muted animate-pulse rounded" />
          </div>
          <div className="space-y-2">
            <div className="h-4 w-24 bg-muted animate-pulse rounded" />
            <div className="h-20 bg-muted animate-pulse rounded" />
          </div>
          <div className="space-y-4">
            <div className="h-4 w-32 bg-muted animate-pulse rounded" />
            <div className="grid grid-cols-2 gap-2">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-8 bg-muted animate-pulse rounded" />
              ))}
            </div>
          </div>
        </div>
      ) : (
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-6 p-5"
          >
            {/* Basic Information */}
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="roleName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Role Name</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g., Content Creator, Moderator"
                        disabled={isDefaultRole}
                        {...field}
                        // do not use defaultValue; field.value is controlled by RHF/reset
                      />
                    </FormControl>
                    <FormMessage />
                    {isDefaultRole && (
                      <p className="text-xs text-muted-foreground">
                        Default role names cannot be changed
                      </p>
                    )}
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description (Optional)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Describe what this role can do..."
                        className="resize-none"
                        rows={3}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Permissions Selection */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Key className="w-4 h-4" />
                  Permissions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {groupPermissionsByCategory(allPermissions || []).map(
                    ([category, permissions]) => (
                      <div key={category} className="space-y-2">
                        <div className="text-sm font-medium">{category}</div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          {permissions.map((permission) => (
                            <FormField
                              key={permission.id}
                              control={form.control}
                              name="permissions"
                              render={({ field }) => {
                                const currentValue = field.value ?? [];
                                const checked = currentValue.includes(
                                  permission.id
                                );
                                return (
                                  <FormItem className="flex flex-row items-center gap-2">
                                    <FormControl>
                                      <Checkbox
                                        checked={checked}
                                        onCheckedChange={(isChecked) => {
                                          if (isChecked) {
                                            field.onChange([
                                              ...currentValue,
                                              permission.id,
                                            ]);
                                          } else {
                                            field.onChange(
                                              currentValue.filter(
                                                (v: string) => v !== permission.id
                                              )
                                            );
                                          }
                                        }}
                                        disabled={isPending}
                                      />
                                    </FormControl>
                                    <FormLabel className="text-sm font-normal">
                                      {formatPermissionName(permission.name)}
                                    </FormLabel>
                                  </FormItem>
                                );
                              }}
                            />
                          ))}
                        </div>
                      </div>
                    )
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <div className="flex justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  close();
                  // optional: reset form when closing
                  form.reset();
                }}
                disabled={isPending}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isPending}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {isPending ? "Updating..." : "Update Role"}
              </Button>
            </div>
          </form>
        </Form>
      )}
    </ResponsiveModal>
  );
};
