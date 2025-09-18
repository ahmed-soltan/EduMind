"use client";

import { Settings } from "lucide-react";
import {
  IconCreditCard,
  IconDotsVertical,
  IconLogout,
} from "@tabler/icons-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { LogoutButton } from "@/features/auth/components/logout-button";

import { useCurrentUser } from "@/hooks/use-current-user";
import { useBillingModal } from "@/features/billing/hooks/use-billing-modal";
import { useAccountModal } from "@/features/account/hooks/use-account-modal";
import { useHasPermission } from "../api/use-has-permission";

export function NavUser() {
  const { isMobile } = useSidebar();
  const { data: user, isLoading } = useCurrentUser();
  const { openModal: openBillingModal } = useBillingModal();
  const { openModal: openAccountModal } = useAccountModal();
  const { data: hasPermission, isLoading: permissionLoading } =
    useHasPermission("tenant:manage");

  if (!user || isLoading || permissionLoading) return null;

  const avatarFallback = user.firstName
    .split("")[0]
    .toUpperCase()
    .concat(user.lastName.split("")[0].toUpperCase());
  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <Avatar className="h-8 w-8 rounded-lg">
                <AvatarImage src={user.avatar} alt={user.firstName} />
                <AvatarFallback className="rounded-lg">
                  {avatarFallback}
                </AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">
                  {user.firstName} {user.lastName}
                </span>
                <span className="text-muted-foreground truncate text-xs">
                  {user.email}
                </span>
              </div>
              <IconDotsVertical className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                <Avatar className="h-8 w-8 rounded-lg">
                  <AvatarImage src={user.avatar} alt={user.firstName} />
                  <AvatarFallback className="rounded-lg">
                    {avatarFallback}
                  </AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">
                    {user.firstName} {user.lastName}
                  </span>
                  <span className="text-muted-foreground truncate text-xs">
                    {user.email}
                  </span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              {hasPermission && (
                <DropdownMenuItem onClick={openBillingModal}>
                  <IconCreditCard />
                  Billing & Usage
                </DropdownMenuItem>
              )}
              <DropdownMenuItem onClick={openAccountModal}>
                <Settings />
                Account & Profile
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <LogoutButton variant="ghost" className="w-full text-left mb-1">
              <IconLogout />
              Log out
            </LogoutButton>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
