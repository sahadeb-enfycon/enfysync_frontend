"use client";

import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { House } from 'lucide-react';
import { useSession } from "next-auth/react";


interface BreadcrumbData {
    title: string,
    text: string,
}

const ROLE_LABELS: Record<string, string> = {
    ADMIN: "Admin",
    DELIVERY_HEAD: "Delivery Head",
    "DELIVERY-HEAD": "Delivery Head",
    POD_LEAD: "Pod Lead",
    "POD-LEAD": "Pod Lead",
    ACCOUNT_MANAGER: "Account Manager",
    "ACCOUNT-MANAGER": "Account Manager",
    RECRUITER: "Recruiter",
};

/** Normalise a raw role string to its canonical upper-snake form. */
const normalise = (role: string) => role.toUpperCase().replace(/-/g, "_");

const DashboardBreadcrumb = ({ title, text }: BreadcrumbData) => {
    const { data: session } = useSession();
    const rawRoles: string[] = (session?.user as any)?.roles || [];

    const normalisedRoles = rawRoles.map(normalise);

    // Special case: Pod Lead who is also a Recruiter
    const isPodLeadRecruiter =
        normalisedRoles.includes("POD_LEAD") &&
        normalisedRoles.includes("RECRUITER");

    let roleLabel: string;
    if (isPodLeadRecruiter) {
        roleLabel = "Pod Lead ";
    } else {
        const validRoles = Object.keys(ROLE_LABELS);
        const primaryRole =
            normalisedRoles.find((r) => validRoles.includes(r)) ?? "ADMIN";
        roleLabel = ROLE_LABELS[primaryRole] ?? "Admin";
    }

    return (
        <div className='flex flex-wrap items-center justify-between gap-2 mb-6'>
            <h6 className="text-2xl font-semibold">{title}</h6>
            <Breadcrumb>
                <BreadcrumbList>
                    {/* Role root crumb */}
                    <BreadcrumbItem>
                        <BreadcrumbLink
                            href='/'
                            className='flex items-center gap-2 font-medium text-base text-neutral-600 hover:text-primary dark:text-white dark:hover:text-primary'
                        >
                            <House size={16} />
                            {roleLabel}
                        </BreadcrumbLink>
                    </BreadcrumbItem>

                    <BreadcrumbSeparator />

                    {/* Dashboard crumb */}
                    <BreadcrumbItem>
                        <BreadcrumbLink
                            href='/'
                            className='font-medium text-base text-neutral-600 hover:text-primary dark:text-white dark:hover:text-primary'
                        >
                            Dashboard
                        </BreadcrumbLink>
                    </BreadcrumbItem>

                    <BreadcrumbSeparator />

                    {/* Current page crumb */}
                    <BreadcrumbItem className="text-base">
                        <BreadcrumbPage>{text}</BreadcrumbPage>
                    </BreadcrumbItem>
                </BreadcrumbList>
            </Breadcrumb>
        </div>
    );
};

export default DashboardBreadcrumb;