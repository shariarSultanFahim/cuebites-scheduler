import { Skeleton } from "@/components/ui/skeleton"; // Assuming ShadCN
import { Suspense } from "react";
import StaffDataLayer from "./component/staffWrapper";

export default function Page() {
  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold">Staff Management</h1>

      <Suspense fallback={<StaffTableSkeleton />}>
        <StaffDataLayer />
      </Suspense>
    </div>
  );
}

function StaffTableSkeleton() {
  return (
    <div className="space-y-3">
      <Skeleton className="h-8 w-full" />
      <Skeleton className="h-20 w-full" />
      <Skeleton className="h-20 w-full" />
    </div>
  );
}
