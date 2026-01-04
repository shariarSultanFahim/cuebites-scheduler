"use client";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/empty";
import { Input } from "@/components/ui/input";
import { useDebounce } from "@/hooks/use-debounce";
import {
  addWeeks,
  endOfMonth,
  endOfWeek,
  format,
  startOfMonth,
  startOfWeek,
  subWeeks,
} from "date-fns";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { getScheduleList } from "../../api/schedule/list";
import { getStaffList } from "../../api/staff/list";
import CreateScheduleModal from "./component/createScheduleModal";
import MonthlyView from "./component/monthlyView";
import WeeklyView from "./component/weeklyView";

interface Staff {
  id: number;
  full_name: string;
}

interface Schedule {
  id: number;
  startTime: string | Date;
  endTime: string | Date;
  workAddress: string;
  staffId: number;
  staff: Staff;
  shiftBonus?: number | null;
  instruction?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export default function SchedulerPage() {
  const [viewMode, setViewMode] = useState<"weekly" | "monthly">("weekly");
  const [currentDate, setCurrentDate] = useState(new Date(2026, 0, 4));
  const [staffList, setStaffList] = useState<Staff[]>([]);
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearchQuery = useDebounce(searchQuery, 300);
  const [showCalendarModal, setShowCalendarModal] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      const staff = await getStaffList();
      setStaffList(staff);
    };
    loadData();
  }, [currentDate]);

  useEffect(() => {
    const loadSchedules = async () => {
      const rangeStart =
        viewMode === "weekly"
          ? startOfWeek(currentDate, { weekStartsOn: 0 })
          : startOfMonth(currentDate);
      const rangeEnd =
        viewMode === "weekly"
          ? endOfWeek(currentDate, { weekStartsOn: 0 })
          : endOfMonth(currentDate);

      const scheduleData = await getScheduleList({
        startTime: rangeStart,
        endTime: rangeEnd,
      });

      const formattedData = scheduleData.map((schedule) => ({
        ...schedule,
        startTime:
          schedule.startTime instanceof Date
            ? schedule.startTime.toISOString()
            : String(schedule.startTime),
        endTime:
          schedule.endTime instanceof Date
            ? schedule.endTime.toISOString()
            : String(schedule.endTime),
      }));

      setSchedules(formattedData as Schedule[]);
    };

    loadSchedules();
  }, [currentDate, viewMode]);

  const filteredSchedules =
    debouncedSearchQuery.trim() === ""
      ? schedules
      : schedules.filter((schedule) => {
          const query = debouncedSearchQuery.toLowerCase();
          return (
            schedule.staff.full_name.toLowerCase().includes(query) ||
            schedule.workAddress.toLowerCase().includes(query)
          );
        });

  const filteredStaffList =
    debouncedSearchQuery.trim() === ""
      ? staffList
      : staffList.filter((staff) => {
          const query = debouncedSearchQuery.toLowerCase();
          const staffHasMatchingSchedules = filteredSchedules.some(
            (schedule) => schedule.staffId === staff.id
          );
          return (
            staff.full_name.toLowerCase().includes(query) ||
            staffHasMatchingSchedules
          );
        });

  const weekStart = startOfWeek(currentDate, { weekStartsOn: 0 });
  const weekEnd = endOfWeek(currentDate, { weekStartsOn: 0 });

  const handlePreviousWeek = () => {
    setCurrentDate(subWeeks(currentDate, 1));
  };

  const handleNextWeek = () => {
    setCurrentDate(addWeeks(currentDate, 1));
  };

  const handleDateSelect = (date: Date | undefined) => {
    if (!date) return;
    setCurrentDate(date);
    setShowCalendarModal(false);
  };

  const handleScheduleCreated = async () => {
    const weekStart = startOfWeek(currentDate, { weekStartsOn: 0 });
    const weekEnd = endOfWeek(currentDate, { weekStartsOn: 0 });
    const scheduleData = await getScheduleList({
      startTime: weekStart,
      endTime: weekEnd,
    });
    setSchedules(scheduleData as Schedule[]);
  };

  const handleScheduleUpdated = async () => {
    // Reload schedules after update
    const rangeStart =
      viewMode === "weekly"
        ? startOfWeek(currentDate, { weekStartsOn: 0 })
        : startOfMonth(currentDate);
    const rangeEnd =
      viewMode === "weekly"
        ? endOfWeek(currentDate, { weekStartsOn: 0 })
        : endOfMonth(currentDate);

    const scheduleData = await getScheduleList({
      startTime: rangeStart,
      endTime: rangeEnd,
    });
    setSchedules(scheduleData as Schedule[]);
  };

  const handleScheduleDeleted = async () => {
    // Reload schedules after deletion
    const rangeStart =
      viewMode === "weekly"
        ? startOfWeek(currentDate, { weekStartsOn: 0 })
        : startOfMonth(currentDate);
    const rangeEnd =
      viewMode === "weekly"
        ? endOfWeek(currentDate, { weekStartsOn: 0 })
        : endOfMonth(currentDate);

    const scheduleData = await getScheduleList({
      startTime: rangeStart,
      endTime: rangeEnd,
    });
    setSchedules(scheduleData as Schedule[]);
  };

  return (
    <div className=" h-full gap-4 p-6">
      {/* Main Content */}
      <div>
        {/* Header */}
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between mb-6 gap-4">
          <div className="flex gap-4 justify-between">
            {/* Left Sidebar */}
            <div>
              <div className="w-64 ">
                <div>
                  <Input
                    placeholder="Search Staff..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className=""
                  />
                </div>
              </div>
            </div>
            {viewMode === "weekly" && (
              <div className="hidden lg:flex items-center gap-4">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handlePreviousWeek}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>

                <Dialog
                  open={showCalendarModal}
                  onOpenChange={setShowCalendarModal}
                >
                  <DialogTrigger asChild>
                    <Button variant="outline" className="min-w-fit">
                      {format(weekStart, "MMM dd")} -{" "}
                      {format(weekEnd, "MMM dd, yyyy")}
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Select Week</DialogTitle>
                    </DialogHeader>
                    <div className="flex flex-col items-center gap-4">
                      <Calendar
                        mode="single"
                        selected={currentDate}
                        onSelect={(date: Date | undefined) =>
                          handleDateSelect(date)
                        }
                      />
                      <Button
                        variant="outline"
                        onClick={() => {
                          setCurrentDate(new Date());
                          setShowCalendarModal(false);
                        }}
                        className="w-full"
                      >
                        This Week
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>

                <Button variant="outline" size="icon" onClick={handleNextWeek}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
          {viewMode === "weekly" && (
            <div className="flex lg:hidden items-center gap-4">
              <Button
                variant="outline"
                size="icon"
                onClick={handlePreviousWeek}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>

              <Dialog
                open={showCalendarModal}
                onOpenChange={setShowCalendarModal}
              >
                <DialogTrigger asChild>
                  <Button variant="outline" className="min-w-fit">
                    {format(weekStart, "MMM dd")} -{" "}
                    {format(weekEnd, "MMM dd, yyyy")}
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Select Week</DialogTitle>
                  </DialogHeader>
                  <div className="flex flex-col items-center gap-4">
                    <Calendar
                      mode="single"
                      selected={currentDate}
                      onSelect={(date: Date | undefined) =>
                        handleDateSelect(date)
                      }
                    />
                    <Button
                      variant="outline"
                      onClick={() => {
                        setCurrentDate(new Date());
                        setShowCalendarModal(false);
                      }}
                      className="w-full"
                    >
                      This Week
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>

              <Button variant="outline" size="icon" onClick={handleNextWeek}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
          <div className="flex items-center gap-2">
            <Button
              variant={viewMode === "weekly" ? "default" : "outline"}
              onClick={() => setViewMode("weekly")}
            >
              Weekly
            </Button>
            <Button
              variant={viewMode === "monthly" ? "default" : "outline"}
              onClick={() => setViewMode("monthly")}
            >
              Monthly
            </Button>

            <CreateScheduleModal
              staffList={staffList}
              onScheduleCreated={handleScheduleCreated}
            >
              <Button className="ml-2">
                <Plus className="h-4 w-4 mr-2" />
                Add Schedule
              </Button>
            </CreateScheduleModal>
          </div>
        </div>

        {!staffList || staffList.length === 0 ? (
          <Empty className="border border-dashed">
            <EmptyHeader>
              <EmptyTitle>No Staff Found</EmptyTitle>
              <EmptyDescription>
                Start by creating staff profiles.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          <>
            {/* Weekly View */}
            {viewMode === "weekly" && (
              <WeeklyView
                currentDate={currentDate}
                filteredSchedules={filteredSchedules}
                staffList={filteredStaffList}
                onScheduleUpdated={handleScheduleUpdated}
                onScheduleDeleted={handleScheduleDeleted}
              />
            )}

            {/* Monthly View */}
            {viewMode === "monthly" && (
              <MonthlyView
                currentDate={currentDate}
                filteredSchedules={filteredSchedules}
                staffList={filteredStaffList}
                onMonthChange={setCurrentDate}
                onScheduleUpdated={handleScheduleUpdated}
                onScheduleDeleted={handleScheduleDeleted}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
}
