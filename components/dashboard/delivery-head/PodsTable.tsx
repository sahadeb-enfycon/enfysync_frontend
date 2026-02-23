"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye, Edit2, Users, Trash2 } from "lucide-react";
import Link from "next/link";

interface PodMember {
    id: string;
    fullName: string | null;
    email: string;
}

interface Pod {
    id: string;
    name: string;
    podHead: PodMember;
    recruiters: PodMember[];
    _count: {
        recruiters: number;
    };
    createdAt: string;
}

interface PodsTableProps {
    pods: Pod[];
}

export default function PodsTable({ pods: initialPods }: PodsTableProps) {
    const [pods, setPods] = useState<Pod[]>(initialPods);
    const [isDeleting, setIsDeleting] = useState<string | null>(null);
    const { data: session } = useSession();
    const router = useRouter();

    const handleDelete = async (id: string, name: string) => {
        if (!window.confirm(`Are you sure you want to delete pod "${name}"? This action cannot be undone.`)) {
            return;
        }

        const token = (session as any)?.user?.accessToken;
        if (!token) {
            toast.error("You must be logged in to delete a pod.");
            return;
        }

        setIsDeleting(id);
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/pods/${id}`, {
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            if (response.ok) {
                toast.success("Pod deleted successfully");
                setPods(pods.filter(p => p.id !== id));
                router.refresh();
            } else {
                const errData = await response.json();
                toast.error(errData.message || "Failed to delete pod");
            }
        } catch (error) {
            console.error("Error deleting pod:", error);
            toast.error("An error occurred while deleting the pod");
        } finally {
            setIsDeleting(null);
        }
    };

    return (
        <div className="rounded-lg border border-neutral-200 dark:border-slate-600 overflow-hidden">
            <Table className="table-auto border-spacing-0 border-separate">
                <TableHeader>
                    <TableRow className="border-0">
                        <TableHead className="bg-neutral-100 dark:bg-slate-700 text-base px-4 h-12 border-b border-neutral-200 dark:border-slate-600 text-start">
                            Pod Name
                        </TableHead>
                        <TableHead className="bg-neutral-100 dark:bg-slate-700 text-base px-4 h-12 border-b border-neutral-200 dark:border-slate-600 text-start">
                            Pod Lead
                        </TableHead>
                        <TableHead className="bg-neutral-100 dark:bg-slate-700 text-base px-4 h-12 border-b border-neutral-200 dark:border-slate-600 text-center">
                            Recruiters
                        </TableHead>
                        <TableHead className="bg-neutral-100 dark:bg-slate-700 text-base px-4 h-12 border-b border-neutral-200 dark:border-slate-600 text-start">
                            Created Date
                        </TableHead>
                        <TableHead className="bg-neutral-100 dark:bg-slate-700 text-base px-4 h-12 border-b border-neutral-200 dark:border-slate-600 text-end">
                            Actions
                        </TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {pods.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={5} className="h-24 text-center text-muted-foreground italic">
                                No pods found.
                            </TableCell>
                        </TableRow>
                    ) : (
                        pods.map((pod) => (
                            <TableRow key={pod.id} className="hover:bg-neutral-50 dark:hover:bg-slate-800/50 transition-colors">
                                <TableCell className="py-3 px-4 border-b border-neutral-200 dark:border-slate-600 text-start font-medium capitalize">
                                    <Link
                                        href={`/delivery-head/dashboard/pods/${pod.id}`}
                                        className="hover:text-primary hover:underline transition-colors"
                                    >
                                        {pod.name.toLowerCase()}
                                    </Link>
                                </TableCell>
                                <TableCell className="py-3 px-4 border-b border-neutral-200 dark:border-slate-600 text-start">
                                    <div className="flex flex-col">
                                        <span className="font-medium text-sm">{pod.podHead?.fullName || "Unassigned"}</span>
                                        <span className="text-xs text-muted-foreground">{pod.podHead?.email}</span>
                                    </div>
                                </TableCell>
                                <TableCell className="py-3 px-4 border-b border-neutral-200 dark:border-slate-600 text-center">
                                    <div className="flex flex-col items-center justify-center gap-1">
                                        <div className="flex items-center gap-1.5 mb-1">
                                            <Users className="h-3.5 w-3.5 text-muted-foreground" />
                                            <span className="font-semibold text-xs uppercase text-muted-foreground tracking-wider">
                                                {pod.recruiters?.length || 0} Recruiters
                                            </span>
                                        </div>
                                        <div className="flex flex-wrap justify-center gap-1 max-w-[200px]">
                                            {pod.recruiters && pod.recruiters.length > 0 ? (
                                                pod.recruiters.map((recruiter) => (
                                                    <Badge
                                                        key={recruiter.id}
                                                        variant="secondary"
                                                        className="text-[10px] px-1.5 py-0 font-normal bg-neutral-100 dark:bg-slate-800 text-neutral-600 dark:text-slate-300 border-none"
                                                    >
                                                        {recruiter.fullName || recruiter.email.split('@')[0]}
                                                    </Badge>
                                                ))
                                            ) : (
                                                <span className="text-[10px] text-muted-foreground italic">No recruiters assigned</span>
                                            )}
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell className="py-3 px-4 border-b border-neutral-200 dark:border-slate-600 text-start">
                                    {new Date(pod.createdAt).toLocaleDateString()}
                                </TableCell>
                                <TableCell className="py-3 px-4 border-b border-neutral-200 dark:border-slate-600 text-end">
                                    <div className="flex justify-end gap-2">
                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20" asChild>
                                            <Link href={`/delivery-head/dashboard/pods/${pod.id}`}>
                                                <Eye className="h-4 w-4" />
                                            </Link>
                                        </Button>
                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-amber-600 hover:text-amber-700 hover:bg-amber-50 dark:hover:bg-amber-900/20" asChild>
                                            <Link href={`/delivery-head/dashboard/pods/${pod.id}/edit`}>
                                                <Edit2 className="h-4 w-4" />
                                            </Link>
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                                            onClick={() => handleDelete(pod.id, pod.name)}
                                            disabled={isDeleting === pod.id}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))
                    )}
                </TableBody>
            </Table>
        </div>
    );
}
