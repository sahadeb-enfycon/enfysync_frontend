"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { Bell, Briefcase, Trash2 } from "lucide-react";
import { useNotifications } from "@/contexts/NotificationContext";
import { formatDistanceToNow } from "date-fns";

const NotificationDropdown = () => {
  const { notifications, unreadCount, markAllRead } = useNotifications();

  return (
    <DropdownMenu onOpenChange={(open) => { if (open) markAllRead(); }}>
      <DropdownMenuTrigger asChild>
        <Button
          size="icon"
          className={cn(
            "rounded-[50%] text-neutral-900 sm:w-10 sm:h-10 w-8 h-8 bg-gray-200/75 hover:bg-slate-200 focus-visible:ring-0 dark:bg-slate-700 dark:hover:bg-slate-600 border-0 cursor-pointer data-[state=open]:bg-gray-300 dark:data-[state=open]:bg-slate-600 relative"
          )}
        >
          <Bell className="h-[5.2rem] w-[5.2rem]" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center leading-none animate-pulse">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="sm:w-[400px] max-h-[unset] me-6 p-0 rounded-2xl overflow-hidden shadow-lg block">
        <div>
          <div className="py-3 px-4 rounded-lg bg-primary/10 dark:bg-primary/25 m-4 flex items-center justify-between gap-2">
            <h6 className="text-lg text-neutral-900 dark:text-white font-semibold mb-0">
              Notifications
            </h6>
            <span className="sm:w-10 sm:h-10 w-8 h-8 bg-white dark:bg-slate-800 text-primary dark:text-primary font-bold flex justify-center items-center rounded-full text-sm">
              {notifications.length > 99 ? "99+" : notifications.length}
            </span>
          </div>

          <div className="max-h-[420px] overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                <Bell className="h-10 w-10 mb-3 opacity-30" />
                <p className="text-sm">No notifications yet</p>
                <p className="text-xs mt-1 opacity-70">New job postings will appear here</p>
              </div>
            ) : (
              notifications.map((notif) => (
                <div
                  key={notif.id}
                  className={cn(
                    "flex px-4 py-3 border-b border-neutral-100 dark:border-slate-700 last:border-0 gap-3 transition-colors",
                    !notif.read ? "bg-primary/5 dark:bg-primary/10" : "hover:bg-gray-50 dark:hover:bg-gray-700/40"
                  )}
                >
                  {/* Icon */}
                  <div className={cn(
                    "flex-shrink-0 w-11 h-11 rounded-full flex items-center justify-center",
                    notif.type === "job_created"
                      ? "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400"
                      : "bg-red-100 dark:bg-red-900/30 text-red-500 dark:text-red-400"
                  )}>
                    {notif.type === "job_created"
                      ? <Briefcase className="h-5 w-5" />
                      : <Trash2 className="h-5 w-5" />
                    }
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-neutral-900 dark:text-white mb-0.5 truncate">
                      {notif.type === "job_created" ? "New Job Posted" : "Job Removed"}
                    </p>
                    <p className="text-sm text-neutral-600 dark:text-neutral-300 line-clamp-1">
                      <span className="font-medium capitalize">{notif.jobTitle.toLowerCase()}</span>
                      {notif.clientName ? ` · ${notif.clientName}` : ""}
                    </p>
                    {notif.postedBy && (
                      <p className="text-xs text-muted-foreground mt-0.5">by {notif.postedBy}</p>
                    )}
                    <p className="text-xs text-muted-foreground mt-1">
                      {formatDistanceToNow(notif.timestamp, { addSuffix: true })}
                    </p>
                  </div>

                  {/* Unread dot */}
                  {!notif.read && (
                    <div className="flex-shrink-0 mt-2">
                      <div className="w-2 h-2 bg-primary rounded-full" />
                    </div>
                  )}
                </div>
              ))
            )}
          </div>

          {notifications.length > 0 && (
            <div className="text-center py-3 px-4 border-t border-neutral-100 dark:border-slate-700">
              <button
                onClick={markAllRead}
                className="text-primary dark:text-primary font-semibold hover:underline text-sm"
              >
                Mark all as read
              </button>
            </div>
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default NotificationDropdown;
