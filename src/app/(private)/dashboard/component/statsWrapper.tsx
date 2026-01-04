import { getDashboardStats } from "@/src/app/api/dashboard/stats";
import { StatsOverview } from "./statsOverview";

export async function StatsWrapper() {
  const result = await getDashboardStats();

  if (!result.success || !result.data) {
    return <p className="text-red-500">Failed to load stats</p>;
  }

  return (
    <StatsOverview
      totalStaff={result.data.totalStaff}
      totalSchedules={result.data.totalSchedules}
      activeSchedules={result.data.activeSchedules}
    />
  );
}
