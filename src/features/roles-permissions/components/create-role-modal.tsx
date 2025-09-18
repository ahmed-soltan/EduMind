"use client";

import { z } from "zod";
import { toast } from "sonner";
import { Key } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { ResponsiveModal } from "@/components/responsive-modal";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

import { useCreateRole } from "../api/use-create-role";
import { useCreateRoleModal } from "../hooks/use-create-role-modal";
import { useGetAllPermissions } from "@/features/roles-permissions/api/use-get-all-permissions";

import { Permissions } from "@/db/types";

const createRoleSchema = z.object({
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

type CreateRoleFormData = z.infer<typeof createRoleSchema>;

export const CreateRoleModal = () => {
  const { isOpen, close } = useCreateRoleModal();
  const { data: allPermissions, isLoading: isLoadingPermissions } =
    useGetAllPermissions();
  const { mutate: createRole, isPending } = useCreateRole();

  const form = useForm<CreateRoleFormData>({
    resolver: zodResolver(createRoleSchema),
    defaultValues: {
      roleName: "",
      description: "",
      permissions: [],
    },
  });

  const handleSubmit = (data: CreateRoleFormData) => {
    createRole(data, {
      onSuccess: () => {
        toast.success("Role created successfully");
        form.reset();
        close();
      },
      onError: (error: any) => {
        toast.error(error.message || "Failed to create role");
      },
    });
  };

  const groupPermissionsByCategory = (permissions: Permissions[]) => {
    const groups = permissions.reduce(
      (acc, permission) => {
        const category = permission.name.split(":")[0];
        if (!acc[category]) acc[category] = [];
        acc[category].push(permission);
        return acc;
      },
      {} as Record<string, Permissions[]>
    );

    return Object.entries(groups).sort(([a], [b]) => a.localeCompare(b));
  };

  const formatPermissionName = (name: string) => {
    return name
      .split(":")
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(" ");
  };

  return (
    <ResponsiveModal open={isOpen} onOpenChange={close}>
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
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
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
              {isLoadingPermissions ? (
                <div className="space-y-4">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="space-y-2">
                      <div className="h-4 w-24 bg-muted animate-pulse rounded" />
                      <div className="grid grid-cols-2 gap-2">
                        {Array.from({ length: 4 }).map((_, j) => (
                          <div
                            key={j}
                            className="h-8 bg-muted animate-pulse rounded"
                          />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
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
                                                (v: string) =>
                                                  v !== permission.id
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
              )}
              <FormMessage>
                {form.formState.errors.permissions?.message}
              </FormMessage>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={close}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isPending}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isPending ? "Creating..." : "Create Role"}
            </Button>
          </div>
        </form>
      </Form>
    </ResponsiveModal>
  );
};
