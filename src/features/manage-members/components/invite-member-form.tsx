import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Mail, UserPlus, Loader2 } from "lucide-react";
import { useGetRoles } from "../api/use-get-roles";
import { useInviteMember } from "../api/use-invite-member";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const inviteSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  roleId: z.string().min(1, "Please select a role"),
});

type InviteFormData = z.infer<typeof inviteSchema>;

interface InviteMemberFormProps {
  onCancel: () => void;
}

export const InviteMemberForm = ({ onCancel }: InviteMemberFormProps) => {
  const { data: tenantRole, isLoading: rolesLoading } = useGetRoles();
  const { mutateAsync: inviteMember, isPending } = useInviteMember();

  const form = useForm<InviteFormData>({
    resolver: zodResolver(inviteSchema),
    defaultValues: {
      email: "",
      roleId: "",
    },
  });

  if (rolesLoading) {
    return null; // or a loading spinner if you prefer
  }

  const onSubmit = async (data: InviteFormData) => {
    await inviteMember(data, {
      onSuccess: (response) => {
        toast.success(response.message || "Invitation sent successfully!");
        form.reset();
        close();
      },
      onError: (error: any) => {
        toast.error(error.message || "Failed to send invitation");
      },
    });
    onCancel();
  };
  return (
    <Card className="border-neutral-500">
      <CardHeader>
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
          <UserPlus className="h-6 w-6 text-blue-600" />
        </div>
        <div className="text-center">
          <CardTitle className="text-xl font-semibold">
            Invite Team Member
          </CardTitle>
          <CardDescription className="mt-2 text-sm text-muted-foreground">
            Send an invitation to add a new member to your team. They'll receive
            an email with instructions to join.
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-6 w-full"
          >
            <div className="grid grid-cols-1 lg:grid-cols-4 w-full gap-2">
              <div className="col-span-1 lg:col-span-3">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium">
                        Email Address
                      </FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                          <Input
                            {...field}
                            type="email"
                            placeholder="Enter email address"
                            className="pl-10"
                            disabled={isPending}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="roleId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium">Role</FormLabel>
                    <FormControl>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                        disabled={isPending || rolesLoading}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select a role" />
                        </SelectTrigger>
                        <SelectContent>
                          {tenantRole?.map((role: any) => (
                            <SelectItem
                              key={role.id}
                              value={role.id}
                              disabled={role.roleName === "owner"}
                            >
                              <div className="flex flex-col">
                                <span className="font-medium">
                                  {role.roleName}
                                </span>
                                {/* {role.roleDescription && (
                                    <span className="text-xs text-muted-foreground">
                                      {role.roleDescription}
                                    </span>
                                  )} */}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            {/* Action Buttons */}
            <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={close}
                disabled={isPending}
                className="w-full sm:w-auto"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isPending || rolesLoading || !form.formState.isValid}
                className="w-full sm:w-auto"
              >
                {isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending Invitation...
                  </>
                ) : (
                  <>
                    <UserPlus className="mr-2 h-4 w-4" />
                    Send Invitation
                  </>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};
