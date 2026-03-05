"use client";

import * as React from "react";
import { usePathname } from "next/navigation";

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
  const pathname = usePathname();
  const rawRoles = ((session?.user as { roles?: string[] } | undefined)?.roles) || [];
  const validRoles = [
    "ADMIN",
    "POD_LEAD", "POD-LEAD",
    "ACCOUNT_MANAGER", "ACCOUNT-MANAGER",
    "RECRUITER",
    "DELIVERY_HEAD", "DELIVERY-HEAD"
  ];
  let urlRole = "";
  if (pathname?.startsWith("/account-manager") || pathname?.startsWith("/account_manager")) {
    urlRole = "ACCOUNT_MANAGER";
  } else if (pathname?.startsWith("/delivery-head") || pathname?.startsWith("/delivery_head")) {
    urlRole = "DELIVERY_HEAD";
  } else if (pathname?.startsWith("/recruiter")) {
    urlRole = "RECRUITER";
  } else if (pathname?.startsWith("/pod-lead") || pathname?.startsWith("/pod_lead")) {
    urlRole = "POD_LEAD";
  } else if (pathname?.startsWith("/admin")) {
    urlRole = "ADMIN";
  }

  const normalizedRawRoles = rawRoles.map((r: string) => r.toUpperCase().replace('-', '_'));

  // Priority order: POD_LEAD must come before RECRUITER because pod leads also have the RECRUITER role.
  // We check the session roles first (source of truth), then fall back to URL-based detection.
  const ROLE_PRIORITY = [
    "DELIVERY_HEAD",
    "ADMIN",
    "ACCOUNT_MANAGER",
    "POD_LEAD",
    "RECRUITER",
  ];

  let primaryRole = ROLE_PRIORITY.find(r => normalizedRawRoles.includes(r)) || "";

  // If URL gives a stronger signal (user navigating to a specific role's area directly), honour it —
  // but only for roles that don't overlap (i.e. skip this override if URL says RECRUITER but user is POD_LEAD).
  if (urlRole && normalizedRawRoles.includes(urlRole)) {
    const urlRolePriority = ROLE_PRIORITY.indexOf(urlRole);
    const sessionRolePriority = ROLE_PRIORITY.indexOf(primaryRole);
    if (urlRolePriority <= sessionRolePriority) {
      primaryRole = urlRole;
    }
  }

  console.log("AppSidebar Role Mapping:", { rawRoles, primaryRole, pathname });

  if (!primaryRole) {
    return null;
  }

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
