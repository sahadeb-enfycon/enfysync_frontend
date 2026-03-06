"use client";

import React, { useState, useMemo } from "react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { parseISO, format, startOfDay } from "date-fns";
import { Calendar } from "lucide-react";

interface DatewiseSubmissionTableProps {
    jobs: any[];
}

const DatewiseSubmissionTable = ({ jobs }: DatewiseSubmissionTableProps) => {
    const [filter, setFilter] = useState("all");

    const filteredData = useMemo(() => {
        const dateGroups: Record<string, any> = {};

        // EST Timezone Helpers
        const getESTPart = (date: Date, part: 'year' | 'month' | 'day' | 'week' | 'fullDate') => {
            const options: Intl.DateTimeFormatOptions = { timeZone: 'America/New_York' };
            if (part === 'fullDate') {
                options.year = 'numeric';
                options.month = '2-digit';
                options.day = '2-digit';
                const parts = new Intl.DateTimeFormat('en-US', options).formatToParts(date);
                const month = parts.find(p => p.type === 'month')?.value;
                const day = parts.find(p => p.type === 'day')?.value;
                const year = parts.find(p => p.type === 'year')?.value;
                return `${year}-${month}-${day}`;
            }
            if (part === 'week') {
                const d = new Date(date.toLocaleString('en-US', { timeZone: 'America/New_York' }));
                d.setHours(0, 0, 0, 0);
                d.setDate(d.getDate() + 4 - (d.getDay() || 7));
                const yearStart = new Date(d.getFullYear(), 0, 1);
                return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
            }
            if (part === 'year') options.year = 'numeric';
            if (part === 'month') options.month = 'numeric';
            if (part === 'day') options.day = 'numeric';
            return new Intl.DateTimeFormat('en-US', options).format(date);
        };

        const now = new Date();
        const currentYear = getESTPart(now, 'year');
        const currentMonth = getESTPart(now, 'month');
        const currentDay = getESTPart(now, 'day');
        const currentWeek = getESTPart(now, 'week');

        jobs.forEach((job) => {
            const createdAt = parseISO(job.createdAt);
            const jobYear = getESTPart(createdAt, 'year');
            const jobMonth = getESTPart(createdAt, 'month');
            const jobDay = getESTPart(createdAt, 'day');
            const jobWeek = getESTPart(createdAt, 'week');
            const dateStr = getESTPart(createdAt, 'fullDate');

            let isInRange = false;
            if (filter === "all") isInRange = true;
            else if (filter === "today") isInRange = jobYear === currentYear && jobMonth === currentMonth && jobDay === currentDay;
            else if (filter === "week") isInRange = jobYear === currentYear && jobWeek === currentWeek;
            else if (filter === "month") isInRange = jobYear === currentYear && jobMonth === currentMonth;
            else if (filter === "year") isInRange = jobYear === currentYear;

            if (isInRange) {
                if (!dateGroups[dateStr]) {
                    dateGroups[dateStr] = {
                        date: dateStr,
                        newReq: 0,
                        cfrExtended: 0,
                        totalJobPost: 0,
                        totalPosition: 0,
                        totalSubmissionReq: 0,
                        totalSubmissionDone: 0,
                    };
                }

                const g = dateGroups[dateStr];
                const type = (job.requirementType || "").trim().toUpperCase();

                if (type === "NEW") {
                    g.newReq += 1;
                } else if (type === "CFR" || type === "CFR_EXTENDED") {
                    g.cfrExtended += 1;
                } else {
                    // Fallback for any other types to ensure they are counted
                    g.newReq += 1;
                }

                // Total is always incremented for any job in range
                g.totalJobPost += 1;
                g.totalPosition += job.noOfPositions || job.positions || 1;
                g.totalSubmissionReq += job.submissionRequired || 0;
                g.totalSubmissionDone += job.submissionDone || 0;
            }
        });

        return Object.values(dateGroups).map((g: any) => ({
            ...g,
            submissionRate: g.totalSubmissionReq > 0
                ? Math.round((g.totalSubmissionDone / g.totalSubmissionReq) * 100)
                : 0
        })).sort((a, b) => b.date.localeCompare(a.date));
    }, [jobs, filter]);

    const totals = useMemo(() => {
        return filteredData.reduce((acc, current) => {
            acc.newReq += current.newReq;
            acc.cfrExtended += current.cfrExtended;
            acc.totalJobPost += current.totalJobPost;
            acc.totalPosition += current.totalPosition;
            acc.totalSubmissionReq += current.totalSubmissionReq;
            acc.totalSubmissionDone += current.totalSubmissionDone;
            return acc;
        }, {
            newReq: 0,
            cfrExtended: 0,
            totalJobPost: 0,
            totalPosition: 0,
            totalSubmissionReq: 0,
            totalSubmissionDone: 0,
        });
    }, [filteredData]);

    const totalSubmissionRate = totals.totalSubmissionReq > 0
        ? Math.round((totals.totalSubmissionDone / totals.totalSubmissionReq) * 100)
        : 0;

    return (
        <Card className="card border-none shadow-premium overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between pb-6 px-6 bg-neutral-50/50 dark:bg-slate-800/50">
                <div>
                    <CardTitle className="text-xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                        Datewise Submission Performance
                    </CardTitle>
                    <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">Daily aggregation of job posts and submission activity</p>
                </div>
                <Select value={filter} onValueChange={setFilter}>
                    <SelectTrigger className="w-[160px] bg-white dark:bg-slate-900 shadow-sm border-neutral-200 dark:border-slate-700">
                        <SelectValue placeholder="Filter by" />
                    </SelectTrigger>
                    <SelectContent className="dark:bg-slate-900 border-slate-700">
                        <SelectItem value="all">All Time</SelectItem>
                        <SelectItem value="today">Today</SelectItem>
                        <SelectItem value="week">This Week</SelectItem>
                        <SelectItem value="month">This Month</SelectItem>
                        <SelectItem value="year">This Year</SelectItem>
                    </SelectContent>
                </Select>
            </CardHeader>
            <CardContent className="p-0">
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-neutral-100/50 dark:bg-slate-700/50 border-y border-neutral-200 dark:border-slate-600">
                                <TableHead className="px-6 py-4 font-bold text-neutral-700 dark:text-neutral-200 uppercase text-xs tracking-wider border-r border-neutral-200 dark:border-slate-600">Date</TableHead>
                                <TableHead className="px-4 py-4 font-bold text-neutral-700 dark:text-neutral-200 uppercase text-xs tracking-wider text-center border-r border-neutral-200 dark:border-slate-600 whitespace-nowrap">New Req</TableHead>
                                <TableHead className="px-4 py-4 font-bold text-neutral-700 dark:text-neutral-200 uppercase text-xs tracking-wider text-center border-r border-neutral-200 dark:border-slate-600 whitespace-nowrap">CFR / Ext</TableHead>
                                <TableHead className="px-4 py-4 font-bold text-neutral-700 dark:text-neutral-200 uppercase text-xs tracking-wider text-center border-r border-neutral-200 dark:border-slate-600 whitespace-nowrap">Total Job Post</TableHead>
                                <TableHead className="px-4 py-4 font-bold text-neutral-700 dark:text-neutral-200 uppercase text-xs tracking-wider text-center border-r border-neutral-200 dark:border-slate-600">Total Position</TableHead>
                                <TableHead className="px-4 py-4 font-bold text-neutral-700 dark:text-neutral-200 uppercase text-xs tracking-wider text-center border-r border-neutral-200 dark:border-slate-600">Total Submission Req</TableHead>
                                <TableHead className="px-4 py-4 font-bold text-neutral-700 dark:text-neutral-200 uppercase text-xs tracking-wider text-center border-r border-neutral-200 dark:border-slate-600">Total Submission Done</TableHead>
                                <TableHead className="px-6 py-4 font-bold text-neutral-700 dark:text-neutral-200 uppercase text-xs tracking-wider text-center">Rate Of Submission</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredData.length > 0 ? filteredData.map((group, index) => (
                                <TableRow key={index} className="hover:bg-primary/[0.02] dark:hover:bg-primary/[0.05] transition-all duration-200 border-b border-neutral-100 dark:border-slate-700 last:border-0 even:bg-neutral-50/50 dark:even:bg-slate-800/20">
                                    <TableCell className="px-6 py-4 border-r border-neutral-100 dark:border-slate-700/50">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-800/30">
                                                <Calendar className="h-4 w-4" />
                                            </div>
                                            <span className="font-bold text-neutral-800 dark:text-neutral-100 text-sm">
                                                {format(parseISO(group.date), "dd MMM yyyy")}
                                            </span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="px-4 py-4 text-center border-r border-neutral-100 dark:border-slate-700/50">
                                        <span className="inline-flex items-center justify-center min-w-[32px] h-8 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 font-bold text-sm border border-emerald-100 dark:border-emerald-800/30">
                                            {group.newReq}
                                        </span>
                                    </TableCell>
                                    <TableCell className="px-4 py-4 text-center border-r border-neutral-100 dark:border-slate-700/50">
                                        <span className="inline-flex items-center justify-center min-w-[32px] h-8 rounded-lg bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 font-bold text-sm border border-orange-100 dark:border-orange-800/30">
                                            {group.cfrExtended}
                                        </span>
                                    </TableCell>
                                    <TableCell className="px-4 py-4 text-center border-r border-neutral-100 dark:border-slate-700/50">
                                        <span className="inline-flex items-center justify-center min-w-[32px] h-8 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-bold text-sm border border-blue-100 dark:border-blue-800/30">
                                            {group.totalJobPost}
                                        </span>
                                    </TableCell>
                                    <TableCell className="px-4 py-4 text-center border-r border-neutral-100 dark:border-slate-700/50 font-bold text-neutral-600 dark:text-neutral-300 text-sm">
                                        {group.totalPosition}
                                    </TableCell>
                                    <TableCell className="px-4 py-4 text-center border-r border-neutral-100 dark:border-slate-700/50">
                                        <span className="inline-flex items-center justify-center min-w-[32px] h-8 rounded-lg bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 font-bold text-sm border border-amber-100 dark:border-amber-800/30">
                                            {group.totalSubmissionReq}
                                        </span>
                                    </TableCell>
                                    <TableCell className="px-4 py-4 text-center border-r border-neutral-100 dark:border-slate-700/50">
                                        <span className="inline-flex items-center justify-center min-w-[32px] h-8 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 font-bold text-sm border border-emerald-100 dark:border-emerald-800/30">
                                            {group.totalSubmissionDone}
                                        </span>
                                    </TableCell>
                                    <TableCell className="px-6 py-4 text-center">
                                        <div className="flex flex-col items-center gap-2">
                                            <span className={`text-sm font-black ${group.submissionRate >= 70 ? 'text-emerald-500' : group.submissionRate >= 40 ? 'text-amber-500' : 'text-rose-500'}`}>
                                                {group.submissionRate}%
                                            </span>
                                            <div className="w-24 h-2 bg-neutral-100 dark:bg-slate-700/50 rounded-full overflow-hidden p-[1px]">
                                                <div
                                                    className={`h-full rounded-full transition-all duration-1000 ease-out ${group.submissionRate >= 70 ? 'bg-emerald-500' : group.submissionRate >= 40 ? 'bg-amber-500' : 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.4)]'}`}
                                                    style={{ width: `${Math.min(group.submissionRate, 100)}%` }}
                                                />
                                            </div>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            )) : (
                                <TableRow>
                                    <TableCell colSpan={6} className="h-40 text-center">
                                        <div className="flex flex-col items-center justify-center gap-2 text-neutral-400">
                                            <div className="p-3 rounded-full bg-neutral-50 dark:bg-slate-800/50">
                                                <Calendar className="h-6 w-6" />
                                            </div>
                                            <span className="text-sm font-medium">No submission data found for the selected period</span>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            )}
                            {filteredData.length > 0 && (
                                <TableRow className="bg-neutral-50 dark:bg-slate-800/80 font-black border-t-2 border-primary/20">
                                    <TableCell className="px-6 py-5 border-r border-neutral-100 dark:border-slate-700/50">
                                        <div className="flex items-center gap-3">
                                            <div className="h-10 w-10 rounded-lg bg-emerald-600 flex items-center justify-center text-white shadow-lg shadow-emerald-500/20">
                                                <span className="text-[10px] font-black uppercase">Tot</span>
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-[15px] text-emerald-600">Grand Total</span>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell className="px-4 py-5 text-center border-r border-neutral-100 dark:border-slate-700/50">
                                        <span className="inline-flex items-center justify-center min-w-[32px] h-8 rounded-lg bg-emerald-600 text-white font-black text-sm shadow-md shadow-emerald-500/20">
                                            {totals.newReq}
                                        </span>
                                    </TableCell>
                                    <TableCell className="px-4 py-5 text-center border-r border-neutral-100 dark:border-slate-700/50">
                                        <span className="inline-flex items-center justify-center min-w-[32px] h-8 rounded-lg bg-orange-600 text-white font-black text-sm shadow-md shadow-orange-500/20">
                                            {totals.cfrExtended}
                                        </span>
                                    </TableCell>
                                    <TableCell className="px-4 py-5 text-center border-r border-neutral-100 dark:border-slate-700/50">
                                        <span className="inline-flex items-center justify-center min-w-[32px] h-8 rounded-lg bg-blue-600 text-white font-black text-sm shadow-md shadow-blue-500/20">
                                            {totals.totalJobPost}
                                        </span>
                                    </TableCell>
                                    <TableCell className="px-4 py-5 text-center text-lg text-neutral-700 dark:text-neutral-200 border-r border-neutral-100 dark:border-slate-700/50">{totals.totalPosition}</TableCell>
                                    <TableCell className="px-4 py-5 text-center border-r border-neutral-100 dark:border-slate-700/50">
                                        <span className="inline-flex items-center justify-center min-w-[32px] h-8 rounded-lg bg-amber-600 text-white font-black text-sm shadow-md shadow-amber-500/20">
                                            {totals.totalSubmissionReq}
                                        </span>
                                    </TableCell>
                                    <TableCell className="px-4 py-5 text-center border-r border-neutral-100 dark:border-slate-700/50">
                                        <span className="inline-flex items-center justify-center min-w-[32px] h-8 rounded-lg bg-emerald-600 text-white font-black text-sm shadow-md shadow-emerald-500/20">
                                            {totals.totalSubmissionDone}
                                        </span>
                                    </TableCell>
                                    <TableCell className="px-6 py-5 text-center">
                                        <div className="flex flex-col items-center gap-2">
                                            <span className="text-sm font-black text-emerald-600">
                                                {totalSubmissionRate}%
                                            </span>
                                            <div className="w-24 h-2 bg-neutral-200 dark:bg-slate-700/50 rounded-full overflow-hidden p-[1px]">
                                                <div
                                                    className="h-full rounded-full bg-emerald-600 transition-all duration-1000 ease-out"
                                                    style={{ width: `${Math.min(totalSubmissionRate, 100)}%` }}
                                                />
                                            </div>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
        </Card>
    );
};

export default DatewiseSubmissionTable;
