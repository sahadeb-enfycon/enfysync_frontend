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
import { Card, CardContent } from "@/components/ui/card";
import { Eye, AlertCircle, Clock } from "lucide-react";
import Link from "next/link";

const UrgentJobsTable = () => {
    const urgentJobs = [
        {
            id: "1",
            title: "Senior React Developer",
            client: "TechCorp Solutions",
            daysOpen: 24,
            submissions: 2,
            priority: "HIGH",
            reason: "Low Pipeline",
            pod: "Alpha Pod"
        },
        {
            id: "2",
            title: "Java Microservices Architect",
            client: "Global Finance",
            daysOpen: 32,
            submissions: 12,
            priority: "CRITICAL",
            reason: "Approaching Deadline",
            pod: "Beta Pod"
        },
        {
            id: "3",
            title: "DevOps Engineer (AWS)",
            client: "SkyNet Systems",
            daysOpen: 12,
            submissions: 0,
            priority: "HIGH",
            reason: "No Submissions (48h)",
            pod: "Gamma Pod"
        },
        {
            id: "4",
            title: "Full Stack Engineer",
            client: "EduTech Inc",
            daysOpen: 18,
            submissions: 5,
            priority: "MEDIUM",
            reason: "Interview Dropout",
            pod: "Delta Pod"
        }
    ];

    const getPriorityBadge = (priority: string) => {
        switch (priority) {
            case "CRITICAL": return <Badge className="bg-red-100 text-red-700 border-none font-semibold px-2">CRITICAL</Badge>;
            case "HIGH": return <Badge className="bg-orange-100 text-orange-700 border-none font-semibold px-2">HIGH</Badge>;
            default: return <Badge className="bg-blue-100 text-blue-700 border-none font-semibold px-2">{priority}</Badge>;
        }
    };

    return (
        <Card className="border border-gray-200 dark:border-neutral-700 bg-white dark:bg-slate-800 rounded-md shadow-none overflow-hidden">
            <CardContent className="p-0">
                <div className="p-6 flex items-center justify-between border-b border-gray-100 dark:border-neutral-700">
                    <div className="flex items-center gap-2">
                        <AlertCircle className="text-red-500" size={20} />
                        <h6 className="font-semibold text-lg text-neutral-900 dark:text-white">Jobs Needing Attention</h6>
                    </div>
                    <Button variant="link" className="text-primary p-0 h-auto font-medium" asChild>
                        <Link href="/delivery-head/dashboard/jobs">View All Jobs</Link>
                    </Button>
                </div>
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-neutral-50 dark:bg-slate-900/50 border-0">
                                <TableHead className="font-semibold px-6 py-4">Job Title & Client</TableHead>
                                <TableHead className="font-semibold px-6 py-4">Status & Priority</TableHead>
                                <TableHead className="font-semibold px-6 py-4">Aging</TableHead>
                                <TableHead className="font-semibold px-6 py-4">Submits</TableHead>
                                <TableHead className="font-semibold px-6 py-4 text-end">Action</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {urgentJobs.map((job) => (
                                <TableRow key={job.id} className="hover:bg-neutral-50 dark:hover:bg-slate-900/30 transition-colors border-b border-gray-100 dark:border-neutral-700">
                                    <TableCell className="px-6 py-4">
                                        <div className="flex flex-col">
                                            <span className="font-medium text-neutral-900 dark:text-white capitalize">{job.title.toLowerCase()}</span>
                                            <span className="text-xs text-neutral-500 dark:text-neutral-400">{job.client} • {job.pod}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="px-6 py-4">
                                        <div className="flex flex-col gap-1">
                                            {getPriorityBadge(job.priority)}
                                            <span className="text-[10px] text-red-500 font-medium">{job.reason}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="px-6 py-4 text-center">
                                        <div className="flex items-center gap-1.5 justify-start text-neutral-600 dark:text-neutral-300">
                                            <Clock size={14} />
                                            <span className="text-sm">{job.daysOpen}d</span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="px-6 py-4 text-center">
                                        <span className={`text-sm font-semibold ${job.submissions < 5 ? 'text-red-500' : 'text-neutral-900 dark:text-white'}`}>
                                            {job.submissions}
                                        </span>
                                    </TableCell>
                                    <TableCell className="px-6 py-4 text-end">
                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-primary hover:bg-primary/10" asChild>
                                            <Link href={`/delivery-head/dashboard/jobs/${job.id}`}>
                                                <Eye size={16} />
                                            </Link>
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
        </Card>
    );
};

export default UrgentJobsTable;
