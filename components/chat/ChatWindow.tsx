"use client";

import React, { useState, useRef, useEffect } from "react";
import { useChat } from "@/contexts/ChatContext";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Send, User } from "lucide-react";
import { format } from "date-fns";

export default function ChatWindow() {
    const { messages, activeChatId, chatUsers, sendMessage, onlineUsers, markAsRead, typingUsers, setTyping } = useChat();
    const { data: session } = useSession();
    const [input, setInput] = useState("");
    const scrollRef = useRef<HTMLDivElement>(null);
    const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    const activeUser = chatUsers.find((u) => u.id === activeChatId);
    const isOnline = activeUser ? onlineUsers.has(activeUser.keycloakId) : false;
    const isTyping = activeUser ? typingUsers.has(activeUser.keycloakId) : false;

    const scrollToBottom = () => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    };

    useEffect(() => {
        scrollToBottom();
        if (activeChatId) {
            markAsRead(activeChatId);
        }
        const timer = setTimeout(scrollToBottom, 100);
        return () => clearTimeout(timer);
    }, [messages, activeChatId]);

    // Typing Indicator Logic
    useEffect(() => {
        if (!activeUser || !input.trim()) {
            if (activeUser) setTyping(activeUser.keycloakId, false);
            return;
        }

        // Send typing signal
        setTyping(activeUser.keycloakId, true);

        // Clear existing timeout
        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

        // Set stop typing timeout
        typingTimeoutRef.current = setTimeout(() => {
            setTyping(activeUser.keycloakId, false);
        }, 2000);

        return () => {
            if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
        };
    }, [input, activeUser, setTyping]);

    const handleSend = (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || !activeUser) return;

        sendMessage(activeUser.id, activeUser.keycloakId, input);
        setInput("");
        setTyping(activeUser.keycloakId, false);
    };

    const formatDesignation = (roles: string[]) => {
        if (roles.includes("ADMIN")) return "Administrator";
        if (roles.includes("DELIVERY_HEAD")) return "Delivery Head";
        if (roles.includes("ACCOUNT_MANAGER")) return "Account Manager";
        if (roles.includes("POD_LEAD")) return "Pod Lead";
        if (roles.includes("RECRUITER")) return "Recruiter";
        return roles[0] || "User";
    };

    if (!activeChatId || !activeUser) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-neutral-500 gap-4">
                <div className="w-16 h-16 bg-neutral-100 dark:bg-neutral-800 rounded-full flex items-center justify-center">
                    <User size={32} />
                </div>
                <p className="text-sm font-medium">Select a user to start chatting</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full bg-white dark:bg-slate-900 border-s border-neutral-200 dark:border-slate-700">
            {/* Header */}
            <div className="p-4 border-b border-neutral-200 dark:border-slate-700 flex items-center gap-3 bg-neutral-50/50 dark:bg-slate-800/50">
                <div className="relative">
                    <Avatar className="w-10 h-10 border-2 border-primary/10">
                        <AvatarFallback className="bg-primary/5 text-primary text-xs font-bold">
                            {activeUser.fullName.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                    </Avatar>
                    {isOnline && (
                        <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white dark:border-slate-900 rounded-full shadow-sm" />
                    )}
                </div>
                <div className="flex flex-col min-w-0">
                    <h4 className="text-sm font-bold m-0 leading-tight truncate">{activeUser.fullName}</h4>
                    <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[10px] text-primary/80 dark:text-primary/60 font-bold uppercase tracking-tight">
                            {formatDesignation(activeUser.roles)}
                        </span>
                        <span className="w-1 h-1 bg-neutral-300 dark:bg-neutral-600 rounded-full" />
                        <span className={`text-[10px] font-semibold ${isTyping ? "text-primary animate-pulse" : "text-neutral-500"}`}>
                            {isTyping ? "typing..." : (isOnline ? "Online" : "Offline")}
                        </span>
                    </div>
                </div>
            </div>

            {/* Messages */}
            <div
                ref={scrollRef}
                className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin overflow-x-hidden min-h-0"
            >
                {messages.map((msg, i) => {
                    const isMe = msg.senderId === session?.user?.id;
                    return (
                        <div
                            key={msg.id || i}
                            className={`flex ${isMe ? "justify-end" : "justify-start"}`}
                        >
                            <div
                                className={`max-w-[80%] px-4 py-2.5 rounded-2xl text-sm shadow-sm ${isMe
                                    ? "bg-primary text-white rounded-tr-none"
                                    : "bg-neutral-100 dark:bg-slate-800 dark:text-neutral-200 rounded-tl-none border border-neutral-200 dark:border-slate-700"
                                    }`}
                            >
                                <div className="break-words leading-relaxed">{msg.content}</div>
                                <div
                                    className={`text-[10px] mt-1.5 opacity-70 ${isMe ? "text-right" : "text-left"
                                        }`}
                                >
                                    {format(new Date(msg.createdAt || Date.now()), "HH:mm")}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Input */}
            <form onSubmit={handleSend} className="p-4 border-t border-neutral-200 dark:border-slate-700 bg-neutral-50/50 dark:bg-slate-800/50">
                <div className="flex gap-2">
                    <Input
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Type a message..."
                        className="rounded-xl border-neutral-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus-visible:ring-primary h-11"
                    />
                    <Button
                        type="submit"
                        size="icon"
                        className="rounded-xl h-11 w-11 shrink-0 bg-primary hover:bg-primary/90 shadow-md"
                        disabled={!input.trim()}
                    >
                        <Send size={18} />
                    </Button>
                </div>
            </form>
        </div>
    );
}
