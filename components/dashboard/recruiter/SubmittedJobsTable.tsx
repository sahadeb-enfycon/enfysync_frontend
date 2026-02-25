"use client";

import { useState, useMemo } from "react";
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
import {
    ChevronLeft,
    ChevronRight,
    ChevronsLeft,
    ChevronsRight,
    Search,
    X,
} from "lucide-react";
import { Input } from "@/components/ui/input";

export interface CandidateSubmission {
    id: string;
    jobId: string;
    job?: {
        jobCode: string;
        jobTitle: string;
        submissionRequired?: number;
        submissionDone?: number;
    };
    recruiterId: string;
    candidateName: string;
    candidateEmail: string;
    candidatePhone: string;
    candidateCurrentLocation: string;
    submissionDate: string;
    l1Status: string;
    l1Date: string;
    l2Status: string;
    l2Date: string;
    l3Status: string;
    l3Date: string;
    finalStatus: string;
    remarks: string;
    recruiterComment: string;
}

interface SubmittedJobsTableProps {
    submissions: CandidateSubmission[];
}

const statusMap: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" | "warning" | "info" }> = {
    PENDING: { label: "Pending", variant: "warning" },
    SUBMITTED: { label: "Submitted", variant: "info" },
    REJECTED: { label: "Rejected", variant: "destructive" },
    SELECTED: { label: "Selected", variant: "default" },
};

