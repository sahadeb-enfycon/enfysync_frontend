"use client";

import { useState, useEffect } from "react";
import {
    HoverCard,
    HoverCardContent,
    HoverCardTrigger,
} from "@/components/ui/hover-card";
import { apiClient } from "@/lib/apiClient";
import { Loader2, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface PodHoverCardProps {
    podId: string;
    podName: string;
    initialMembers?: any[];
    children: React.ReactNode;
}

export function PodHoverCard({ podId, podName, initialMembers, children }: PodHoverCardProps) {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [podDetails, setPodDetails] = useState<any>(
        initialMembers !== undefined ? { name: podName, members: initialMembers } : null
    );
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        // Only fetch if initialMembers was NOT provided.
        // If it was provided as [], it means we already know there are no members.
        if (open && initialMembers === undefined && !podDetails && !loading && !error) {
            setLoading(true);
            apiClient(`/pods/${podId}`)
                .then(async (res) => {
                    if (!res.ok) throw new Error("Failed to load pod details");
                    return res.json();
                })
                .then(setPodDetails)
                .catch((err) => {
                    setError(err.message || "Failed to load pod details");
                })
                .finally(() => setLoading(false));
        }
    }, [open, podId, podDetails, loading, error, initialMembers]);

    return (
        <HoverCard open={open} onOpenChange={setOpen} openDelay={200} closeDelay={200}>
            <HoverCardTrigger asChild>
                {children}
            </HoverCardTrigger>
            <HoverCardContent className="w-auto p-3" side="top" align="start">
                <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-purple-600" />
                    <h4 className="text-sm font-semibold">{podName}</h4>
                </div>
            </HoverCardContent>
        </HoverCard>
    );
}
