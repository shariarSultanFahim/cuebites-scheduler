import { Skeleton } from "@/components/ui/skeleton";
import { Suspense } from "react";
import { QuickActions } from "./component/quickActions";
import { RecentActivity } from "./component/recentActivity";
import { StatsWrapper } from "./component/statsWrapper";

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground mt-2">
          Welcome back! Here&apos;s your schedule overview.
        </p>
      </div>

      <Suspense fallback={<StatsSkeleton />}>
        <StatsWrapper />
      </Suspense>

      <div className="grid gap-4 md:grid-cols-2">
        <Suspense fallback={<Skeleton className="h-75" />}>
          <RecentActivity />
        </Suspense>
        <QuickActions />
      </div>
    </div>
  );
}

function StatsSkeleton() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <Skeleton className="h-32 w-full" />
      <Skeleton className="h-32 w-full" />
      <Skeleton className="h-32 w-full" />
    </div>
  );
}
