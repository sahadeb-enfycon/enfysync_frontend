"use client"

import * as React from "react";
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
import { Textarea } from "@/components/ui/textarea";
import { MultiSelect, Option } from "@/components/shared/multi-select";

const RECRUITER_OPTIONS: Option[] = [
    { label: "Alice Smith", value: "alice_smith" },
    { label: "Bob Johnson", value: "bob_johnson" },
    { label: "Charlie Davis", value: "charlie_davis" },
    { label: "Diana Prince", value: "diana_prince" },
    { label: "Evan Wright", value: "evan_wright" },
];

export default function DeliveryHeadCreatePodPage() {
    const [selectedRecruiters, setSelectedRecruiters] = React.useState<string[]>([]);

    return (
        <>
            <DashboardBreadcrumb title="Create a New Pod" text="Pod Management" />
            <div className="p-6">
                <DefaultCardComponent title="Pod Details">
                    <form className="flex flex-col gap-4">
                        <div className="flex flex-col gap-6">
                            <div>
                                <Label htmlFor="podName" className="text-[#4b5563] dark:text-white mb-2">Pod Name *</Label>
                                <Input type="text" id="podName" className="border border-neutral-300 px-5 dark:border-slate-500 focus:border-primary dark:focus:border-primary focus-visible:border-primary h-12 rounded-lg !shadow-none !ring-0 w-full" placeholder="e.g. Engineering Pod Alpha" required />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="podLead" className="text-[#4b5563] dark:text-white mb-2">Assign Pod Lead *</Label>
                                    <Select required>
                                        <SelectTrigger className="border border-neutral-300 px-5 dark:border-slate-500 focus:border-primary dark:focus:border-primary focus-visible:border-primary !h-12 rounded-lg !shadow-none !ring-0 w-full bg-transparent text-left">
                                            <SelectValue placeholder="Select a Pod Lead" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="lead1">Sarah Jenkins</SelectItem>
                                            <SelectItem value="lead2">Michael Chan</SelectItem>
                                            <SelectItem value="lead3">David O'Connor</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div>
                                    <Label className="text-[#4b5563] dark:text-white mb-2 block">Assign Recruiters</Label>
                                    <MultiSelect
                                        options={RECRUITER_OPTIONS}
                                        selected={selectedRecruiters}
                                        onChange={setSelectedRecruiters}
                                        placeholder="Select recruiter(s)..."
                                    />
                                    <p className="text-xs text-neutral-500 mt-2">Select one or more recruiters to join this pod.</p>
                                </div>
                            </div>
                        </div>

                        <div className="mt-4">
                            <Label htmlFor="description" className="text-[#4b5563] dark:text-white mb-2">Pod Description</Label>
                            <Textarea id="description" className="border border-neutral-300 px-5 py-4 dark:border-slate-500 focus:border-primary dark:focus:border-primary focus-visible:border-primary min-h-[120px] rounded-lg !shadow-none !ring-0" placeholder="Optional details about this pod's focus or goals..." />
                        </div>

                        <div className="flex justify-end gap-3 mt-4">
                            <Button type="button" variant="outline" className="h-12 px-8">Cancel</Button>
                            <Button type="submit" variant="default" className="h-12 px-8">Create Pod</Button>
                        </div>
                    </form>
                </DefaultCardComponent>
            </div>
        </>
    );
}
