"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { format } from "date-fns";
import { MapPinned } from "lucide-react";
import { useRef } from "react";
import EditScheduleModal from "./editScheduleModal";

interface Staff {
  id: number;
  full_name: string;
}

interface ScheduleCardProps {
  id: number;
  staff: Staff;
  staff_name: string;
  start_time: string | Date;
  end_time: string | Date;
  work_address: string;
  shift_bonus?: number | null;
  instruction?: string | null;
  staffList: Staff[];
  onScheduleUpdated: () => void;
  onScheduleDeleted: () => void;
}

export default function ScheduleCard({
  id,
  staff,
  staff_name,
  start_time,
  end_time,
  work_address,
  shift_bonus,
  instruction,
  staffList,
  onScheduleUpdated,
  onScheduleDeleted,
}: ScheduleCardProps) {
  const startDate = new Date(start_time);
  const endDate = new Date(end_time);
  const shiftHours =
    (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60);
  const triggerRef = useRef<HTMLDivElement>(null);

  const handleCardClick = () => {
    triggerRef.current?.click();
  };

  return (
    <>
      <EditScheduleModal
        schedule={{
          id,
          staffId: staff.id,
          startTime: start_time,
          endTime: end_time,
          workAddress: work_address,
          shiftBonus: shift_bonus,
          instruction: instruction,
        }}
        staffList={staffList}
        onScheduleUpdated={onScheduleUpdated}
        onScheduleDeleted={onScheduleDeleted}
      >
        <div ref={triggerRef} />
      </EditScheduleModal>

      <Card
        className="overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
        onClick={handleCardClick}
      >
        <CardContent className="p-3 space-y-2">
          {/* Staff Name */}
          <div className="font-semibold text-sm text-primary">{staff_name}</div>

          {/* Date and Time */}
          <div className="text-xs space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">Date:</span>
              <span className="font-medium">
                {format(startDate, "MMM dd, yyyy")}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">Time:</span>
              <span className="font-medium">
                {format(startDate, "HH:mm")} - {format(endDate, "HH:mm")}
              </span>
            </div>
          </div>

          {/* Shift Hours */}
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">
              {shiftHours.toFixed(1)}h
            </Badge>
          </div>

          {/* Work Address */}
          <div className="text-xs text-muted-foreground truncate flex items-center gap-1">
            <MapPinned /> {work_address}
          </div>

          {/* Bonus and Instructions */}
          <div className="space-y-1">
            {shift_bonus && (
              <div className="text-xs">
                <Badge variant="secondary" className="text-xs">
                  Bonus: ${shift_bonus}
                </Badge>
              </div>
            )}
            {instruction && (
              <div className="text-xs text-muted-foreground bg-muted p-2 rounded max-h-12 overflow-y-auto">
                {instruction}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </>
  );
}
