"use client";

import { Calendar, Clock, Users } from "lucide-react";
import { StatsCard } from "./statsCard";

interface StatsOverviewProps {
  totalStaff: number;
  totalSchedules: number;
  activeSchedules: number;
}

export function StatsOverview({
  totalStaff,
  totalSchedules,
  activeSchedules,
}: StatsOverviewProps) {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      <StatsCard
        title="Total Staff"
        value={totalStaff}
        description="Active staff members"
        icon={Users}
      />
      <StatsCard
        title="Total Schedules"
        value={totalSchedules}
        description="All scheduled shifts"
        icon={Calendar}
      />
      <StatsCard
        title="Active Schedules"
        value={activeSchedules}
        description="Upcoming shifts"
        icon={Clock}
      />
    </div>
  );
}
