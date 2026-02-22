"use client";

import * as React from "react";

import { NavMain } from "@/components/nav-main";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";
import LogoSidebar from "./shared/logo-sidebar";
import { getSidebarData } from "./sidebar-data";
import { useSession } from "next-auth/react";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { data: session } = useSession();
  const rawRoles = (session?.user as any)?.roles || [];
  const validRoles = ["ADMIN", "POD_LEAD", "ACCOUNT_MANAGER", "RECRUITER", "DELIVERY_HEAD"];
  const primaryRole = rawRoles.find((role: string) => validRoles.includes(role.toUpperCase())) || "ADMIN";

  const data = getSidebarData(primaryRole);
  return (
    <Sidebar collapsible="icon" {...props} className="hidden xl:block">
      <SidebarHeader>
        <LogoSidebar />
      </SidebarHeader>

      <SidebarContent className="scrollbar-thin scrollbar-invisible hover:scrollbar-visible">
        <NavMain items={data.navMain} />
      </SidebarContent>

      <SidebarRail />
    </Sidebar>
  );
}
