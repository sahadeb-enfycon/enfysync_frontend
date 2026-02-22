import DashboardBreadcrumb from "@/components/layout/dashboard-breadcrumb";

export default function RecruiterDashboard() {
    return (
        <>
            <DashboardBreadcrumb title="Recruiter Dashboard" text="Dashboard" />
            <div className="p-6">
                <h1 className="text-2xl font-bold">Welcome, Recruiter</h1>
                <p className="mt-2 text-muted-foreground">This is your dedicated dashboard view.</p>
            </div>
        </>
    );
}
