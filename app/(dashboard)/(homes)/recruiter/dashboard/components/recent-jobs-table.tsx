"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react";
import Link from "next/link";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";

interface Job {
    id: string;
    jobTitle: string;
    clientName: string;
    status: string;
    createdAt: string;
}

interface RecentJobsTableProps {
    jobs: Job[];
}

const statusMap: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" | "warning" | "info" }> = {
    ACTIVE: { label: "Active", variant: "default" },
    CLOSED: { label: "Closed", variant: "destructive" },
    ON_HOLD: { label: "On Hold", variant: "warning" },
    HOLD_BY_CLIENT: { label: "Hold By Client", variant: "info" },
    FILLED: { label: "Filled", variant: "outline" },
};

const RecentJobsTable = ({ jobs }: RecentJobsTableProps) => {
    const recentJobs = jobs.slice(0, 5);

    return (
        <Card className="shadow-none border border-neutral-200 dark:border-slate-700 overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div>
                    <CardTitle className="text-lg font-semibold">Recently Assigned Jobs</CardTitle>
                    <p className="text-sm text-muted-foreground italic">Your 5 most recently assigned roles.</p>
                </div>
                <Button variant="outline" size="sm" asChild>
                    <Link href="/recruiter/dashboard/jobs">View All Jobs</Link>
                </Button>
            </CardHeader>
            <CardContent className="p-0">
                <Table>
                    <TableHeader className="bg-neutral-50 dark:bg-slate-800/50">
                        <TableRow>
                            <TableHead className="py-3 px-4">Job Title</TableHead>
                            <TableHead className="py-3 px-4">Client</TableHead>
                            <TableHead className="py-3 px-4">Date</TableHead>
                            <TableHead className="py-3 px-4 text-center">Status</TableHead>
                            <TableHead className="py-3 px-4 text-end">Action</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {recentJobs.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="h-24 text-center text-muted-foreground italic">
                                    No recent jobs found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            recentJobs.map((job) => {
                                const status = statusMap[job.status] || { label: job.status, variant: "secondary" };
                                return (
                                    <TableRow key={job.id} className="hover:bg-neutral-50 dark:hover:bg-slate-800/5 transition-colors">
                                        <TableCell className="py-3 px-4 font-medium capitalize">
                                            {job.jobTitle.toLowerCase()}
                                        </TableCell>
                                        <TableCell className="py-3 px-4">{job.clientName}</TableCell>
                                        <TableCell className="py-3 px-4">{new Date(job.createdAt).toLocaleDateString()}</TableCell>
                                        <TableCell className="py-3 px-4 text-center">
                                            <Badge variant={status.variant as any} className="text-[10px] uppercase font-bold">
                                                {status.label}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="py-3 px-4 text-end">
                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-blue-600" asChild>
                                                <Link href={`/recruiter/dashboard/jobs/${job.id}`}>
                                                    <Eye className="h-4 w-4" />
                                                </Link>
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                );
                            })
                        )}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
};

export default RecentJobsTable;
