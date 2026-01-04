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
}

export default function WeeklyView({
  currentDate,
  filteredSchedules,
}: WeeklyViewProps) {
  const weekStart = startOfWeek(currentDate, { weekStartsOn: 0 });
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  return (
    <Table className="border rounded-lg overflow-hidden">
      <TableHeader className="bg-accent sticky top-0 z-10">
        <TableRow className="bg-muted hover:bg-muted">
          {weekDays.map((day) => (
            <TableHead
              key={day.toISOString()}
              className="text-center p-4 border-r last:border-r-0"
            >
              <div className="font-semibold text-sm">{format(day, "EEE")}</div>
              <div className="text-xs text-muted-foreground">
                {format(day, "dd MMM")}
              </div>
            </TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow className="hover:bg-background border-0">
          {weekDays.map((day) => {
            const daySchedules = filteredSchedules.filter((schedule) => {
              const scheduleDate = new Date(schedule.startTime);
              return scheduleDate.toDateString() === day.toDateString();
            });

            return (
              <TableCell
                key={day.toISOString()}
                className="p-3 border-r last:border-r-0 min-h-96 bg-muted/30 align-top"
              >
                <div className="space-y-2">
                  {daySchedules.length === 0 ? (
                    <p className="text-xs text-muted-foreground text-center py-4">
                      No schedules
                    </p>
                  ) : (
                    daySchedules.map((schedule) => (
                      <ScheduleCard
                        key={schedule.id}
                        staff_name={schedule.staff.full_name}
                        start_time={schedule.startTime}
                        end_time={schedule.endTime}
                        work_address={schedule.workAddress}
                        shift_bonus={schedule.shiftBonus}
                        instruction={schedule.instruction}
                      />
                    ))
                  )}
                </div>
              </TableCell>
            );
          })}
        </TableRow>
      </TableBody>
    </Table>
  );
}
