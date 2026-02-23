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
          url: "/recruiter",
          circleColor: "bg-cyan-500",
        },
        {
          title: "Account Manager",
          url: "/am",
          circleColor: "bg-yellow-500",
        },
        
      ],
    },
    {
      label: "Application",
    },
    {
      title: "Email",
      url: "/email",
      icon: Mail,
    },
    {
      title: "Chat",
      url: "/chat",
      icon: MessageCircleMore,
    },
    {
      title: "Calendar",
      url: "/calendar",
      icon: CalendarDays,
    },
    {
      label: "UI Elements",
    },
    {
      title: "Components",
      url: "#",
      icon: Component,
      isActive: true,
      items: [
        {
          title: "Typography",
          url: "/typography",
          circleColor: "bg-primary",
        },
        {
          title: "Colors",
          url: "/colors",
          circleColor: "bg-yellow-500",
        },
        {
          title: "Buttons",
          url: "/buttons",
          circleColor: "bg-green-600",
        },
        {
          title: "Dropdown",
          url: "/dropdown",
          circleColor: "bg-purple-600",
        },
        {
          title: "Alert",
          url: "/alert",
          circleColor: "bg-yellow-500",
        },
        {
          title: "Card",
          url: "/card",
          circleColor: "bg-red-600",
        },
        {
          title: "Avatar",
          url: "/avatar",
          circleColor: "bg-green-600",
        },
        {
          title: "Progress Bar",
          url: "/progress-bar",
          circleColor: "bg-primary",
        },
        {
          title: "Tab & Accordion",
          url: "/tab-accordion",
          circleColor: "bg-yellow-500",
        },
        {
          title: "Pagination",
          url: "/pagination",
          circleColor: "bg-red-600",
        },
        {
          title: "Badges",
          url: "/badge",
          circleColor: "bg-primary",
        },
        {
          title: "Tooltip & Popover",
          url: "/tooltip",
          circleColor: "bg-slate-900",
        },
        {
          title: "Star Ratings",
          url: "/star-rating",
          circleColor: "bg-purple-600",
        },
        {
          title: "Tags",
          url: "/tags",
          circleColor: "bg-primary",
        },
        {
          title: "List",
          url: "/list",
          circleColor: "bg-red-600",
        },
        {
          title: "Radio",
          url: "/radio",
          circleColor: "bg-orange-600",
        },
        {
          title: "Switch",
          url: "/switch",
          circleColor: "bg-green-600",
        },
      ],
    },
    {
      title: "Forms",
      url: "#",
      icon: StickyNote,
      isActive: true,
      items: [
        {
          title: "Input Forms",
          url: "/input-forms",
          circleColor: "bg-primary",
        },
        {
          title: "Input Layout",
          url: "/input-layout",
          circleColor: "bg-yellow-500",
        },
        {
          title: "Form Validation",
          url: "/form-validation",
          circleColor: "bg-green-600",
        },
      ],
    },
    {
      title: "Chart",
      url: "#",
      icon: ChartPie,
      isActive: true,
      items: [
        {
          title: "Line Chart",
          url: "/line-chart",
          circleColor: "bg-orange-600",
        },
        {
          title: "Column Chart",
          url: "/column-chart",
          circleColor: "bg-yellow-500",
        },
        {
          title: "Pie Chart",
          url: "/pie-chart",
          circleColor: "bg-green-600",
        },
      ],
    },
    {
      title: "Widgets",
      url: "/widgets",
      icon: Boxes,
    },
    {
      title: "Table",
      url: "#",
      icon: Server,
      isActive: true,
      items: [
        {
          title: "Basic Table",
          url: "/basic-table",
          circleColor: "bg-orange-600",
        },
      ],
    },
    {
      title: "Users",
      url: "#",
      icon: UsersRound,
      isActive: true,
      items: [
        {
          title: "Users List",
          url: "/users-list",
          circleColor: "bg-primary",
        },
        {
          title: "Users Grid",
          url: "/users-grid",
          circleColor: "bg-yellow-500",
        },
        {
          title: "View Profile",
          url: "/view-profile",
          circleColor: "bg-red-600",
        },
      ],
    },
    {
      label: "Pages",
    },
    {
      title: "Authentication",
      url: "#",
      icon: ShieldCheck,
      isActive: true,
      items: [
        {
          title: "Sign In",
          url: "/auth/login",
          circleColor: "bg-primary",
        },
        {
          title: "Sign Up",
          url: "/auth/register",
          circleColor: "bg-yellow-500",
        },
        {
          title: "Forgot Password",
          url: "/auth/forgot-password",
          circleColor: "bg-cyan-500",
        },
      ],
    },
    {
      title: "Setting",
      url: "#",
      icon: Settings,
      isActive: true,
      items: [
        {
          title: "Company",
          url: "/company",
          circleColor: "bg-primary",
        },
        {
          title: "Notification",
          url: "/settings-notification",
          circleColor: "bg-yellow-500",
        },
        {
          title: "Notification Alert",
          url: "/notification-alert",
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
          title: "Post a New Job",
          url: "/account-manager/dashboard/jobs/create",
          circleColor: "bg-yellow-500",
        },
        {
          title: "My Posted Jobs",
          url: "/account-manager/dashboard/jobs",
          circleColor: "bg-cyan-500",
        },
      ],
    },
    {
      label: "System",
    },
    {
      title: "Administration",
      url: "#",
      icon: Settings,
      isActive: true,
      items: [
        {
          title: "Settings",
          url: "/settings-notification",
          circleColor: "bg-primary",
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
          url: "/delivery-head/dashboard/home",
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
    {
      label: "System",
    },
    {
      title: "Administration",
      url: "#",
      icon: Settings,
      isActive: true,
      items: [
        {
          title: "Settings",
          url: "/settings-notification",
          circleColor: "bg-primary",
        },
      ],
    },
  ];

  // Map roles to their specific navigation
  const roleUpper = role ? role.toUpperCase() : "ADMIN";

  if (roleUpper === "ACCOUNT_MANAGER" || roleUpper === "ACCOUNT-MANAGER") {
    return { navMain: accountManagerNav };
  } else if (roleUpper === "DELIVERY_HEAD" || roleUpper === "DELIVERY-HEAD") {
    return { navMain: deliveryHeadNav };
  }

  // Default to Admin
  return { navMain: adminNav };
};
