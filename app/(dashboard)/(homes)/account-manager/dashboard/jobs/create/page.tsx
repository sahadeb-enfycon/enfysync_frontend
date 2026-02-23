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
    const [location, setLocation] = useState("remote"); // Default to Remote as per user request example

    return (
        <>
            <DashboardBreadcrumb title="Post a New Job" text="Job Management" />
            <div className="p-6">
                <DefaultCardComponent title="Job Details">
                    <form className="flex flex-col gap-4">
                        {/* Background Hidden Fields */}
                        <input type="hidden" name="accountManagerId" value="38def2f5-4780-4378-9116-54e30289cc05" />
                        <input type="hidden" name="status" value="ACTIVE" />
                        <input type="hidden" name="isDeleted" value="false" />

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

                        <div>
                            <Label htmlFor="description" className="text-[#4b5563] dark:text-white mb-2">Job Description *</Label>
                            <Textarea id="description" name="description" className="border border-neutral-300 px-5 py-4 dark:border-slate-500 focus:border-primary dark:focus:border-primary focus-visible:border-primary min-h-[160px] rounded-lg !shadow-none !ring-0" placeholder="Detailed job description and requirements..." required />
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
