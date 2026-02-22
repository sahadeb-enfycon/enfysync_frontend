"use client";

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
import { Eye, Edit2 } from "lucide-react";
import Link from "next/link";

interface Job {
    id: string;
    jobTitle: string;
    clientName: string;
    jobCode: string;
    status: string;
    createdAt: string;
}

interface JobsTableProps {
    jobs: Job[];
}

const statusMap: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" | "warning" | "info" }> = {
    ACTIVE: { label: "Active", variant: "default" },
    CLOSED: { label: "Closed", variant: "destructive" },
    ON_HOLD: { label: "On Hold", variant: "warning" },
    HOLD_BY_CLIENT: { label: "Hold By Client", variant: "info" },
    FILLED: { label: "Filled", variant: "outline" },
};

export default function JobsTable({ jobs }: JobsTableProps) {
    return (
        <div className="rounded-lg border border-neutral-200 dark:border-slate-600 overflow-hidden">
            <Table className="table-auto border-spacing-0 border-separate">
                <TableHeader>
                    <TableRow className="border-0">
                        <TableHead className="bg-neutral-100 dark:bg-slate-700 text-base px-4 h-12 border-b border-neutral-200 dark:border-slate-600 text-start">
                            Job Title
                        </TableHead>
                        <TableHead className="bg-neutral-100 dark:bg-slate-700 text-base px-4 h-12 border-b border-neutral-200 dark:border-slate-600 text-start">
                            Job Code
                        </TableHead>
                        <TableHead className="bg-neutral-100 dark:bg-slate-700 text-base px-4 h-12 border-b border-neutral-200 dark:border-slate-600 text-start">
                            Client
                        </TableHead>
                        <TableHead className="bg-neutral-100 dark:bg-slate-700 text-base px-4 h-12 border-b border-neutral-200 dark:border-slate-600 text-start">
                            Created Date
                        </TableHead>
                        <TableHead className="bg-neutral-100 dark:bg-slate-700 text-base px-4 h-12 border-b border-neutral-200 dark:border-slate-600 text-center">
                            Status
                        </TableHead>
                        <TableHead className="bg-neutral-100 dark:bg-slate-700 text-base px-4 h-12 border-b border-neutral-200 dark:border-slate-600 text-end">
                            Actions
                        </TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {jobs.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={6} className="h-24 text-center text-muted-foreground italic">
                                No jobs found.
                            </TableCell>
                        </TableRow>
                    ) : (
                        jobs.map((job) => {
                            const status = statusMap[job.status] || { label: job.status, variant: "secondary" };
                            return (
                                <TableRow key={job.id} className="hover:bg-neutral-50 dark:hover:bg-slate-800/50 transition-colors">
                                    <TableCell className="py-3 px-4 border-b border-neutral-200 dark:border-slate-600 text-start font-medium capitalize">
                                        {job.jobTitle.toLowerCase()}
                                    </TableCell>
                                    <TableCell className="py-3 px-4 border-b border-neutral-200 dark:border-slate-600 text-start">
                                        <code className="bg-neutral-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-xs font-mono">
                                            {job.jobCode}
                                        </code>
                                    </TableCell>
                                    <TableCell className="py-3 px-4 border-b border-neutral-200 dark:border-slate-600 text-start">
                                        {job.clientName}
                                    </TableCell>
                                    <TableCell className="py-3 px-4 border-b border-neutral-200 dark:border-slate-600 text-start">
                                        {new Date(job.createdAt).toLocaleDateString()}
                                    </TableCell>
                                    <TableCell className="py-3 px-4 border-b border-neutral-200 dark:border-slate-600 text-center">
                                        <Badge variant={status.variant as any} className="font-semibold px-2 py-0.5 rounded-full text-[10px] uppercase tracking-wider">
                                            {status.label}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="py-3 px-4 border-b border-neutral-200 dark:border-slate-600 text-end">
                                        <div className="flex justify-end gap-2">
                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20" asChild>
                                                <Link href={`/dashboard/account-manager/jobs/${job.id}`}>
                                                    <Eye className="h-4 w-4" />
                                                </Link>
                                            </Button>
                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-amber-600 hover:text-amber-700 hover:bg-amber-50 dark:hover:bg-amber-900/20" asChild>
                                                <Link href={`/dashboard/account-manager/jobs/${job.id}/edit`}>
                                                    <Edit2 className="h-4 w-4" />
                                                </Link>
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            );
                        })
                    )}
                </TableBody>
            </Table>
        </div>
    );
}