export default function SubmittedJobsTable({
    submissions,
}: SubmittedJobsTableProps) {
    const [currentPage, setCurrentPage] = useState(1);
    const [searchQuery, setSearchQuery] = useState("");
    const itemsPerPage = 10;

    // Calculate submission counts per job
    const submissionCountsByJob = useMemo(() => {
        const counts: Record<string, number> = {};
        submissions.forEach(sub => {
            if (sub.jobId) {
                counts[sub.jobId] = (counts[sub.jobId] || 0) + 1;
            }
        });
        return counts;
    }, [submissions]);

    // Apply filtering
    const filteredSubmissions = useMemo(() => {
        return submissions.filter(sub => {
            const matchesSearch = !searchQuery ||
                sub.candidateName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                (sub.job?.jobCode && sub.job.jobCode.toLowerCase().includes(searchQuery.toLowerCase())) ||
                (sub.job?.jobTitle && sub.job.jobTitle.toLowerCase().includes(searchQuery.toLowerCase())) ||
                sub.candidateEmail.toLowerCase().includes(searchQuery.toLowerCase());

            return matchesSearch;
        });
    }, [submissions, searchQuery]);

    // Apply sorting (by newest submission date)
    const sortedSubmissions = useMemo(() => {
        return [...filteredSubmissions].sort((a, b) => {
            return new Date(b.submissionDate).getTime() - new Date(a.submissionDate).getTime();
        });
    }, [filteredSubmissions]);

    const totalPages = Math.ceil(sortedSubmissions.length / itemsPerPage);

    const currentSubmissions = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        return sortedSubmissions.slice(startIndex, startIndex + itemsPerPage);
    }, [sortedSubmissions, currentPage]);

    const handlePageChange = (page: number) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
        }
    };

    const clearFilters = () => {
        setSearchQuery("");
        setCurrentPage(1);
    };

    return (
        <div className="space-y-4">
            <div className="bg-neutral-50 dark:bg-slate-800/40 p-4 rounded-xl border border-neutral-200 dark:border-slate-700 flex flex-wrap gap-4 items-end">
                <div className="flex-1 min-w-[200px] flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-neutral-500 uppercase tracking-wider ml-1">Search</label>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                        <Input
                            placeholder="Candidate name, email or job code..."
                            className="pl-9 h-10 bg-white dark:bg-slate-900 border-neutral-200 dark:border-slate-600 rounded-lg"
                            value={searchQuery}
                            onChange={(e) => {
                                setSearchQuery(e.target.value);
                                setCurrentPage(1);
                            }}
                        />
                    </div>
                </div>

                {searchQuery && (
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-10 w-10 text-neutral-500 hover:text-destructive hover:bg-destructive/10"
                        onClick={clearFilters}
                        title="Clear Filters"
                    >
                        <X className="h-5 w-5" />
                    </Button>
                )}
            </div>

            <div className="rounded-lg border border-neutral-200 dark:border-slate-600 overflow-hidden">
                <Table className="table-auto border-spacing-0 border-separate">
                    <TableHeader>
                        <TableRow className="border-0">
                            <TableHead className="bg-neutral-100 dark:bg-slate-700 text-base px-4 h-12 border-b border-neutral-200 dark:border-slate-600 text-start">
                                Job Code
                            </TableHead>
                            <TableHead className="bg-neutral-100 dark:bg-slate-700 text-base px-4 h-12 border-b border-neutral-200 dark:border-slate-600 text-start">
                                Candidate Name
                            </TableHead>
                            <TableHead className="bg-neutral-100 dark:bg-slate-700 text-base px-4 h-12 border-b border-neutral-200 dark:border-slate-600 text-start">
                                Contact Info
                            </TableHead>
                            <TableHead className="bg-neutral-100 dark:bg-slate-700 text-base px-4 h-12 border-b border-neutral-200 dark:border-slate-600 text-start">
                                Location
                            </TableHead>
                            <TableHead className="bg-neutral-100 dark:bg-slate-700 text-base px-4 h-12 border-b border-neutral-200 dark:border-slate-600 text-start">
                                Submission Date
                            </TableHead>
                            <TableHead className="bg-neutral-100 dark:bg-slate-700 text-base px-4 h-12 border-b border-neutral-200 dark:border-slate-600 text-center">
                                Current Status
                            </TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {currentSubmissions.length === 0 ? (
                            <TableRow>
                                <TableCell
                                    colSpan={6}
                                    className="h-24 text-center text-muted-foreground italic"
                                >
                                    No candidate submissions found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            currentSubmissions.map((sub) => {
                                const status = statusMap[sub.finalStatus] || { label: sub.finalStatus, variant: "secondary" };

                                return (
                                    <TableRow key={sub.id} className="hover:bg-neutral-50 dark:hover:bg-slate-800/50 transition-colors">
                                        <TableCell className="py-3 px-4 border-b border-neutral-200 dark:border-slate-600 text-start">
                                            <div className="flex flex-col gap-1">
                                                <div className="flex items-center gap-2">
                                                    <code className="bg-neutral-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-xs font-mono w-fit">
                                                        {sub.job?.jobCode || "N/A"}
                                                    </code>
                                                    {(sub.job?.submissionRequired !== undefined || submissionCountsByJob[sub.jobId]) && (
                                                        <Badge variant="outline" className="text-[10px] h-5 px-1.5 bg-neutral-50 dark:bg-slate-800 text-neutral-500 whitespace-nowrap">
                                                            {sub.job?.submissionRequired !== undefined
                                                                ? `${sub.job?.submissionDone || 0} / ${sub.job.submissionRequired} done`
                                                                : `${submissionCountsByJob[sub.jobId]} ${submissionCountsByJob[sub.jobId] === 1 ? 'submission' : 'submissions'}`}
                                                        </Badge>
                                                    )}
                                                </div>
                                                <span className="text-[10px] text-muted-foreground capitalize truncate max-w-[200px]" title={sub.job?.jobTitle}>
                                                    {sub.job?.jobTitle?.toLowerCase() || "-"}
                                                </span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="py-3 px-4 border-b border-neutral-200 dark:border-slate-600 text-start font-medium capitalize">
                                            {sub.candidateName}
                                        </TableCell>
                                        <TableCell className="py-3 px-4 border-b border-neutral-200 dark:border-slate-600 text-start whitespace-nowrap">
                                            <div className="flex flex-col">
                                                <span className="text-sm">{sub.candidateEmail}</span>
                                                <span className="text-[10px] text-muted-foreground">{sub.candidatePhone || "N/A"}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="py-3 px-4 border-b border-neutral-200 dark:border-slate-600 text-start">
                                            {sub.candidateCurrentLocation || "-"}
                                        </TableCell>
                                        <TableCell className="py-3 px-4 border-b border-neutral-200 dark:border-slate-600 text-start whitespace-nowrap">
                                            <div className="flex flex-col">
                                                <span className="text-sm">
                                                    {new Intl.DateTimeFormat("en-US", {
                                                        timeZone: "America/New_York",
                                                        month: "short",
                                                        day: "numeric",
                                                        year: "numeric"
                                                    }).format(new Date(sub.submissionDate))}
                                                </span>
                                                <span className="text-[10px] text-muted-foreground">
                                                    {new Intl.DateTimeFormat("en-US", {
                                                        timeZone: "America/New_York",
                                                        hour: "numeric",
                                                        minute: "numeric",
                                                        timeZoneName: "short"
                                                    }).format(new Date(sub.submissionDate))}
                                                </span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="py-3 px-4 border-b border-neutral-200 dark:border-slate-600 text-center">
                                            <Badge variant={status.variant as any} className="font-semibold px-2 py-0.5 rounded-full text-[10px] uppercase tracking-wider">
                                                {status.label}
                                            </Badge>
                                        </TableCell>
                                    </TableRow>
                                );
                            })
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
                <div className="flex items-center justify-between px-2">
                    <p className="text-sm text-muted-foreground italic">
                        Showing <span className="font-medium">{Math.min((currentPage - 1) * itemsPerPage + 1, sortedSubmissions.length)}</span> to <span className="font-medium">{Math.min(currentPage * itemsPerPage, sortedSubmissions.length)}</span> of <span className="font-medium">{sortedSubmissions.length}</span> {sortedSubmissions.length === submissions.length ? "submissions" : "filtered submissions"}
                    </p>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => handlePageChange(1)}
                            disabled={currentPage === 1}
                        >
                            <ChevronsLeft className="h-4 w-4" />
                        </Button>
                        <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => handlePageChange(currentPage - 1)}
                            disabled={currentPage === 1}
                        >
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <div className="flex items-center gap-1">
                            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                let pageNum;
                                if (totalPages <= 5) {
                                    pageNum = i + 1;
                                } else if (currentPage <= 3) {
                                    pageNum = i + 1;
                                } else if (currentPage >= totalPages - 2) {
                                    pageNum = totalPages - 4 + i;
                                } else {
                                    pageNum = currentPage - 2 + i;
                                }

                                return (
                                    <Button
                                        key={pageNum}
                                        variant={currentPage === pageNum ? "default" : "outline"}
                                        size="sm"
                                        className="h-8 w-8 text-xs"
                                        onClick={() => handlePageChange(pageNum)}
                                    >
                                        {pageNum}
                                    </Button>
                                );
                            })}
                        </div>
                        <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => handlePageChange(currentPage + 1)}
                            disabled={currentPage === totalPages}
                        >
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                        <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => handlePageChange(totalPages)}
                            disabled={currentPage === totalPages}
                        >
                            <ChevronsRight className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}
