import DashboardBreadcrumb from "@/components/layout/dashboard-breadcrumb";

export default function PodLeadDashboard() {
    return (
        <>
            <DashboardBreadcrumb title="Pod Lead Dashboard" text="Dashboard" />
            <div className="p-6">
                <h1 className="text-2xl font-bold">Welcome, Pod Lead</h1>
                <p className="mt-2 text-muted-foreground">This is your dedicated dashboard view.</p>
            </div>
        </>
    );
}
