import DashboardBreadcrumb from "@/components/layout/dashboard-breadcrumb";
import { auth } from "@/auth";
import PodsTable from "@/components/dashboard/delivery-head/PodsTable";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";
import { serverApiClient } from "@/lib/serverApiClient";

export const dynamic = 'force-dynamic';

async function getPods() {
    try {
        const response = await serverApiClient("/pods/my-pods", {
            cache: 'no-store',
        });

        if (!response.ok) {
            console.error("Failed to fetch pods. Status:", response.status);
            return [];
        }

        return response.json();
    } catch (error) {
        console.error("Error fetching pods:", error);
        return [];
    }
}

export default async function DeliveryHeadPodsPage() {
    const pods = await getPods();

    return (
        <>
            <DashboardBreadcrumb title="All Pods" text="Pods" />
            <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <p className="text-muted-foreground italic text-sm">Managing recruitment pods and assigning team leaders.</p>
                    </div>
                    <Button asChild className="h-10 px-4 bg-primary hover:bg-primary/90">
                        <Link href="/delivery-head/dashboard/pods/create">
                            <Plus className="h-4 w-4 mr-2" />
                            Create New Pod
                        </Link>
                    </Button>
                </div>

                <PodsTable pods={pods} />
            </div>
        </>
    );
}
