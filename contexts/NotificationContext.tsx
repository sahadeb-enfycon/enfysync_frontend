"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useSession } from "next-auth/react";

export interface Notification {
    id: string;
    type: string;
    title: string;
    message: string;
    data?: any;
    timestamp: string;
    isRead: boolean; // Changed from 'read' to 'isRead' to match backend
}

interface NotificationContextType {
    notifications: Notification[];
    setNotifications: React.Dispatch<React.SetStateAction<Notification[]>>;
    addNotification: (notification: Notification) => void;
    markAsRead: (id: string) => Promise<void>;
    markAllAsRead: () => Promise<void>;
    unreadCount: number;
    getJobPath: (jobId: string) => string;
}

/**
 * Resolves the correct dashboard path for a job based on user role.
 */
export const resolveJobPath = (roles: string[], jobId: string): string => {
    const r = roles.map(x => x.toUpperCase());
    if (r.includes("ACCOUNT_MANAGER")) return `/account-manager/dashboard/jobs/${jobId}`;
    if (r.includes("DELIVERY_HEAD")) return `/delivery-head/dashboard/jobs/${jobId}`;
    if (r.includes("RECRUITER")) return `/recruiter/dashboard/jobs/${jobId}`;
    if (r.includes("ADMIN")) return `/admin/dashboard/jobs/${jobId}`;
    return `/account-manager/dashboard/jobs/${jobId}`; // Default requested by user
};

const NotificationContext = createContext<NotificationContextType>({
    notifications: [],
    setNotifications: () => { },
    addNotification: () => { },
    markAsRead: async () => { },
    markAllAsRead: async () => { },
    unreadCount: 0,
    getJobPath: () => "#",
});

export const useNotifications = () => useContext(NotificationContext);

const API_URL = (process.env.NEXT_PUBLIC_API_URL || "https://backend.enfycon.com").replace(/\/+$/, "");

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { data: session } = useSession();
    const [notifications, setNotifications] = useState<Notification[]>([]);

    useEffect(() => {
        if (!session?.user?.accessToken) return;

        const fetchNotifications = async () => {
            try {
                const res = await fetch(`${API_URL}/notifications`, {
                    headers: {
                        Authorization: `Bearer ${session.user.accessToken}`,
                    },
                });
                if (res.ok) {
                    const result = await res.json();
                    setNotifications(result.data || []);
                }
            } catch (error) {
                console.error("Failed to fetch notifications:", error);
            }
        };

        fetchNotifications();
    }, [session?.user?.accessToken]);

    const addNotification = (notification: Notification) => {
        setNotifications((prev) => {
            // Check if notification already exists to avoid duplicates (e.g. from history + real-time)
            if (prev.some(n => n.id === notification.id)) return prev;
            return [notification, ...prev];
        });
    };

    const markAsRead = async (id: string) => {
        if (!session?.user?.accessToken) return;

        // Optimistic update
        setNotifications((prev) =>
            prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
        );

        try {
            await fetch(`${API_URL}/notifications/${id}/read`, {
                method: "PATCH",
                headers: {
                    Authorization: `Bearer ${session.user.accessToken}`,
                },
            });
        } catch (error) {
            console.error("Failed to mark notification as read:", error);
        }
    };

    const markAllAsRead = async () => {
        if (!session?.user?.accessToken) return;

        setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));

        try {
            await fetch(`${API_URL}/notifications/read-all`, {
                method: "PATCH",
                headers: {
                    Authorization: `Bearer ${session.user.accessToken}`,
                },
            });
        } catch (error) {
            console.error("Failed to mark all as read:", error);
        }
    };

    const unreadCount = notifications.filter((n) => !n.isRead).length;

    const getJobPath = (jobId: string) => {
        return resolveJobPath(session?.user?.roles || [], jobId);
    };

    return (
        <NotificationContext.Provider
            value={{ notifications, setNotifications, addNotification, markAsRead, markAllAsRead, unreadCount, getJobPath }}
        >
            {children}
        </NotificationContext.Provider>
    );
};
