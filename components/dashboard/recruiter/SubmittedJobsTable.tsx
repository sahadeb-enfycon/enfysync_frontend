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
import { Button } from "@/components/ui/button";
import {
    ChevronLeft,
    ChevronRight,
    ChevronsLeft,
    ChevronsRight,
    Search,
    X,
    Filter,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { cn, formatUsDate, formatUsTime } from "@/lib/utils";

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
    showExtendedDetails?: boolean;
}

const getBadgeStyles = (status: string) => {
    const s = status?.toUpperCase() || "";
    if (s === "PENDING" || s === "ON HOLD" || s.includes("HOLD")) {
        return "bg-amber-100 text-amber-700";
    }
    if (s === "SUBMITTED" || s === "ACTIVE") {
        return "bg-blue-100 text-blue-700";
    }
    if (s === "SELECTED" || s === "APPROVED" || s === "PASSED" || s === "FILLED") {
        return "bg-green-100 text-green-700";
    }
    if (s === "REJECTED" || s === "CLOSED") {
        return "bg-red-100 text-red-700";
    }
    return "bg-gray-100 text-gray-700";
};

// Pipeline Component for L1/L2/L3
const PipelineProgress = ({ sub }: { sub: CandidateSubmission }) => {
    const stages = [
        { label: "L1", status: sub.l1Status, date: sub.l1Date },
        { label: "L2", status: sub.l2Status, date: sub.l2Date },
        { label: "L3", status: sub.l3Status, date: sub.l3Date },
    ];

    return (
        <div className="flex items-center space-x-2">
            {stages.map((stage, idx) => {
                const s = (stage.status || "").toUpperCase();
                let circleColor = "bg-gray-200 border-gray-300"; // Pending default
                let textColor = "text-gray-400";

                if (s === "PASSED" || s === "SELECTED" || s === "APPROVED") {
                    circleColor = "bg-green-500 border-green-600";
                    textColor = "text-green-700 font-medium";
                } else if (s === "REJECTED") {
                    circleColor = "bg-red-500 border-red-600";
                    textColor = "text-red-700 font-medium";
                } else if (s === "PENDING" || s === "ACTIVE" || s === "SUBMITTED") {
                    circleColor = "bg-blue-500 border-blue-600 ring-2 ring-blue-200";
                    textColor = "text-blue-700 font-medium";
                } else if (s) {
                    circleColor = "bg-blue-500 border-blue-600";
                    textColor = "text-blue-700 font-medium";
                }

                return (
                    <div key={idx} className="flex items-center">
                        <div className="flex flex-col items-center gap-1 group relative">
                            <div className={cn("w-3 h-3 rounded-full border", circleColor)} title={`${stage.label}: ${stage.status || 'Pending'}`} />
                            <span className={cn("text-[10px]", textColor)}>{stage.label}</span>
                        </div>
                        {idx < stages.length - 1 && (
                            <div className={cn("w-6 h-px mb-4", (s === "PASSED" || s === "SELECTED") ? "bg-green-500" : "bg-gray-200")} />
                        )}
                    </div>
                );
            })}
        </div>
    );
};


