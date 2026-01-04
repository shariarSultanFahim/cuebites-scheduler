"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { addDays, format, startOfWeek } from "date-fns";
import { useEffect, useState } from "react";
import ScheduleCard from "./scheduleCard";

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

interface WeeklyViewProps {
  currentDate: Date;
  filteredSchedules: Schedule[];
  staffList: Staff[];
  onScheduleUpdated: () => void;
  onScheduleDeleted: () => void;
}

export default function WeeklyView({
  currentDate,
  filteredSchedules,
  staffList,
  onScheduleUpdated,
  onScheduleDeleted,
}: WeeklyViewProps) {
  const [today, setToday] = useState<string>("");

  useEffect(() => {
    const timer = setTimeout(() => {
      setToday(new Date().toDateString());
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  const weekStart = startOfWeek(currentDate, { weekStartsOn: 0 });
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  return (
    <div className="w-full border rounded-lg p-2">
      <Table>
        <TableHeader className="bg-muted sticky top-0 z-20">
          <TableRow>
            <TableHead className="w-40 sticky left-0 z-30 bg-muted border-r p-4">
              <div className="font-semibold text-sm">Staff</div>
            </TableHead>
            {weekDays.map((day) => {
              const isToday = today === day.toDateString();
              return (
                <TableHead
                  key={day.toISOString()}
                  className={`text-center p-4 border-r last:border-r-0 min-w-48 ${
                    isToday ? "bg-[#9742ff37]" : ""
                  }`}
                >
                  <div className="font-semibold text-sm">
                    {format(day, "EEE")}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {format(day, "dd MMM")}
                  </div>
                </TableHead>
              );
            })}
          </TableRow>
        </TableHeader>
        <TableBody>
          {staffList.map((staff) => (
            <TableRow key={staff.id} className="hover:bg-muted/50">
              <TableCell className="sticky left-0 z-10 bg-white border-r font-semibold text-sm p-4">
                {staff.full_name}
              </TableCell>
              {weekDays.map((day) => {
                const daySchedules = filteredSchedules.filter((schedule) => {
                  const scheduleDate = new Date(schedule.startTime);
                  return (
                    scheduleDate.toDateString() === day.toDateString() &&
                    schedule.staffId === staff.id
                  );
                });

                const isToday = today === day.toDateString();

                return (
                  <TableCell
                    key={day.toISOString()}
                    className={`p-3 border-r last:border-r-0 align-top min-h-32 ${
                      isToday ? "bg-[#9742ff22]" : "bg-white"
                    }`}
                  >
                    <div className="space-y-2">
                      {daySchedules.length === 0 ? (
                        <p className="text-xs text-muted-foreground text-center py-4">
                          -
                        </p>
                      ) : (
                        daySchedules.map((schedule) => (
                          <ScheduleCard
                            key={schedule.id}
                            id={schedule.id}
                            staff={schedule.staff}
                            staff_name={schedule.staff.full_name}
                            start_time={schedule.startTime}
                            end_time={schedule.endTime}
                            work_address={schedule.workAddress}
                            shift_bonus={schedule.shiftBonus}
                            instruction={schedule.instruction}
                            staffList={staffList}
                            onScheduleUpdated={onScheduleUpdated}
                            onScheduleDeleted={onScheduleDeleted}
                          />
                        ))
                      )}
                    </div>
                  </TableCell>
                );
              })}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
