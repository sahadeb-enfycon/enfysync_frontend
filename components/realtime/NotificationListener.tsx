"use client";

import { useEffect } from "react";
import { useSocket } from "@/contexts/SocketContext";
import { useNotifications } from "@/contexts/NotificationContext";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

const NotificationListener = () => {
    const { socket } = useSocket();
    const { addNotification } = useNotifications();
    const router = useRouter();

    const playNotificationSound = async () => {
        try {
            const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
            if (audioContext.state === 'suspended') {
                await audioContext.resume();
            }
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);

            oscillator.type = "sine";
            oscillator.frequency.setValueAtTime(880, audioContext.currentTime); // High A
            oscillator.frequency.exponentialRampToValueAtTime(440, audioContext.currentTime + 0.5); // Slide down to A4

            gainNode.gain.setValueAtTime(0, audioContext.currentTime);
            gainNode.gain.linearRampToValueAtTime(0.2, audioContext.currentTime + 0.05);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);

            oscillator.start();
            oscillator.stop(audioContext.currentTime + 0.5);
        } catch (error) {
            console.error("Failed to play notification sound:", error);
        }
    };

    useEffect(() => {
        if (!socket) return;

        socket.on("notification", (payload: any) => {
            console.log("[Notification Listener] Received:", payload);

            // 1. Add to history
            addNotification({
                type: payload.type,
                title: payload.title,
                message: payload.message,
                data: payload.data,
                timestamp: payload.timestamp || new Date().toISOString(),
            });

            // 2. Play sound
            playNotificationSound();

            // 3. Trigger refresh for new jobs
            if (payload.type === "NEW_JOB") {
                console.log("[Notification Listener] NEW_JOB received, triggering router.refresh()");
                try {
                    router.refresh();
                    console.log("[Notification Listener] router.refresh() called successfully");
                } catch (err) {
                    console.error("[Notification Listener] router.refresh() failed:", err);
                }

                toast.success(
                    (t) => (
                        <div className="flex flex-col gap-1">
                            <span className="font-bold text-sm">{payload.title}</span>
                            <span className="text-xs">{payload.message}</span>
                            <button
                                onClick={() => {
                                    toast.dismiss(t.id);
                                }}
                                className="text-xs text-primary font-semibold text-left underline mt-1"
                            >
                                View Details
                            </button>
                        </div>
                    ),
                    {
                        duration: 6000,
                        position: "top-right",
                    }
                );
            } else {
                // Generic toast for other types
                toast(payload.message || "New notification received", {
                    icon: "🔔",
                    duration: 4000,
                    position: "top-right",
                });
            }
        });

        return () => {
            socket.off("notification");
        };
    }, [socket]);

    return null;
};

export default NotificationListener;