export default function SubmittedJobsTable({
    submissions,
    showExtendedDetails = false,
}: SubmittedJobsTableProps) {
    const [currentPage, setCurrentPage] = useState(1);
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const itemsPerPage = 10;

    // Derived Statistics
    const stats = useMemo(() => {
        let total = submissions.length;
        let pendingL1 = 0;
        let inInterview = 0;
        let finalized = 0;

        submissions.forEach(sub => {
            const final = (sub.finalStatus || "").toUpperCase();
            if (final === "SELECTED" || final === "REJECTED") {
                finalized++;
            } else if (!sub.l1Status || sub.l1Status.toUpperCase() === "PENDING") {
                pendingL1++;
            } else {
                inInterview++;
            }
        });

        return { total, pendingL1, inInterview, finalized };
    }, [submissions]);

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

            const matchesStatus = statusFilter === "all" || (sub.finalStatus && sub.finalStatus.toUpperCase() === statusFilter.toUpperCase());

            return matchesSearch && matchesStatus;
        });
    }, [submissions, searchQuery, statusFilter]);

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
        setStatusFilter("all");
        setCurrentPage(1);
    };

    // Extract unique statuses for dropdown
    const uniqueStatuses = Array.from(new Set(submissions.map(s => s.finalStatus).filter(Boolean)));

    return (
        <div className="space-y-6">

            {/* 1. Top Summary Stats Section */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex flex-col gap-1">
                    <span className="text-sm font-medium text-gray-500">Total Submissions</span>
                    <span className="text-3xl font-semibold text-gray-900">{stats.total}</span>
                </div>
                <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex flex-col gap-1">
                    <span className="text-sm font-medium text-gray-500">Pending L1</span>
                    <span className="text-3xl font-semibold text-amber-600">{stats.pendingL1}</span>
                </div>
                <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex flex-col gap-1">
                    <span className="text-sm font-medium text-gray-500">In Interview</span>
                    <span className="text-3xl font-semibold text-blue-600">{stats.inInterview}</span>
                </div>
                <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex flex-col gap-1">
                    <span className="text-sm font-medium text-gray-500">Finalized</span>
                    <span className="text-3xl font-semibold text-green-600">{stats.finalized}</span>
                </div>
            </div>

            {/* 6. Improved Search Section */}
            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-wrap gap-4 items-end">
                <div className="flex-1 min-w-[200px] flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider ml-1">Search</label>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                            placeholder="Candidate name, email or job code..."
                            className="pl-9 h-10 bg-white border-gray-200 focus:border-blue-500 focus:ring-blue-500 rounded-lg"
                            value={searchQuery}
                            onChange={(e) => {
                                setSearchQuery(e.target.value);
                                setCurrentPage(1);
                            }}
                        />
                    </div>
                </div>

                <div className="flex flex-col gap-1.5 min-w-[150px]">
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider ml-1 flex items-center gap-1">
                        <Filter className="h-3 w-3" /> Status
                    </label>
                    <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setCurrentPage(1); }}>
                        <SelectTrigger className="h-10 bg-white border-gray-200 rounded-lg">
                            <SelectValue placeholder="All Statuses" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Statuses</SelectItem>
                            {uniqueStatuses.map(status => (
                                <SelectItem key={status} value={status}>
                                    <span className="capitalize">{status.toLowerCase()}</span>
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                {(searchQuery || statusFilter !== "all") && (
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-10 w-10 text-gray-500 hover:text-red-600 hover:bg-red-50"
                        onClick={clearFilters}
                        title="Clear Filters"
                    >
                        <X className="h-5 w-5" />
                    </Button>
                )}
            </div>

            {/* Table wrapper inside clean card container */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <Table className="table-auto border-spacing-0 w-full min-w-max">
                        <TableHeader className="bg-gray-50 border-b border-gray-200">
                            <TableRow className="border-0 hover:bg-transparent">
                                <TableHead className="text-gray-600 font-medium text-sm px-6 py-4 text-start">
                                    Job Reference
                                </TableHead>
                                <TableHead className="text-gray-600 font-medium text-sm px-6 py-4 text-start">
                                    Candidate Details
                                </TableHead>
                                <TableHead className="text-gray-600 font-medium text-sm px-6 py-4 text-start">
                                    Submission Date
                                </TableHead>
                                {showExtendedDetails && (
                                    <TableHead className="text-gray-600 font-medium text-sm px-6 py-4 text-start">
                                        Pipeline Progress
                                    </TableHead>
                                )}
                                <TableHead className="text-gray-600 font-medium text-sm px-6 py-4 text-center">
                                    Status
                                </TableHead>
                                {showExtendedDetails && (
                                    <>
                                        <TableHead className="text-gray-600 font-medium text-sm px-6 py-4 text-start">
                                            Feedback
                                        </TableHead>
                                    </>
                                )}
                                <TableHead className="text-gray-600 font-medium text-sm px-6 py-4 text-end">
                                    Actions
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {currentSubmissions.length === 0 ? (
                                <TableRow>
                                    <TableCell
                                        colSpan={showExtendedDetails ? 7 : 5}
                                        className="h-32 text-center text-gray-500"
                                    >
                                        <div className="flex flex-col items-center justify-center gap-2">
                                            <Search className="h-8 w-8 text-gray-300" />
                                            <span>No candidate submissions found.</span>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                currentSubmissions.map((sub) => {
                                    return (
                                        <TableRow key={sub.id} className="hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-0 group">
                                            {/* Job Reference */}
                                            <TableCell className="px-6 py-4 text-start">
                                                <div className="flex flex-col gap-1.5">
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-semibold text-gray-900 text-sm">
                                                            {sub.job?.jobCode || "N/A"}
                                                        </span>
                                                        {(sub.job?.submissionRequired !== undefined || submissionCountsByJob[sub.jobId]) && (
                                                            <span className="bg-gray-100 text-gray-600 text-[10px] font-medium px-2 py-0.5 rounded-full whitespace-nowrap">
                                                                {sub.job?.submissionRequired !== undefined
                                                                    ? `${sub.job?.submissionDone || 0}/${sub.job.submissionRequired}`
                                                                    : `${submissionCountsByJob[sub.jobId]}`}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <span className="text-xs text-gray-500 capitalize truncate max-w-[220px]" title={sub.job?.jobTitle}>
                                                        {sub.job?.jobTitle?.toLowerCase() || "-"}
                                                    </span>
                                                </div>
                                            </TableCell>

                                            {/* Candidate Details */}
                                            <TableCell className="px-6 py-4 text-start">
                                                <div className="flex flex-col gap-1">
                                                    <span className="font-medium text-sm text-gray-900 capitalize">
                                                        {sub.candidateName}
                                                    </span>
                                                    <a href={`mailto:${sub.candidateEmail}`} className="text-xs text-gray-500 hover:text-blue-600 hover:underline">
                                                        {sub.candidateEmail}
                                                    </a>
                                                    {sub.candidatePhone && (
                                                        <span className="text-[10px] text-gray-400">{sub.candidatePhone}</span>
                                                    )}
                                                </div>
                                            </TableCell>

                                            {/* Submission Date */}
                                            <TableCell className="px-6 py-4 text-start whitespace-nowrap">
                                                <div className="flex flex-col gap-0.5">
                                                    <span className="text-sm text-gray-900 font-medium">
                                                        {formatUsDate(sub.submissionDate)}
                                                    </span>
                                                    <span className="text-xs text-gray-400">
                                                        {formatUsTime(sub.submissionDate)}
                                                    </span>
                                                </div>
                                            </TableCell>

                                            {/* Pipeline Progress (Replaces L1/L2/L3) */}
                                            {showExtendedDetails && (
                                                <TableCell className="px-6 py-4 text-center">
                                                    <PipelineProgress sub={sub} />
                                                </TableCell>
                                            )}

                                            {/* Status Badge */}
                                            <TableCell className="px-6 py-4 text-center">
                                                <span className={cn(
                                                    "rounded-full px-3 py-1 text-xs font-medium uppercase tracking-wide inline-flex items-center justify-center",
                                                    getBadgeStyles(sub.finalStatus)
                                                )}>
                                                    {sub.finalStatus || "PENDING"}
                                                </span>
                                            </TableCell>

                                            {/* Feedback (Remarks & Comments) */}
                                            {showExtendedDetails && (
                                                <TableCell className="px-6 py-4 text-start max-w-[250px]">
                                                    <div className="flex flex-col gap-1.5">
                                                        {sub.remarks && (
                                                            <div className="text-xs">
                                                                <span className="font-semibold text-gray-600">Remarks: </span>
                                                                <span className="text-gray-500 line-clamp-1" title={sub.remarks}>{sub.remarks}</span>
                                                            </div>
                                                        )}
                                                        {sub.recruiterComment && (
                                                            <div className="text-[10px]">
                                                                <span className="font-semibold text-gray-500">Note: </span>
                                                                <span className="text-gray-400 line-clamp-1" title={sub.recruiterComment}>{sub.recruiterComment}</span>
                                                            </div>
                                                        )}
                                                        {!sub.remarks && !sub.recruiterComment && <span className="text-gray-400 text-xs italic">-</span>}
                                                    </div>
                                                </TableCell>
                                            )}

                                            {/* 7. Action Button */}
                                            <TableCell className="px-6 py-4 text-end">
                                                <button className="text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100 rounded-md px-2 py-1 hover:bg-blue-50">
                                                    View Details
                                                </button>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
                <div className="flex items-center justify-between px-2 pt-2">
                    <p className="text-sm text-gray-500">
                        Showing <span className="font-medium text-gray-900">{Math.min((currentPage - 1) * itemsPerPage + 1, sortedSubmissions.length)}</span> to <span className="font-medium text-gray-900">{Math.min(currentPage * itemsPerPage, sortedSubmissions.length)}</span> of <span className="font-medium text-gray-900">{sortedSubmissions.length}</span> results
                    </p>
                    <div className="flex items-center gap-1">
                        <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8 border-gray-200 text-gray-600 hover:bg-gray-50"
                            onClick={() => handlePageChange(1)}
                            disabled={currentPage === 1}
                        >
                            <ChevronsLeft className="h-4 w-4" />
                        </Button>
                        <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8 border-gray-200 text-gray-600 hover:bg-gray-50"
                            onClick={() => handlePageChange(currentPage - 1)}
                            disabled={currentPage === 1}
                        >
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <div className="flex items-center gap-1 px-1">
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
                                        className={cn(
                                            "h-8 w-8 text-xs",
                                            currentPage === pageNum
                                                ? "bg-blue-600 hover:bg-blue-700 text-white border-0"
                                                : "border-gray-200 text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                                        )}
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
                            className="h-8 w-8 border-gray-200 text-gray-600 hover:bg-gray-50"
                            onClick={() => handlePageChange(currentPage + 1)}
                            disabled={currentPage === totalPages}
                        >
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                        <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8 border-gray-200 text-gray-600 hover:bg-gray-50"
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
