"use client";

import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { addMonths, format, getDaysInMonth, subMonths } from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";
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

interface MonthlyViewProps {
  currentDate: Date;
  filteredSchedules: Schedule[];
  onMonthChange: (date: Date) => void;
}

export default function MonthlyView({
  currentDate,
  filteredSchedules,
  onMonthChange,
}: MonthlyViewProps) {
  const daysInMonth = getDaysInMonth(currentDate);
  const firstDayOfMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth(),
    1
  );
  const startingDayOfWeek = firstDayOfMonth.getDay();

  // Create array of days for the calendar (including previous month's days)
  const calendarDays: (Date | null)[] = [];
  for (let i = 0; i < startingDayOfWeek; i++) {
    calendarDays.push(null);
  }
  for (let day = 1; day <= daysInMonth; day++) {
    calendarDays.push(
      new Date(currentDate.getFullYear(), currentDate.getMonth(), day)
    );
  }

  // Create weeks array
  const weeks = [];
  for (let i = 0; i < calendarDays.length; i += 7) {
    weeks.push(calendarDays.slice(i, i + 7));
  }

  return (
    <div className="border rounded-lg flex flex-col h-full w-full">
      {/* Navigation */}
      <div className="flex items-center justify-between p-4 border-b">
        <Button
          variant="outline"
          size="icon"
          onClick={() => onMonthChange(subMonths(currentDate, 1))}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <h2 className="text-lg font-semibold">
          {format(currentDate, "MMMM yyyy")}
        </h2>
        <Button
          variant="outline"
          size="icon"
          onClick={() => onMonthChange(addMonths(currentDate, 1))}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Table Container with Scroll */}
      <div className="flex-1 overflow-auto w-full">
        <Table>
          <TableHeader className="bg-accent sticky top-0 z-10">
            <TableRow className="bg-muted hover:bg-muted">
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                <TableHead
                  key={day}
                  className="text-center p-4 w-1/7 border-r last:border-r-0"
                >
                  <div className="font-semibold text-sm">{day}</div>
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {weeks.map((week, weekIndex) => (
              <TableRow
                key={weekIndex}
                className="hover:bg-background border-0 h-32"
              >
                {week.map((day, dayIndex) => (
                  <TableCell
                    key={`${weekIndex}-${dayIndex}`}
                    className="p-3 w-1/7 border-r last:border-r-0 bg-muted/30 align-top overflow-y-auto"
                  >
                    {day ? (
                      <div className="space-y-2">
                        <div className="font-semibold text-sm">
                          {day.getDate()}
                        </div>
                        {(() => {
                          const daySchedules = filteredSchedules.filter(
                            (schedule) => {
                              const scheduleDate = new Date(schedule.startTime);
                              return (
                                scheduleDate.toDateString() ===
                                day.toDateString()
                              );
                            }
                          );

                          return daySchedules.length === 0
                            ? null
                            : daySchedules.map((schedule) => (
                                <ScheduleCard
                                  key={schedule.id}
                                  staff_name={schedule.staff.full_name}
                                  start_time={schedule.startTime}
                                  end_time={schedule.endTime}
                                  work_address={schedule.workAddress}
                                  shift_bonus={schedule.shiftBonus}
                                  instruction={schedule.instruction}
                                />
                              ));
                        })()}
                      </div>
                    ) : null}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
