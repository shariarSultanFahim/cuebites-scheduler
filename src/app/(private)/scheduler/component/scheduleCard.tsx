"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { format } from "date-fns";
import { Clock, MapPin, User } from "lucide-react";
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
        className="overflow-hidden hover:shadow-lg transition-all cursor-pointer border-l-4 border-l-blue-500"
        onClick={handleCardClick}
      >
        <CardContent className="p-3 space-y-2">
          {/* Time - Primary Info */}
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-blue-600 shrink-0" />
            <span className="font-bold text-sm text-gray-800">
              {format(startDate, "h:mm a")} - {format(endDate, "h:mm a")}
            </span>
          </div>

          {/* Staff Name */}
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-gray-500 shrink-0" />
            <span className="font-semibold text-sm text-gray-700 truncate">
              {staff_name}
            </span>
          </div>

          {/* Work Address */}
          <div className="flex items-start gap-2">
            <MapPin className="h-4 w-4 text-gray-500 shrink-0 mt-0.5" />
            <span className="text-xs text-gray-600 line-clamp-2">
              {work_address}
            </span>
          </div>

          {/* Shift Hours Badge */}
          <div className="pt-1">
            <Badge
              variant="secondary"
              className="text-xs bg-blue-100 text-blue-700 hover:bg-blue-100"
            >
              {shiftHours.toFixed(1)}h
            </Badge>
          </div>

          {/* Bonus and Instructions */}
          {(shift_bonus || instruction) && (
            <div className="space-y-1 pt-1">
              {shift_bonus && (
                <Badge
                  variant="outline"
                  className="text-xs bg-green-50 text-green-700 border-green-200"
                >
                  +${shift_bonus}
                </Badge>
              )}
              {instruction && (
                <div className="text-xs text-gray-600 bg-gray-50 p-2 rounded border border-gray-200 line-clamp-2">
                  {instruction}
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </>
  );
}
