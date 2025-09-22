import * as React from "react";

import {
  IconCamera,
  IconDashboard,
  IconFileAi,
  IconFileDescription,
  IconClipboardText,
  IconRobot,
  IconCards,
  IconUsers,
  IconActivity,
  IconShield,
  IconShieldLock,
} from "@tabler/icons-react";

import { Logo } from "@/components/logo";
import { NavMain } from "@/features/dashboard/components/nav-main";
import { NavUser } from "@/features/dashboard/components/nav-user";
import { NavDocuments } from "@/features/dashboard/components/nav-documents";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

import { useCanCreate } from "@/hooks/use-can-create-feature";
import { useHasPermission } from "../api/use-has-permission";

const data = {
  navMain: [
    {
      title: "Dashboard",
      url: "/",
      icon: IconDashboard,
    },
    {
      title: "AI Assistant",
      url: "ai-assistant",
      icon: IconRobot,
    },
    {
      title: "Quiz Generator",
      url: "quiz-generator",
      icon: IconClipboardText,
    },
    {
      title: "Flash Cards",
      url: "decks",
      icon: IconCards,
    },
  ],
  navClouds: [
    {
      title: "Capture",
      icon: IconCamera,
      isActive: true,
      url: "#",
      items: [
        {
          title: "Active Proposals",
          url: "#",
        },
        {
          title: "Archived",
          url: "#",
        },
      ],
    },
    {
      title: "Proposal",
      icon: IconFileDescription,
      url: "#",
      items: [
        {
          title: "Active Proposals",
          url: "#",
        },
        {
          title: "Archived",
          url: "#",
        },
      ],
    },
    {
      title: "Prompts",
      icon: IconFileAi,
      url: "#",
      items: [
        {
          title: "Active Proposals",
          url: "#",
        },
        {
          title: "Archived",
          url: "#",
        },
      ],
    },
  ],
  members: [
    {
      title: "Members Management",
      url: "manage-members",
      icon: IconUsers,
    },
    {
      title: "Roles & Permissions",
      url: "roles-and-permissions",
      icon: IconShieldLock,
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { data: canCreateFeature, isLoading: isLoadingCanCreateFeature } = useCanCreate("teams");
  const {data: hasPermission, isLoading: permissionLoading} = useHasPermission("members:manage");

  const isLoading = isLoadingCanCreateFeature || permissionLoading;

  if (isLoading) return null;

  console.log(canCreateFeature)
  
  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
              <Logo />
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        {canCreateFeature.canCreate && hasPermission && (
          <NavDocuments items={data.members} />
        )}
        {/* <NavSecondary items={data.navSecondary} className="mt-auto" /> */}
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  );
}
