"use client";

import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/empty";
import { Input } from "@/components/ui/input";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Staff } from "@/generated/prisma/client";
import { StaffStatus } from "@/generated/prisma/enums";
import { useDebounce } from "@/hooks/use-debounce";
import { Layout, LayoutGrid, Search } from "lucide-react";
import { useEffect, useState, useTransition } from "react";
import { getStaffList } from "../../api/staff/list";
import { CreateStaff } from "./component/createStaff";
import StaffGrid from "./component/staffGrid";
import { StaffTable } from "./component/staffTable";

const STAFF_STATUS_FILTERS = [
  { label: "Current Staff", value: undefined, key: "current" },
  { label: "Active", value: "ACTIVE" as StaffStatus, key: "active" },
  {
    label: "Onboarding",
    value: "ONBOARDING" as StaffStatus,
    key: "onboarding",
  },
  {
    label: "Terminated",
    value: "TERMINATED" as StaffStatus,
    key: "terminated",
  },
  { label: "All Staff", value: "ALL", key: "all" },
];

export default function StaffClientView({
  initialStaff,
}: {
  initialStaff: Staff[];
}) {
  const [staff, setStaff] = useState(initialStaff);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string | undefined>(
    undefined
  );
  const [viewMode, setViewMode] = useState<"table" | "grid">("grid");
  const [isPending, startTransition] = useTransition();

  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  useEffect(() => {
    startTransition(async () => {
      let status: StaffStatus | undefined = undefined;
      if (selectedStatus && selectedStatus !== "ALL") {
        status = selectedStatus as StaffStatus;
      }
      const freshData = await getStaffList(
        debouncedSearchQuery || undefined,
        status
      );
      setStaff(freshData);
    });
  }, [debouncedSearchQuery, selectedStatus]);

  const handleStatusFilter = (statusValue: string | undefined) => {
    setSelectedStatus(statusValue);
  };

  const handleRefresh = () => {
    setSearchQuery("");
    setSelectedStatus(undefined);
    startTransition(async () => {
      const freshData = await getStaffList();
      setStaff(freshData);
    });
  };

  return (
    <div>
      <div className="mb-6">
        {/* Top Bar */}
        <div className="flex flex-col items-start lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex flex-col items-start lg:flex-row gap-4 justify-center lg:items-center">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                disabled={isPending}
                className="pl-10 w-full"
              />
            </div>

            {/* View Toggle */}
            <div className="flex items-center gap-1 border rounded-md p-1">
              <Button
                size="sm"
                variant={viewMode === "table" ? "default" : "ghost"}
                onClick={() => setViewMode("table")}
                className="h-8 w-8 p-0"
              >
                <Layout className="h-4 w-4" />
              </Button>
              <Button
                size="sm"
                variant={viewMode === "grid" ? "default" : "ghost"}
                onClick={() => setViewMode("grid")}
                className="h-8 w-8 p-0"
              >
                <LayoutGrid className="h-4 w-4" />
              </Button>
            </div>

            {/* Status Filter Tabs */}
            <ToggleGroup
              type="single"
              value={selectedStatus || "CURRENT"}
              onValueChange={(value) => handleStatusFilter(value || undefined)}
              disabled={isPending}
            >
              {STAFF_STATUS_FILTERS.map((filter) => (
                <ToggleGroupItem
                  key={filter.key}
                  value={filter.value || ""}
                  aria-label={filter.label}
                  className={`${
                    selectedStatus === filter.value
                      ? "text-black border border-black bg-white"
                      : "text-gray-500 bg-gray-200/50"
                  }`}
                >
                  {filter.label}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
          </div>

          <CreateStaff onStaffCreated={handleRefresh} />
        </div>
      </div>

      {!staff || staff.length === 0 ? (
        <Empty className="border border-dashed">
          <EmptyHeader>
            <EmptyTitle>Empty Staff List</EmptyTitle>
            <EmptyDescription>
              No staff members found. Start by creating staff profiles.
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <CreateStaff onStaffCreated={handleRefresh} />
          </EmptyContent>
        </Empty>
      ) : (
        <>
          {viewMode === "table" && <StaffTable data={staff} />}
          {viewMode === "grid" && <StaffGrid staffList={staff} />}
        </>
      )}
    </div>
  );
}
