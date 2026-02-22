import DashboardBreadcrumb from "@/components/layout/dashboard-breadcrumb";

export default function AccountManagerDashboard() {
    return (
        <>
            <DashboardBreadcrumb title="Account Manager Dashboard" text="Dashboard" />
            <div className="p-6">
                <h1 className="text-2xl font-bold">Welcome, Account Manager</h1>
                <p className="mt-2 text-muted-foreground">This is your dedicated dashboard view.</p>
            </div>
        </>
    );
}
