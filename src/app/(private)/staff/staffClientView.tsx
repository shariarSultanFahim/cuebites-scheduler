"use client";

import { Button } from "@/components/ui/button";
import { Staff } from "@/generated/prisma/client";
import { Loader2 } from "lucide-react";
import { useState, useTransition } from "react";
import { getStaffList } from "../../api/staff/list";
import { CreateStaff } from "./component/createStaff";
import { StaffTable } from "./component/staffTable";

export default function StaffClientView({
  initialStaff,
}: {
  initialStaff: Staff[];
}) {
  const [staff, setStaff] = useState(initialStaff);
  // useTransition tracks if a server action or re-fetch is in progress
  const [isPending, startTransition] = useTransition();

  const handleRefresh = () => {
    startTransition(async () => {
      const freshData = await getStaffList();
      setStaff(freshData);
    });
  };

  console.log("staff", staff);

  return (
    <div className={isPending ? "opacity-50 pointer-events-none" : ""}>
      <div className="flex justify-between mb-4">
        <div className="flex gap-2">
          <Button
            onClick={handleRefresh}
            disabled={isPending}
            variant="outline"
          >
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Refresh
          </Button>
          <CreateStaff onStaffCreated={handleRefresh} />
        </div>
      </div>

      <StaffTable data={staff} />
    </div>
  );
}
