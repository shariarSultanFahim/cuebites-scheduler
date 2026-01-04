import { getDashboardStats } from "../../api/dashboard/stats";
import { QuickActions } from "./component/quickActions";
import { RecentActivity } from "./component/recentActivity";
import { StatsOverview } from "./component/statsOverview";

export default async function DashboardPage() {
  const result = await getDashboardStats();

  if (!result.success) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-muted-foreground">Failed to load dashboard stats</p>
      </div>
    );
  }

  const { totalStaff, totalSchedules, activeSchedules } = result.data!;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground mt-2">
          Welcome back! Here&apos;s your schedule overview.
        </p>
      </div>

      {/* Stats Overview */}
      <StatsOverview
        totalStaff={totalStaff}
        totalSchedules={totalSchedules}
        activeSchedules={activeSchedules}
      />

      {/* Bottom Section */}
      <div className="grid gap-4 md:grid-cols-2">
        <RecentActivity />
        <QuickActions />
      </div>
    </div>
  );
}
