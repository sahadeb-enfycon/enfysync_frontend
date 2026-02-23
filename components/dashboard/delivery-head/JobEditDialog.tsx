"use client";

import * as React from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { toast } from "react-hot-toast";
import { useSession } from "next-auth/react";
import { Textarea } from "@/components/ui/textarea";

interface Job {
    id: string;
    jobTitle: string;
    jobCode: string;
    jobLocation: string;
    visaType?: string;
    clientBillRate: string;
    payRate: string;
    clientName: string;
    endClientName: string;
    noOfPositions: number;
    submissionRequired: number;
    urgency: string;
    status: string;
    podId?: string | null;
    accountManagerId: string;
    description: string;
}

interface Pod {
    id: string;
    name: string;
}

interface JobEditDialogProps {
    job: Job | null;
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export default function JobEditDialog({ job, isOpen, onClose, onSuccess }: JobEditDialogProps) {
    const { data: session } = useSession();
    const [isSubmitting, setIsSubmitting] = React.useState(false);
    const [isLoading, setIsLoading] = React.useState(false);
    const [pods, setPods] = React.useState<Pod[]>([]);
    const [formData, setFormData] = React.useState<Partial<Job>>({});

    const token = (session as any)?.user?.accessToken;

    const fetchJobDetails = React.useCallback(async () => {
        if (!job || !token) return;
        setIsLoading(true);
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/jobs/${job.id}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (response.ok) {
                const fullJob = await response.json();
                setFormData({
                    jobTitle: fullJob.jobTitle,
                    jobLocation: fullJob.jobLocation,
                    visaType: fullJob.visaType,
                    clientBillRate: fullJob.clientBillRate,
                    payRate: fullJob.payRate,
                    clientName: fullJob.clientName,
                    endClientName: fullJob.endClientName,
                    noOfPositions: fullJob.noOfPositions,
                    submissionRequired: fullJob.submissionRequired,
                    urgency: fullJob.urgency,
                    status: fullJob.status,
                    podId: fullJob.podId || "unassigned",
                    accountManagerId: fullJob.accountManagerId,
                    description: fullJob.description || "",
                });
            } else {
                toast.error("Failed to fetch job details");
            }
        } catch (error) {
            console.error("Error fetching job details:", error);
            toast.error("Error loading job details");
        } finally {
            setIsLoading(false);
        }
    }, [job, token]);

    React.useEffect(() => {
        if (isOpen && job) {
            fetchJobDetails();
        } else {
            setFormData({});
        }
    }, [isOpen, job, fetchJobDetails]);

