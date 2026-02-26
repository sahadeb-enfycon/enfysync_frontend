"use client";

import { useEffect, useMemo, useState } from 'react';
import AudienceStatsChart from '@/components/charts/audience-stats-chart';
import CustomSelect from '@/components/shared/custom-select';
import { Card, CardContent } from '@/components/ui/card';
import { apiClient } from '@/lib/apiClient';

interface JobRow {
    id: string;
    pod?: {
        id?: string;
        name?: string;
    } | null;
}

interface SubmissionRow {
    jobId?: string;
    submissionDate?: string;
    l1Status?: string;
    l2Status?: string;
    l3Status?: string;
    finalStatus?: string;
}

interface PodMetrics {
    submissions: number;
    interviews: number;
    placements: number;
}

const PodPerformanceCard = () => {
    const [selectedRange, setSelectedRange] = useState("Monthly");
    const [isLoading, setIsLoading] = useState(true);
    const [podCategories, setPodCategories] = useState<string[]>([]);
    const [podSeries, setPodSeries] = useState<{ name: string; data: number[] }[]>([
        { name: 'Submissions', data: [] },
        { name: 'Interviews', data: [] },
        { name: 'Placements', data: [] },
    ]);

    useEffect(() => {
        const fetchPodPerformance = async () => {
            setIsLoading(true);
            try {
                const [jobsRes, submissionsRes] = await Promise.all([
                    apiClient('/jobs'),
                    apiClient('/recruiter-submissions'),
                ]);

                const jobsData = jobsRes.ok ? await jobsRes.json() : [];
                const submissionsData = submissionsRes.ok ? await submissionsRes.json() : [];

                const jobs: JobRow[] = Array.isArray(jobsData) ? jobsData : [];
                const submissions: SubmissionRow[] = Array.isArray(submissionsData)
                    ? submissionsData
                    : Array.isArray(submissionsData?.submissions)
                        ? submissionsData.submissions
                        : [];

                const now = new Date();
                const rangeStart = new Date(now);
                if (selectedRange === "Today") {
                    rangeStart.setHours(0, 0, 0, 0);
                } else if (selectedRange === "Weekly") {
                    rangeStart.setDate(now.getDate() - 7);
                } else if (selectedRange === "Monthly") {
                    rangeStart.setDate(now.getDate() - 30);
                } else if (selectedRange === "Yearly") {
                    rangeStart.setFullYear(now.getFullYear() - 1);
                }

                const jobToPodName = new Map<string, string>();
                jobs.forEach((job) => {
                    const podName = job.pod?.name?.trim();
                    if (podName) jobToPodName.set(job.id, podName);
                });

                const metricsByPod = new Map<string, PodMetrics>();
                const ensurePodMetrics = (podName: string) => {
                    if (!metricsByPod.has(podName)) {
                        metricsByPod.set(podName, {
                            submissions: 0,
                            interviews: 0,
                            placements: 0,
                        });
                    }
                    return metricsByPod.get(podName)!;
                };

                const isInterviewProgressed = (sub: SubmissionRow) => {
                    const statuses = [sub.l1Status, sub.l2Status, sub.l3Status]
                        .map((s) => (s || '').trim().toUpperCase());
                    return statuses.some((s) => s && s !== 'PENDING');
                };

                const isPlacement = (sub: SubmissionRow) => {
                    const final = (sub.finalStatus || '').trim().toUpperCase();
                    return final === 'SELECTED' || final === 'FILLED';
                };

                submissions.forEach((sub) => {
                    if (!sub.jobId) return;
                    const podName = jobToPodName.get(sub.jobId);
                    if (!podName) return;

                    if (selectedRange !== "Yearly") {
                        if (!sub.submissionDate) return;
                        const submissionAt = new Date(sub.submissionDate);
                        if (Number.isNaN(submissionAt.getTime()) || submissionAt < rangeStart) return;
                    }

                    const podMetrics = ensurePodMetrics(podName);
                    podMetrics.submissions += 1;
                    if (isInterviewProgressed(sub)) podMetrics.interviews += 1;
                    if (isPlacement(sub)) podMetrics.placements += 1;
                });

                const sortedRows = Array.from(metricsByPod.entries()).sort(
                    (a, b) => b[1].submissions - a[1].submissions
                );

                const categories = sortedRows.map(([name]) => name);
                setPodCategories(categories);
                setPodSeries([
                    { name: 'Submissions', data: sortedRows.map(([, v]) => v.submissions) },
                    { name: 'Interviews', data: sortedRows.map(([, v]) => v.interviews) },
                    { name: 'Placements', data: sortedRows.map(([, v]) => v.placements) },
                ]);
            } catch (error) {
                console.error("Failed to load pod wise performance:", error);
                setPodCategories([]);
                setPodSeries([
                    { name: 'Submissions', data: [] },
                    { name: 'Interviews', data: [] },
                    { name: 'Placements', data: [] },
                ]);
            } finally {
                setIsLoading(false);
            }
        };

        fetchPodPerformance();
    }, [selectedRange]);

    const hasData = useMemo(
        () => podSeries.some((series) => series.data.some((value) => value > 0)),
        [podSeries]
    );

    return (
        <Card className="card">
            <CardContent className="card-body p-0">
                <div className="flex items-center justify-between">
                    <h6 className="mb-3 font-semibold text-lg">Pod wise Performance</h6>
                    <CustomSelect
                        placeholder={selectedRange}
                        options={["Yearly", "Monthly", "Weekly", "Today"]}
                        value={selectedRange}
                        onValueChange={setSelectedRange}
                    />
                </div>

                {isLoading ? (
                    <div className="h-[330px] flex items-center justify-center text-sm text-neutral-500">
                        Loading pod performance...
                    </div>
                ) : (
                    <div className="apexcharts-tooltip-z-none">
                        <AudienceStatsChart
                            series={podSeries}
                            categories={podCategories.length ? podCategories : ['No Data']}
                            colors={['#487FFF', '#91B9FF', '#FF9F29']}
                            height={330}
                        />
                        {!hasData && (
                            <p className="text-xs text-neutral-500 mt-2 italic">
                                No pod submission activity found for the selected period.
                            </p>
                        )}
                    </div>
                )}
            </CardContent>
        </Card>
    );
};

export default PodPerformanceCard;
