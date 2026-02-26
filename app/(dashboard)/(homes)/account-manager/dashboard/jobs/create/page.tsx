"use client";

import { useState } from "react";
import DefaultCardComponent from "@/app/(dashboard)/components/default-card-component";
import DashboardBreadcrumb from "@/components/layout/dashboard-breadcrumb";
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
import { LocationSelect } from "@/components/shared/location-select";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import { apiClient } from "@/lib/apiClient";

export default function AccountManagerCreateJobPage() {
    const { data: session } = useSession();
    const router = useRouter();
    const [location, setLocation] = useState("remote"); // Default to Remote as per user request example
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsSubmitting(true);

        const formData = new FormData(e.currentTarget);
        const data = Object.fromEntries(formData.entries());
        // NOTE: Job description is temporarily disabled.
        // Uncomment when needed:
        // const cleanedDescription = sanitizeRichHtml(descriptionHtml);

        // Prepare the payload according to the requested JSON body
        const payload = {
            jobTitle: data.jobTitle,
            jobLocation: data.jobLocation,
            visaType: data.visaType,
            clientBillRate: data.clientBillRate,
            payRate: data.payRate,
            clientName: data.clientName,
            endClientName: data.endClientName,
            noOfPositions: parseInt(data.noOfPositions as string, 10),
            submissionRequired: parseInt(data.submissionRequired as string, 10),
            urgency: data.urgency,
            accountManagerId: session?.user?.id || "",
            status: "ACTIVE",
            isDeleted: false,
            podId: "", // Added as per requested body
            // description: cleanedDescription,
        };

        try {
            const response = await apiClient("/jobs", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(payload)
            });

            if (response.ok) {
                toast.success("Job posted successfully!");
                router.push("/account-manager/dashboard/jobs");
                router.refresh();
            } else {
                const errorData = await response.json();
                toast.error(errorData.message || "Failed to post job.");
            }
        } catch (error) {
            console.error("Error posting job:", error);
            toast.error("An error occurred while posting the job.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <>
            <DashboardBreadcrumb title="Post a New Job" text="Job Management" />
            <div className="p-6">
                <DefaultCardComponent title="Job Details">
                    <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="jobTitle" className="text-[#4b5563] dark:text-white mb-2">Job Title *</Label>
                                <Input type="text" id="jobTitle" name="jobTitle" className="border border-neutral-300 px-5 dark:border-slate-500 focus:border-primary dark:focus:border-primary focus-visible:border-primary h-12 rounded-lg !shadow-none !ring-0" placeholder="e.g. Senior React Developer" required />
                            </div>

                            <div>
                                <Label htmlFor="visaType" className="text-[#4b5563] dark:text-white mb-2">Visa Type *</Label>
                                <Select name="visaType" required>
                                    <SelectTrigger className="border border-neutral-300 px-5 dark:border-slate-500 focus:border-primary dark:focus:border-primary focus-visible:border-primary !h-12 rounded-lg !shadow-none !ring-0 w-full bg-transparent text-left">
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

                            <div>
                                <Label htmlFor="clientName" className="text-[#4b5563] dark:text-white mb-2">Client Name *</Label>
                                <Input type="text" id="clientName" name="clientName" className="border border-neutral-300 px-5 dark:border-slate-500 focus:border-primary dark:focus:border-primary focus-visible:border-primary h-12 rounded-lg !shadow-none !ring-0" placeholder="e.g. Tech Corp" required />
                            </div>
                            <div>
                                <Label htmlFor="endClientName" className="text-[#4b5563] dark:text-white mb-2">End Client Name</Label>
                                <Input type="text" id="endClientName" name="endClientName" className="border border-neutral-300 px-5 dark:border-slate-500 focus:border-primary dark:focus:border-primary focus-visible:border-primary h-12 rounded-lg !shadow-none !ring-0" placeholder="e.g. FinTrust Bank" />
                            </div>

                            <div>
                                <Label htmlFor="location" className="text-[#4b5563] dark:text-white mb-2">Job Location *</Label>
                                <LocationSelect
                                    value={location}
                                    onChange={setLocation}
                                    placeholder="Select City or 'Remote'"
                                />
                                <input type="hidden" name="jobLocation" value={location} required />
                            </div>

                            <div>
                                <Label htmlFor="urgency" className="text-[#4b5563] dark:text-white mb-2">Urgency *</Label>
                                <Select name="urgency" required>
                                    <SelectTrigger className="border border-neutral-300 px-5 dark:border-slate-500 focus:border-primary dark:focus:border-primary focus-visible:border-primary !h-12 rounded-lg !shadow-none !ring-0 w-full bg-transparent text-left">
                                        <SelectValue placeholder="Select Urgency" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="HIGH">High</SelectItem>
                                        <SelectItem value="MEDIUM">Medium</SelectItem>
                                        <SelectItem value="LOW">Low</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div>
                                <Label htmlFor="clientBillRate" className="text-[#4b5563] dark:text-white mb-2">Client Bill Rate ($/hr) *</Label>
                                <Input type="text" id="clientBillRate" name="clientBillRate" className="border border-neutral-300 px-5 dark:border-slate-500 focus:border-primary dark:focus:border-primary focus-visible:border-primary h-12 rounded-lg !shadow-none !ring-0" placeholder="e.g. 60/hr" required />
                            </div>
                            <div>
                                <Label htmlFor="payRate" className="text-[#4b5563] dark:text-white mb-2">Pay Rate ($/hr) *</Label>
                                <Input type="text" id="payRate" name="payRate" className="border border-neutral-300 px-5 dark:border-slate-500 focus:border-primary dark:focus:border-primary focus-visible:border-primary h-12 rounded-lg !shadow-none !ring-0" placeholder="e.g. 50/hr" required />
                            </div>

                            <div>
                                <Label htmlFor="noOfPositions" className="text-[#4b5563] dark:text-white mb-2">Number of Positions *</Label>
                                <Input type="number" id="noOfPositions" name="noOfPositions" min="1" className="border border-neutral-300 px-5 dark:border-slate-500 focus:border-primary dark:focus:border-primary focus-visible:border-primary h-12 rounded-lg !shadow-none !ring-0" placeholder="e.g. 2" required />
                            </div>
                            <div>
                                <Label htmlFor="submissionRequired" className="text-[#4b5563] dark:text-white mb-2">Submission Required *</Label>
                                <Input type="number" id="submissionRequired" name="submissionRequired" min="1" className="border border-neutral-300 px-5 dark:border-slate-500 focus:border-primary dark:focus:border-primary focus-visible:border-primary h-12 rounded-lg !shadow-none !ring-0" placeholder="e.g. 1" required />
                            </div>
                        </div>

                        {/* NOTE: Job Description is temporarily hidden.
                            Uncomment this block to restore Rich Text description input.
                        
                        <div>
                            <Label className="text-[#4b5563] dark:text-white mb-2">Job Description</Label>
                            <RichTextEditor
                                value={descriptionHtml}
                                onChange={setDescriptionHtml}
                                placeholder="Add role summary, responsibilities, must-have skills, and interview process..."
                            />
                        </div>
                        */}

                        <div className="flex justify-end gap-3 mt-4">
                            <Button type="button" variant="outline" className="h-12 px-8" onClick={() => router.back()} disabled={isSubmitting}>Cancel</Button>
                            <Button type="submit" variant="default" className="h-12 px-8" disabled={isSubmitting}>
                                {isSubmitting ? "Posting..." : "Post Job"}
                            </Button>
                        </div>
                    </form>
                </DefaultCardComponent>
            </div>
        </>
    );
}