    React.useEffect(() => {
        const fetchPods = async () => {
            if (!token) return;
            try {
                const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/pods/my-pods`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                if (response.ok) {
                    const data = await response.json();
                    setPods(data);
                }
            } catch (error) {
                console.error("Error fetching pods:", error);
            }
        };

        if (isOpen) {
            fetchPods();
        }
    }, [isOpen, token]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!job || !token) return;

        setIsSubmitting(true);
        try {
            const { accountManagerId, jobCode, podId, description, ...sanitizedData } = formData;

            const patchData: any = {
                ...sanitizedData,
                noOfPositions: Number(formData.noOfPositions) || 0,
                submissionRequired: Number(formData.submissionRequired) || 0,
            };

            // Handle pod relation in a Prisma-compatible way if podId is present
            if (formData.podId) {
                if (formData.podId === "unassigned") {
                    patchData.pod = { disconnect: true };
                } else {
                    patchData.pod = { connect: { id: formData.podId } };
                }
            }

            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/jobs/${job.id}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(patchData),
            });

            if (response.ok) {
                toast.success("Job updated successfully");
                onSuccess();
                onClose();
            } else {
                const error = await response.json();
                toast.error(error.message || "Failed to update job");
            }
        } catch (error) {
            console.error("Error updating job:", error);
            toast.error("An error occurred while updating the job");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!job) return null;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Edit Job: {job.jobCode}</DialogTitle>
                    <DialogDescription>
                        Update job details and assign to a pod.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 py-4 relative">
                    {isLoading && (
                        <div className="absolute inset-0 bg-white/50 dark:bg-slate-900/50 flex items-center justify-center z-10 rounded-lg">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                        </div>
                    )}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="jobTitle">Job Title</Label>
                            <Input
                                id="jobTitle"
                                value={formData.jobTitle || ""}
                                onChange={(e) => setFormData({ ...formData, jobTitle: e.target.value })}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="podId">Assigned Pod</Label>
                            <Select
                                value={formData.podId || "unassigned"}
                                onValueChange={(value) => setFormData({ ...formData, podId: value })}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a pod" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="unassigned">Unassigned</SelectItem>
                                    {pods.map((pod) => (
                                        <SelectItem key={pod.id} value={pod.id}>
                                            {pod.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="clientName">Client Name</Label>
                            <Input
                                id="clientName"
                                value={formData.clientName || ""}
                                onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="endClientName">End Client</Label>
                            <Input
                                id="endClientName"
                                value={formData.endClientName || ""}
                                onChange={(e) => setFormData({ ...formData, endClientName: e.target.value })}
                                required
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="jobLocation">Location</Label>
                            <Input
                                id="jobLocation"
                                value={formData.jobLocation || ""}
                                onChange={(e) => setFormData({ ...formData, jobLocation: e.target.value })}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="visaType">Visa Type</Label>
                            <Select
                                value={formData.visaType || ""}
                                onValueChange={(value) => setFormData({ ...formData, visaType: value })}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select Visa Type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="H1B">H1B</SelectItem>
                                    <SelectItem value="GC">Green Card (GC)</SelectItem>
                                    <SelectItem value="US_CITIZEN">US Citizen</SelectItem>
                                    <SelectItem value="OPT">OPT/CPT</SelectItem>
                                    <SelectItem value="EAD">EAD</SelectItem>
                                    <SelectItem value="TN">TN Visa</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>


                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="clientBillRate">Client Bill Rate</Label>
                            <Input
                                id="clientBillRate"
                                value={formData.clientBillRate || ""}
                                onChange={(e) => setFormData({ ...formData, clientBillRate: e.target.value })}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="payRate">Pay Rate</Label>
                            <Input
                                id="payRate"
                                value={formData.payRate || ""}
                                onChange={(e) => setFormData({ ...formData, payRate: e.target.value })}
                                required
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="noOfPositions">No of Positions</Label>
                            <Input
                                id="noOfPositions"
                                type="number"
                                value={formData.noOfPositions || 0}
                                onChange={(e) => setFormData({ ...formData, noOfPositions: parseInt(e.target.value) })}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="submissionRequired">Submissions Required</Label>
                            <Input
                                id="submissionRequired"
                                type="number"
                                value={formData.submissionRequired || 0}
                                onChange={(e) => setFormData({ ...formData, submissionRequired: parseInt(e.target.value) })}
                                required
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="urgency">Urgency</Label>
                            <Select
                                value={formData.urgency || "MEDIUM"}
                                onValueChange={(value) => setFormData({ ...formData, urgency: value })}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select urgency" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="LOW">Low</SelectItem>
                                    <SelectItem value="MEDIUM">Medium</SelectItem>
                                    <SelectItem value="HIGH">High</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="status">Status</Label>
                            <Select
                                value={formData.status || "ACTIVE"}
                                onValueChange={(value) => setFormData({ ...formData, status: value })}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="ACTIVE">Active</SelectItem>
                                    <SelectItem value="ON_HOLD">On Hold</SelectItem>
                                    <SelectItem value="HOLD_BY_CLIENT">Hold By Client</SelectItem>
                                    <SelectItem value="FILLED">Filled</SelectItem>
                                    <SelectItem value="CLOSED">Closed</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>


                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting ? "Saving..." : "Save Changes"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
