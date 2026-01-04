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
import { Input } from "@/components/ui/input";
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
  const [showCalendarModal, setShowCalendarModal] = useState(false);

  // Load staff and schedules
  useEffect(() => {
    const loadData = async () => {
      const staff = await getStaffList();
      setStaffList(staff);
    };
    loadData();
  }, [currentDate]);

  // Load schedules when date range changes
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

  const filteredStaff =
    searchQuery.trim() === ""
      ? staffList
      : staffList.filter((staff) =>
          staff.full_name.toLowerCase().includes(searchQuery.toLowerCase())
        );

  // Filter schedules based on search query
  const filteredSchedules =
    searchQuery.trim() === ""
      ? schedules
      : schedules.filter((schedule) =>
          schedule.staff.full_name
            .toLowerCase()
            .includes(searchQuery.toLowerCase())
        );

  // Get week start and end
  const weekStart = startOfWeek(currentDate, { weekStartsOn: 0 });
  const weekEnd = endOfWeek(currentDate, { weekStartsOn: 0 });

  // Calculate hours per staff
  const getStaffHours = (staffId: number): number => {
    return schedules
      .filter((schedule) => schedule.staffId === staffId)
      .reduce((total, schedule) => {
        const start = new Date(schedule.startTime);
        const end = new Date(schedule.endTime);
        const hours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
        return total + hours;
      }, 0);
  };

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
    // Reload schedules after creation
    const weekStart = startOfWeek(currentDate, { weekStartsOn: 0 });
    const weekEnd = endOfWeek(currentDate, { weekStartsOn: 0 });
    const scheduleData = await getScheduleList({
      startTime: weekStart,
      endTime: weekEnd,
    });
    setSchedules(scheduleData as Schedule[]);
  };

  return (
    <div className="flex h-full gap-4 p-6">
      {/* Left Sidebar */}
      <div className="hidden lg:block">
        <div className="w-64 border-r pr-4">
          <div className="mb-6">
            <Input
              placeholder="Search Staff..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="mb-4"
            />
          </div>
        </div>

        {/* Staff List */}
        <div className="space-y-3">
          {filteredStaff.map((staff) => (
            <div
              key={staff.id}
              className="p-3 border rounded-lg hover:bg-accent cursor-pointer"
            >
              <p className="font-semibold text-sm">{staff.full_name}</p>
              <p className="text-xs text-muted-foreground">
                {getStaffHours(staff.id).toFixed(1)} hours
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1">
        {/* Header */}
        <div className="flex items-center justify-center lg:justify-end mb-6 gap-4">
          <div className="flex justify-center items-center lg:hidden w-full">
            <div className="w-64">
              <div className="mb-6">
                <Input
                  placeholder="Search Staff..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="mb-4"
                />
              </div>
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
          </div>

          {viewMode === "weekly" && (
            <div className="flex items-center gap-4">
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

          <div className="hidden lg:flex items-center gap-2">
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

        {/* Weekly View */}
        {viewMode === "weekly" && (
          <WeeklyView
            currentDate={currentDate}
            filteredSchedules={filteredSchedules}
          />
        )}

        {/* Monthly View */}
        {viewMode === "monthly" && (
          <MonthlyView
            currentDate={currentDate}
            filteredSchedules={filteredSchedules}
            onMonthChange={setCurrentDate}
          />
        )}
      </div>
    </div>
  );
}
