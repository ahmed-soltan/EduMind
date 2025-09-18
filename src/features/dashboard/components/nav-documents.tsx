"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { type Icon } from "@tabler/icons-react";

import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

export function NavDocuments({
  items,
}: {
  items: {
    title: string;
    url: string;
    icon: Icon;
  }[];
}) {
  const pathname = usePathname();
  const isActive = (url: string) => pathname === url;

  return (
    <SidebarGroup className="group-data-[collapsible=icon]:hidden">
      <SidebarGroupLabel>Members</SidebarGroupLabel>
      <SidebarMenu>
        {items.map((item) => (
          <Link
            key={item.url}
            href={`/dashboard/${item.url}`}
            className={isActive(`/dashboard/${item.url}`) ? "bg-muted" : ""}
          >
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton tooltip={item.title}>
                {item.icon && <item.icon />}
                <span>{item.title}</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </Link>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  );
}
