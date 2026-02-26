import {
  Boxes,
  CalendarDays,
  ChartPie,
  Component,
  House,
  Mail,
  MessageCircleMore,
  Server,
  Settings,
  ShieldCheck,
  StickyNote,
  UsersRound,
  BriefcaseBusiness,
  ClipboardList,
} from "lucide-react";

export const getSidebarData = (role: string) => {
  const adminNav = [
    {
      title: "Dashboard",
      url: "#",
      icon: House,
      isActive: true,
      items: [
        {
          title: "Home",
          url: "/dashboard",
          circleColor: "bg-primary",
        },
        {
          title: "Recruiter",
          url: "/admin/dashboard/recruiter",
          circleColor: "bg-cyan-500",
        },
        {
          title: "Pods",
          url: "/admin/dashboard/pods",
          circleColor: "bg-emerald-500",
        },
        {
          title: "Account Manager",
          url: "/admin/dashboard/account-manager",
          circleColor: "bg-yellow-500",
        },

      ],
    },

  ];

  const accountManagerNav = [
    {
      title: "Dashboard",
      url: "#",
      icon: House,
      isActive: true,
      items: [
        {
          title: "Dashboard Overview",
          url: "/account-manager/dashboard",
          circleColor: "bg-primary",
        },
        {
          title: "Post a New Job",
          url: "/account-manager/dashboard/jobs/create",
          circleColor: "bg-primary",
        },
        {
          title: "My Posted Jobs",
          url: "/account-manager/dashboard/jobs",
          circleColor: "bg-cyan-500",
        },
        {
          title: "Submitted Jobs",
          url: "/account-manager/dashboard/jobs-submitted",
          circleColor: "bg-purple-500",
        },
      ],
    },


  ];

  const deliveryHeadNav = [
    {
      title: "Dashboard",
      url: "#",
      icon: House,
      isActive: true,
      items: [
        {
          title: "Home",
          url: "/delivery-head/dashboard",
          circleColor: "bg-primary",
        },
        {
          title: "Jobs",
          url: "/delivery-head/dashboard/jobs",
          circleColor: "bg-primary",
        },
        {
          title: "Recurters",
          url: "/delivery-head/dashboard/recurters",
          circleColor: "bg-primary",
        },
        {
          title: "Pods",
          url: "/delivery-head/dashboard/pods",
          circleColor: "bg-primary",
        },
      ],
    },
    {
      label: "Job Management",
    },
    {
      title: "Jobs",
      url: "#",
      icon: BriefcaseBusiness,
      isActive: true,
      items: [
        {
          title: "All Jobs",
          url: "/delivery-head/dashboard/jobs",
          circleColor: "bg-cyan-500",
        },
        {
          title: "Submitted Jobs",
          url: "/delivery-head/dashboard/jobs-submitted",
          circleColor: "bg-purple-500",
        },
      ],
    },
    {
      label: "Pod Management",
    },
    {
      title: "Pods",
      url: "#",
      icon: UsersRound,
      isActive: true,
      items: [
        {
          title: "All Pods",
          url: "/delivery-head/dashboard/pods",
          circleColor: "bg-purple-500",
        },
        {
          title: "Create Pod",
          url: "/delivery-head/dashboard/pods/create",
          circleColor: "bg-green-500",
        },
      ],
    },
    
  ];

  const recruiterNav = [
    {
      title: "Dashboard",
      url: "#",
      icon: House,
      isActive: true,
      items: [
        {
          title: "Home",
          url: "/recruiter/dashboard",
          circleColor: "bg-primary",
        },
        {
          title: "Assigned Jobs",
          url: "/recruiter/dashboard/jobs-assigned",
          circleColor: "bg-primary",
        },
        {
          title: "Submitted Jobs",
          url: "/recruiter/dashboard/jobs-submitted",
          circleColor: "bg-primary",
        },
        {
          title: "Jobs in my Pods",
          url: "/recruiter/dashboard/jobs",
          circleColor: "bg-primary",
        },

      ],
    },
    // {
    //   label: "Job Management",
    // },
    // {
    //   title: "Jobs",
    //   url: "#",
    //   icon: BriefcaseBusiness,
    //   isActive: true,
    //   items: [
    //     {
    //       title: "Available Jobs",
    //       url: "/recruiter/dashboard/jobs",
    //       circleColor: "bg-cyan-500",
    //     },
    //   ],
    // },

  ];

  // Map roles to their specific navigation
  const roleUpper = role ? role.toUpperCase() : "ADMIN";

  if (roleUpper === "ACCOUNT_MANAGER" || roleUpper === "ACCOUNT-MANAGER") {
    return { navMain: accountManagerNav };
  } else if (roleUpper === "DELIVERY_HEAD" || roleUpper === "DELIVERY-HEAD") {
    return { navMain: deliveryHeadNav };
  } else if (roleUpper === "RECRUITER") {
    return { navMain: recruiterNav };
  }

  // Default to Admin
  return { navMain: adminNav };
};
