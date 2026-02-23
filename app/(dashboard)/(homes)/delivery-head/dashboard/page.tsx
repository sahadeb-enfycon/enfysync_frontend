import DashboardBreadcrumb from "@/components/layout/dashboard-breadcrumb";
import { auth } from "@/auth";

export default async function DeliveryHeadDashboard() {
    const session = await auth();
    const userName = session?.user?.name || "Delivery Head";

    const hour = new Date().getHours();
    let greeting = "Good Evening";
    if (hour < 12) greeting = "Good Morning";
    else if (hour < 18) greeting = "Good Afternoon";

    const welcomeMessage = `${greeting}, ${userName}!`;

    return (
        <>
            <DashboardBreadcrumb title={welcomeMessage} text="Dashboard" />
            <div className="p-6">
                <h1 className="text-2xl font-bold">Welcome, Delivery Head</h1>
                <p className="mt-2 text-muted-foreground">This is your dedicated dashboard view.</p>
            </div>
        </>
    );
}
