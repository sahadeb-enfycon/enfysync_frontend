"use client";

import { useState } from "react";
import DefaultCardComponent from "@/app/(dashboard)/components/default-card-component";
import DashboardBreadcrumb from "@/components/layout/dashboard-breadcrumb";
import { DatePicker } from "@/components/shared/date-picker";
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
import { Textarea } from "@/components/ui/textarea";
import { LocationSelect } from "@/components/shared/location-select";

export default function AccountManagerCreateJobPage() {
    const [location, setLocation] = useState("");

    return (
        <>
            <DashboardBreadcrumb title="Post a New Job" text="Job Management" />
            <div className="p-6">
                <DefaultCardComponent title="Job Details">
                    <form className="flex flex-col gap-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="jobTitle" className="text-[#4b5563] dark:text-white mb-2">Job Title *</Label>
                                <Input type="text" id="jobTitle" className="border border-neutral-300 px-5 dark:border-slate-500 focus:border-primary dark:focus:border-primary focus-visible:border-primary h-12 rounded-lg !shadow-none !ring-0" placeholder="e.g. Senior Software Engineer" required />
                            </div>
                            <div>
                                <Label htmlFor="jobType" className="text-[#4b5563] dark:text-white mb-2">Job Type *</Label>
                                <Select required>
                                    <SelectTrigger className="border border-neutral-300 px-5 dark:border-slate-500 focus:border-primary dark:focus:border-primary focus-visible:border-primary h-12 rounded-lg !shadow-none !ring-0 w-full bg-transparent">
                                        <SelectValue placeholder="Select Job Type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="FULL_TIME">Full-Time</SelectItem>
                                        <SelectItem value="CONTRACT">Contract</SelectItem>
                                        <SelectItem value="PART_TIME">Part-Time</SelectItem>
                                        <SelectItem value="INTERNSHIP">Internship</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div>
                                <Label htmlFor="client" className="text-[#4b5563] dark:text-white mb-2">Client *</Label>
                                <Input type="text" id="client" className="border border-neutral-300 px-5 dark:border-slate-500 focus:border-primary dark:focus:border-primary focus-visible:border-primary h-12 rounded-lg !shadow-none !ring-0" placeholder="Primary Client (VMS/MSP)" required />
                            </div>
                            <div>
                                <Label htmlFor="endClient" className="text-[#4b5563] dark:text-white mb-2">End Client</Label>
                                <Input type="text" id="endClient" className="border border-neutral-300 px-5 dark:border-slate-500 focus:border-primary dark:focus:border-primary focus-visible:border-primary h-12 rounded-lg !shadow-none !ring-0" placeholder="End Client (Optional)" />
                            </div>

                            <div>
                                <Label htmlFor="location" className="text-[#4b5563] dark:text-white mb-2">Location *</Label>
                                <LocationSelect
                                    value={location}
                                    onChange={setLocation}
                                    placeholder="Select City or 'Remote'"
                                />
                                <input type="hidden" name="location" value={location} required />
                            </div>
                            <div>
                                <Label htmlFor="startDate" className="text-[#4b5563] dark:text-white mb-2">Start Date</Label>
                                <DatePicker />
                            </div>

                            <div>
                                <Label htmlFor="clientBillRate" className="text-[#4b5563] dark:text-white mb-2">Client Bill Rate ($/hr) *</Label>
                                <Input type="number" id="clientBillRate" min="0" step="0.01" className="border border-neutral-300 px-5 dark:border-slate-500 focus:border-primary dark:focus:border-primary focus-visible:border-primary h-12 rounded-lg !shadow-none !ring-0" placeholder="0.00" required />
                            </div>
                            <div>
                                <Label htmlFor="payRate" className="text-[#4b5563] dark:text-white mb-2">Pay Rate ($/hr) *</Label>
                                <Input type="number" id="payRate" min="0" step="0.01" className="border border-neutral-300 px-5 dark:border-slate-500 focus:border-primary dark:focus:border-primary focus-visible:border-primary h-12 rounded-lg !shadow-none !ring-0" placeholder="0.00" required />
                            </div>
                        </div>

                        <div>
                            <Label htmlFor="description" className="text-[#4b5563] dark:text-white mb-2">Job Description *</Label>
                            <Textarea id="description" className="border border-neutral-300 px-5 py-4 dark:border-slate-500 focus:border-primary dark:focus:border-primary focus-visible:border-primary min-h-[160px] rounded-lg !shadow-none !ring-0" placeholder="Detailed job description and requirements..." required />
                        </div>

                        <div className="flex justify-end gap-3 mt-4">
                            <Button type="button" variant="outline" className="h-12 px-8">Cancel</Button>
                            <Button type="submit" variant="default" className="h-12 px-8">Post Job</Button>
                        </div>
                    </form>
                </DefaultCardComponent>
            </div>
        </>
    );
}
