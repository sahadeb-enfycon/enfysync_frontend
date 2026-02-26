"use client";

import { useEffect, useMemo, useState } from 'react';
import AudienceStatsChart from '@/components/charts/audience-stats-chart';
import CustomSelect from '@/components/shared/custom-select';
import { Card, CardContent } from '@/components/ui/card';
import { apiClient } from '@/lib/apiClient';

interface PodRow {
    id: string;
    name: string;
}

interface JobRow {
    id: string;
    pod?: {
        id: string;
        name: string;
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

const PodSubmissionChart = () => {
    const [selectedRange, setSelectedRange] = useState("Last 30 Days");
    const [isLoading, setIsLoading] = useState(true);
    const [podCategories, setPodCategories] = useState<string[]>([]);
    const [podSeries, setPodSeries] = useState<
        { name: string; data: number[] }[]
    >([
        { name: 'Submissions', data: [] },
        { name: 'Interviews', data: [] },
        { name: 'Placements', data: [] },
    ]);

    useEffect(() => {
        const fetchChartData = async () => {
            setIsLoading(true);
            try {
                const [podsRes, jobsRes, subsRes] = await Promise.all([
                    apiClient('/pods/my-pods'),
                    apiClient('/jobs'),
                    apiClient('/recruiter-submissions'),
                ]);

                const podsData = podsRes.ok ? await podsRes.json() : [];
                const jobsData = jobsRes.ok ? await jobsRes.json() : [];
                const subsData = subsRes.ok ? await subsRes.json() : [];

                const pods: PodRow[] = Array.isArray(podsData) ? podsData : [];
                const jobs: JobRow[] = Array.isArray(jobsData) ? jobsData : [];
                const submissions: SubmissionRow[] = Array.isArray(subsData)
                    ? subsData
                    : Array.isArray(subsData?.submissions)
                        ? subsData.submissions
                        : [];
                const now = new Date();
                const rangeStart = new Date(now);
                if (selectedRange === "Last 30 Days") {
                    rangeStart.setDate(now.getDate() - 30);
                } else if (selectedRange === "This Quarter") {
                    const quarterStartMonth = Math.floor(now.getMonth() / 3) * 3;
                    rangeStart.setMonth(quarterStartMonth, 1);
                    rangeStart.setHours(0, 0, 0, 0);
                } else if (selectedRange === "Year to Date") {
                    rangeStart.setMonth(0, 1);
                    rangeStart.setHours(0, 0, 0, 0);
                }

                const podIdSet = new Set(pods.map((pod) => pod.id));
                const jobToPodName = new Map<string, string>();

                jobs.forEach((job) => {
                    if (!job.pod?.id || !podIdSet.has(job.pod.id)) return;
                    jobToPodName.set(job.id, job.pod.name || 'Unknown Pod');
                });

                const metricsByPod = new Map<string, PodMetrics>();
                pods.forEach((pod) => {
                    metricsByPod.set(pod.name, {
                        submissions: 0,
                        interviews: 0,
                        placements: 0,
                    });
                });

                const isInterviewProgressed = (sub: SubmissionRow) => {
                    const statuses = [sub.l1Status, sub.l2Status, sub.l3Status]
                        .map((s) => (s || '').trim().toUpperCase());
                    return statuses.some((s) => s && s !== 'PENDING');
                };

                const isPlacement = (sub: SubmissionRow) => {
                    const finalStatus = (sub.finalStatus || '').trim().toUpperCase();
                    return finalStatus === 'SELECTED' || finalStatus === 'FILLED';
                };

                submissions.forEach((sub) => {
                    if (!sub.jobId) return;
                    if (selectedRange !== "All Time") {
                        if (!sub.submissionDate) return;
                        const submittedAt = new Date(sub.submissionDate);
                        if (Number.isNaN(submittedAt.getTime()) || submittedAt < rangeStart) return;
                    }
                    const podName = jobToPodName.get(sub.jobId);
                    if (!podName) return;

                    const current = metricsByPod.get(podName) || {
                        submissions: 0,
                        interviews: 0,
                        placements: 0,
                    };
                    current.submissions += 1;
                    if (isInterviewProgressed(sub)) current.interviews += 1;
                    if (isPlacement(sub)) current.placements += 1;
                    metricsByPod.set(podName, current);
                });

                const sortedPodRows = Array.from(metricsByPod.entries()).sort(
                    (a, b) => b[1].submissions - a[1].submissions
                );

                const categories = sortedPodRows.map(([podName]) => podName);
                const submissionsSeries = sortedPodRows.map(([, m]) => m.submissions);
                const interviewsSeries = sortedPodRows.map(([, m]) => m.interviews);
                const placementsSeries = sortedPodRows.map(([, m]) => m.placements);

                setPodCategories(categories);
                setPodSeries([
                    { name: 'Submissions', data: submissionsSeries },
                    { name: 'Interviews', data: interviewsSeries },
                    { name: 'Placements', data: placementsSeries },
                ]);
            } catch (error) {
                console.error('Error loading pod performance chart data:', error);
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

        fetchChartData();
    }, [selectedRange]);

    const hasData = useMemo(
        () => podSeries.some((series) => series.data.some((value) => value > 0)),
        [podSeries]
    );

    return (
        <Card className="border border-gray-200 dark:border-neutral-700 bg-white dark:bg-slate-800 rounded-md shadow-none h-full">
            <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                    <h6 className="font-semibold text-lg text-neutral-900 dark:text-white">Pod Performance Overview</h6>
                    <CustomSelect
                        placeholder={selectedRange}
                        options={["Last 30 Days", "This Quarter", "Year to Date", "All Time"]}
                        value={selectedRange}
                        onValueChange={setSelectedRange}
                    />
                </div>

                {isLoading ? (
                    <div className="h-[350px] flex items-center justify-center text-sm text-neutral-500">
                        Loading performance data...
                    </div>
                ) : (
                    <div className="apexcharts-tooltip-z-none">
                        <AudienceStatsChart
                            series={podSeries}
                            categories={podCategories.length ? podCategories : ['No Data']}
                            colors={['#487FFF', '#91B9FF', '#F59E0B']}
                            height={350}
                        />
                        {!hasData && (
                            <p className="text-xs text-neutral-500 mt-3 italic">
                                No submission/interview/placement data available for your pods yet.
                            </p>
                        )}
                    </div>
                )}
            </CardContent>
        </Card>
    );
};

export default PodSubmissionChart;
