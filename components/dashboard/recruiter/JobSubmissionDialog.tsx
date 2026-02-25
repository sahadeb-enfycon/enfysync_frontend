"use client";

import { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "react-hot-toast";

interface JobSubmissionDialogProps {
    isOpen: boolean;
    onClose: () => void;
    jobCode: string;
    recruiterId: string;
    token: string;
    onSuccess?: () => void;
}

export default function JobSubmissionDialog({
    isOpen,
    onClose,
    jobCode,
    recruiterId,
    token,
    onSuccess,
}: JobSubmissionDialogProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        candidateName: "",
        candidateEmail: "",
        candidatePhone: "",
        candidateCurrentLocation: "",
        remarks: "",
        recruiterComment: "",
    });

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const now = new Date().toISOString();
            const payload = {
                jobCode,
                recruiterId,
                candidateName: formData.candidateName,
                candidateEmail: formData.candidateEmail,
                candidatePhone: formData.candidatePhone,
                candidateCurrentLocation: formData.candidateCurrentLocation,
                submissionDate: now,
                l1Status: "PENDING",
                l1Date: now,
                l2Status: "PENDING",
                l2Date: now,
                l3Status: "PENDING",
                l3Date: now,
                finalStatus: "SUBMITTED",
                remarks: formData.remarks,
                recruiterComment: formData.recruiterComment,
            };

            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/recruiter-submissions`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(payload),
            });

            if (!res.ok) {
                const errorData = await res.json().catch(() => ({}));
                throw new Error(errorData.message || "Failed to submit candidate");
            }

            toast.success("Candidate submitted successfully");
            if (onSuccess) onSuccess();
            onClose();
            setFormData({
                candidateName: "",
                candidateEmail: "",
                candidatePhone: "",
                candidateCurrentLocation: "",
                remarks: "",
                recruiterComment: "",
            });
        } catch (error: any) {
            console.error("Submission error:", error);
            toast.error(error.message || "Failed to submit candidate");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Submit Candidate</DialogTitle>
                    <DialogDescription>
                        Submit a new candidate for job <span className="font-semibold text-primary">{jobCode}</span>.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label>Job Code</Label>
                        <Input value={jobCode} disabled className="bg-neutral-50 dark:bg-slate-800" />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="candidateName">Full Name <span className="text-destructive">*</span></Label>
                            <Input
                                id="candidateName"
                                name="candidateName"
                                value={formData.candidateName}
                                onChange={handleChange}
                                placeholder="John Doe"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="candidateEmail">Email <span className="text-destructive">*</span></Label>
                            <Input
                                id="candidateEmail"
                                name="candidateEmail"
                                type="email"
                                value={formData.candidateEmail}
                                onChange={handleChange}
                                placeholder="john.doe@example.com"
                                required
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="candidatePhone">Phone</Label>
                            <Input
                                id="candidatePhone"
                                name="candidatePhone"
                                value={formData.candidatePhone}
                                onChange={handleChange}
                                placeholder="+1-234-567-8900"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="candidateCurrentLocation">Location</Label>
                            <Input
                                id="candidateCurrentLocation"
                                name="candidateCurrentLocation"
                                value={formData.candidateCurrentLocation}
                                onChange={handleChange}
                                placeholder="New York, NY"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="remarks">Remarks</Label>
                        <Textarea
                            id="remarks"
                            name="remarks"
                            value={formData.remarks}
                            onChange={handleChange}
                            placeholder="Candidate has strong technical skills."
                            rows={2}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="recruiterComment">Recruiter Comment</Label>
                        <Textarea
                            id="recruiterComment"
                            name="recruiterComment"
                            value={formData.recruiterComment}
                            onChange={handleChange}
                            placeholder="Available to join immediately..."
                            rows={2}
                        />
                    </div>

                    <DialogFooter className="pt-4">
                        <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting ? "Submitting..." : "Submit Candidate"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
