import { getDashboardStats } from "@/src/app/api/dashboard/stats";
import { StatsOverview } from "./statsOverview";

export async function StatsWrapper() {
  const result = await getDashboardStats();

  const data = result.success && result.data ? result.data : {
    totalStaff: 0,
    totalSchedules: 0,
    activeSchedules: 0,
  };

  return (
    <StatsOverview
      totalStaff={data.totalStaff}
      totalSchedules={data.totalSchedules}
      activeSchedules={data.activeSchedules}
    />
  );
}
