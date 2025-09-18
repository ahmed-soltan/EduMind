"use client";

import { Users, UserPlus } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { InviteMemberModal } from "./invite-member-modal";
import { DataTable } from "@/features/manage-members/components/data-table";

import { useGetRoles } from "../api/use-get-roles";
import { useGetMembers } from "../api/use-get-members";
import { useCurrentMember } from "../api/use-current-member";
import { useInviteMemberModal } from "../hooks/use-invite-member-modal";

export const MembersList = () => {
  const { data: members, isLoading: isLoadingMembers } = useGetMembers();
  const { data: currentMember, isLoading: isLoadingCurrentMember } =
    useCurrentMember();
  const { data: tenantRoles, isLoading: isLoadingRoles } = useGetRoles();
  const { open: openInviteModal } = useInviteMemberModal();

  const isLoading =
    isLoadingMembers || isLoadingCurrentMember || isLoadingRoles;

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <Skeleton className="h-6 w-32 mb-2" />
              <Skeleton className="h-4 w-48" />
            </div>
            <Skeleton className="h-10 w-32" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Skeleton className="h-10 w-full" />
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center space-x-4">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-4 w-48" />
                  <Skeleton className="h-3 w-32" />
                </div>
                <Skeleton className="h-6 w-16" />
                <Skeleton className="h-8 w-8" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Team Members
              </CardTitle>
              <CardDescription>
                Manage your organization members and their permissions
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary">{members?.length || 0} members</Badge>
              {currentMember?.permissions?.includes("members:manage") && (
                <Button
                  onClick={openInviteModal}
                  size="sm"
                  className="gap-2"
                >
                  <UserPlus className="w-4 h-4" />
                  Invite Member
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <DataTable
            data={{
              members,
              currentMemberId: currentMember?.id,
              tenantRoles: tenantRoles!,
            }}
          />
        </CardContent>
      </Card>

      {/* Modals */}
      <InviteMemberModal />
    </>
  );
};
