"use client";

import React, { useState } from "react";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mail, Search, Circle, Clock } from "lucide-react";
import { useChat } from "@/contexts/ChatContext";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import ChatWindow from "./ChatWindow";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";

export default function ChatDrawer() {
    const { chatUsers, onlineUsers, activeChatId, setActiveChatId, typingUsers } = useChat();
    const [search, setSearch] = useState("");

    const filteredUsers = chatUsers.filter((user) =>
        user.fullName.toLowerCase().includes(search.toLowerCase()) ||
        user.email.toLowerCase().includes(search.toLowerCase())
    );

    // Sorting: Online users first
    const sortedUsers = [...filteredUsers].sort((a, b) => {
        const aOnline = onlineUsers.has(a.keycloakId) ? 1 : 0;
        const bOnline = onlineUsers.has(b.keycloakId) ? 1 : 0;
        return bOnline - aOnline;
    });

    const formatDesignation = (roles: string[]) => {
        if (roles.includes("ADMIN")) return "Administrator";
        if (roles.includes("DELIVERY_HEAD")) return "Delivery Head";
        if (roles.includes("ACCOUNT_MANAGER")) return "Account Manager";
        if (roles.includes("POD_LEAD")) return "Pod Lead";
        if (roles.includes("RECRUITER")) return "Recruiter";
        return roles[0] || "User";
    };

    return (
        <Sheet>
            <SheetTrigger asChild>
                <Button
                    size="icon"
                    className={cn(
                        'rounded-[50%] text-neutral-900 sm:w-10 sm:h-10 w-8 h-8 bg-gray-200/75 hover:bg-slate-200 focus-visible:ring-0 dark:bg-slate-700 dark:hover:bg-slate-600 border-0 cursor-pointer data-[state=open]:bg-gray-300 dark:data-[state=open]:bg-slate-600'
                    )}
                >
                    <Mail className="w-5 h-5" />
                </Button>
            </SheetTrigger>
            <SheetContent side="right" className="p-0 sm:max-w-md w-full flex flex-col h-full bg-white dark:bg-slate-900 border-l border-neutral-200 dark:border-slate-800">
                <SheetHeader className="p-6 pb-2">
                    <SheetTitle className="text-xl font-bold flex items-center gap-2">
                        Messages
                    </SheetTitle>
                    <div className="relative mt-4">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                        <Input
                            placeholder="Search people..."
                            className="pl-9 h-10 bg-neutral-100/50 dark:bg-slate-800/50 border-transparent focus-visible:ring-primary rounded-xl"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                </SheetHeader>

                <div className="flex-1 overflow-y-auto mt-4 px-2 space-y-1">
                    {sortedUsers.map((user) => {
                        const isOnline = onlineUsers.has(user.keycloakId);
                        const isActive = activeChatId === user.id;

                        return (
                            <button
                                key={user.id}
                                onClick={() => setActiveChatId(user.id)}
                                className={`w-full flex items-center gap-3 p-3 rounded-2xl transition-all duration-200 group ${isActive
                                    ? "bg-primary/5 border-primary/10 shadow-sm"
                                    : "hover:bg-neutral-50 dark:hover:bg-slate-800/50"
                                    }`}
                            >
                                <div className="relative">
                                    <Avatar className="w-12 h-12 border-2 border-white dark:border-slate-900 shadow-sm">
                                        <AvatarFallback className="bg-neutral-100 dark:bg-slate-800 text-neutral-600 dark:text-neutral-400 font-bold">
                                            {user.fullName.substring(0, 2).toUpperCase()}
                                        </AvatarFallback>
                                    </Avatar>
                                    {isOnline && (
                                        <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 border-2 border-white dark:border-slate-900 rounded-full shadow-sm" />
                                    )}
                                </div>
                                <div className="flex-1 text-left min-w-0">
                                    <div className="flex items-center justify-between">
                                        <h5 className={`text-sm font-bold transition-colors truncate ${isActive ? "text-primary" : "text-neutral-800 dark:text-neutral-200"}`}>
                                            {user.fullName}
                                        </h5>
                                    </div>
                                    <p className="text-[10px] text-neutral-400 truncate mt-0.5">
                                        {user.email}
                                    </p>
                                    <p className={`text-[11px] font-medium mt-0.5 ${typingUsers.has(user.keycloakId) ? "text-primary animate-pulse" : "text-primary/80 dark:text-primary/60"}`}>
                                        {typingUsers.has(user.keycloakId)
                                            ? "typing..."
                                            : !isOnline && user.lastOnline
                                                ? `Last seen ${formatDistanceToNow(new Date(user.lastOnline), { addSuffix: true })}`
                                                : formatDesignation(user.roles)}
                                    </p>
                                </div>
                                {isActive && (
                                    <div className="w-1.5 h-8 bg-primary rounded-full absolute left-0" />
                                )}
                            </button>
                        );
                    })}
                </div>

                {/* Chat Window overlay when a user is selected on small screens or side-by-side on larger */}
                {activeChatId && (
                    <div className="absolute inset-0 z-50 bg-white dark:bg-slate-900 animate-in slide-in-from-right duration-300">
                        <div className="h-full flex flex-col">
                            <div className="p-2 border-b border-neutral-100 dark:border-slate-800">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setActiveChatId(null)}
                                    className="text-xs font-bold text-neutral-500 hover:text-primary"
                                >
                                    ← Back to list
                                </Button>
                            </div>
                            <ChatWindow />
                        </div>
                    </div>
                )}
            </SheetContent>
        </Sheet>
    );
}
