"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import SubmittedJobsTable, { CandidateSubmission } from "@/components/dashboard/recruiter/SubmittedJobsTable";
import { Loader2 } from "lucide-react";


export default function SubmittedJobsPage() {
    const { data: session } = useSession();
    const token = (session as any)?.user?.accessToken;
    const [submissions, setSubmissions] = useState<CandidateSubmission[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");

    const fetchSubmissions = async () => {
        if (!token) return;
        setIsLoading(true);
        setError("");

        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/recruiter-submissions`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (!res.ok) {
                throw new Error("Failed to fetch submitted jobs");
            }

            const data = await res.json();
            // Ensure data is array
            const arr = Array.isArray(data) ? data : (data?.submissions || []);

            console.log("Fetched submissions payload:", arr);
            setSubmissions(arr);
        } catch (err: any) {
            console.error("Fetch submissions error:", err);
            setError(err.message || "An error occurred while fetching submissions");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (token) {
            fetchSubmissions();
        }
    }, [token]);

    if (!session) {
        return null;
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-50">
                        Submitted Candidates
                    </h1>
                    <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
                        View and track the status of candidates you have submitted for various roles.
                    </p>
                </div>
            </div>

            {error && (
                <div className="p-4 rounded-xl border border-destructive/50 bg-destructive/10 text-destructive text-sm font-medium">
                    {error}
                </div>
            )}

            {isLoading ? (
                <div className="flex flex-col items-center justify-center py-20 bg-neutral-50/50 dark:bg-slate-800/20 rounded-xl border border-neutral-200 dark:border-slate-700">
                    <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
                    <p className="text-sm text-neutral-500 font-medium">Loading submissions...</p>
                </div>
            ) : (
                <SubmittedJobsTable submissions={submissions} />
            )}
        </div>
    );
}
