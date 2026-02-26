import Logout from "@/components/auth/logout";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import userImg from "@/public/assets/images/user.png";
import { ChevronDown, Mail, Settings, Sparkles, User } from "lucide-react";
import { useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";

const ProfileDropdown = () => {
  const { data: session } = useSession();

  const rawRoles = ((session?.user as { roles?: string[] } | undefined)?.roles) || [];
  const validRoles = [
    "ADMIN",
    "POD_LEAD", "POD-LEAD",
    "ACCOUNT_MANAGER", "ACCOUNT-MANAGER",
    "RECRUITER",
    "DELIVERY_HEAD", "DELIVERY-HEAD"
  ];

  const displayRolesRaw = rawRoles
    .map((role) => role.toUpperCase())
    .filter((role) => validRoles.includes(role))
    .map((role) => role.replace(/-/g, "_"));
  const uniqueDisplayRoles = Array.from(new Set(displayRolesRaw));
  const selectedRolesBase = uniqueDisplayRoles.length > 0 ? uniqueDisplayRoles : ["ADMIN"];
  const hasPodLead = selectedRolesBase.includes("POD_LEAD");
  const hasRecruiter = selectedRolesBase.includes("RECRUITER");
  const selectedRoles =
    hasPodLead && hasRecruiter
      ? selectedRolesBase.filter((role) => role !== "RECRUITER")
      : selectedRolesBase;

  const formattedRoles = selectedRoles.map((role) =>
    role
      .replace(/[_:-]/g, " ")
      .toLowerCase()
      .replace(/\b\w/g, (char: string) => char.toUpperCase())
  );

  const roleColorMap: Record<string, { chip: string; banner: string }> = {
    ADMIN: {
      chip: "text-fuchsia-700 dark:text-fuchsia-200 bg-fuchsia-50/80 dark:bg-fuchsia-950/30 border-fuchsia-100/60 dark:border-fuchsia-900/35",
      banner: "bg-fuchsia-50/90 dark:bg-fuchsia-950/35",
    },
    POD_LEAD: {
      chip: "text-indigo-700 dark:text-indigo-200 bg-indigo-50/80 dark:bg-indigo-950/30 border-indigo-100/60 dark:border-indigo-900/35",
      banner: "bg-indigo-50/90 dark:bg-indigo-950/35",
    },
    ACCOUNT_MANAGER: {
      chip: "text-cyan-700 dark:text-cyan-200 bg-cyan-50/80 dark:bg-cyan-950/30 border-cyan-100/60 dark:border-cyan-900/35",
      banner: "bg-cyan-50/90 dark:bg-cyan-950/35",
    },
    RECRUITER: {
      chip: "text-emerald-700 dark:text-emerald-200 bg-emerald-50/80 dark:bg-emerald-950/30 border-emerald-100/60 dark:border-emerald-900/35",
      banner: "bg-emerald-50/90 dark:bg-emerald-950/35",
    },
    DELIVERY_HEAD: {
      chip: "text-amber-700 dark:text-amber-200 bg-amber-50/80 dark:bg-amber-950/30 border-amber-100/60 dark:border-amber-900/35",
      banner: "bg-amber-50/90 dark:bg-amber-950/35",
    },
  };
  const getRoleColors = (role: string) => roleColorMap[role] || roleColorMap.ADMIN;

  const displayName = session?.user?.name?.trim() || "Admin User";
  const rolePrefix = selectedRoles[0].replace(/[_]/g, "-").toLowerCase();
  const profileUrl = `/${rolePrefix}/view-profile`;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className={cn(
            "h-10 sm:h-11 rounded-full border border-slate-200/55 dark:border-slate-600/45 bg-white/90 dark:bg-slate-800/90 hover:bg-slate-50 dark:hover:bg-slate-700/90 px-1.5 sm:pr-3 gap-2 focus-visible:ring-0 cursor-pointer data-[state=open]:bg-slate-100 dark:data-[state=open]:bg-slate-700/90"
          )}
        >
          <div className="relative">
            {session?.user?.image ? (
              <Image
                src={session?.user?.image}
                className="rounded-full size-7 sm:size-8 object-cover"
                width={40}
                height={40}
                alt={session?.user?.name ?? "User profile"}
              />
            ) : (
              <Image
                src={userImg}
                className="rounded-full size-7 sm:size-8 object-cover"
                width={40}
                height={40}
                alt={"User profile"}
              />
            )}
            <span className="absolute -bottom-0.5 -end-0.5 size-2.5 rounded-full bg-emerald-500 border border-white dark:border-slate-800" />
          </div>

          <div className="hidden md:flex flex-col items-start leading-tight max-w-[180px]">
            <span className="text-sm font-semibold text-slate-800 dark:text-slate-100 truncate w-full">
              {displayName}
            </span>
            <span className="flex flex-wrap items-center gap-1 max-w-full">
              {formattedRoles.slice(0, 2).map((roleLabel, index) => (
                <span
                  key={roleLabel}
                  className={cn(
                    "inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full border max-w-full",
                    getRoleColors(selectedRoles[index]).chip
                  )}
                >
                  <Sparkles className="size-3 shrink-0" />
                  <span className="truncate">{roleLabel}</span>
                </span>
              ))}
            </span>
          </div>

          <ChevronDown className="hidden md:block size-4 text-slate-500 dark:text-slate-300" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        className="sm:w-[300px] min-w-[250px] right-[40px] absolute p-4 rounded-2xl overflow-hidden shadow-lg"
        side="bottom"
        align="end"
      >
        <div className={cn("py-3 px-4 rounded-lg flex items-center justify-between", getRoleColors(selectedRoles[0]).banner)}>
          <div>
            <h6 className="text-lg text-neutral-900 dark:text-white font-semibold mb-0">
              {displayName}
            </h6>
            <span className="text-sm text-neutral-500 dark:text-neutral-300 capitalize">
              {formattedRoles.join(" + ")}
            </span>
          </div>
        </div>

        <div className="max-h-[400px] overflow-y-auto scroll-sm pt-4">
          <ul className="flex flex-col gap-3">
            <li>
              <Link
                href={profileUrl}
                className="text-black dark:text-white hover:text-primary dark:hover:text-primary flex items-center gap-3"
              >
                <User className="w-5 h-5" /> My Profile
              </Link>
            </li>
            <li>
              <Link
                href="/email"
                className="text-black dark:text-white hover:text-primary dark:hover:text-primary flex items-center gap-3"
              >
                <Mail className="w-5 h-5" /> Inbox
              </Link>
            </li>
            <li>
              <Link
                href="/company"
                className="text-black dark:text-white hover:text-primary dark:hover:text-primary flex items-center gap-3"
              >
                <Settings className="w-5 h-5" /> Settings
              </Link>
            </li>
            <li>
              <Logout />
            </li>
          </ul>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ProfileDropdown;
