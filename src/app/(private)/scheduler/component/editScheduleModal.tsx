"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Trash2 } from "lucide-react";
import moment from "moment";
import { ReactNode, useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { deleteSchedule } from "../../../api/schedule/delete";
import { updateSchedule } from "../../../api/schedule/update";

interface Staff {
  id: number;
  full_name: string;
}

interface EditScheduleModalProps {
  schedule: {
    id: number;
    staffId: number;
    startTime: string | Date;
    endTime: string | Date;
    workAddress: string;
    shiftBonus?: number | null;
    instruction?: string | null;
  };
  staffList: Staff[];
  onScheduleUpdated: () => void;
  onScheduleDeleted: () => void;
  children: ReactNode;
}

const formSchema = z.object({
  id: z.number().int().positive(),
  staffId: z.number().int().positive("Staff is required"),
  startTime: z.string().min(1, "Start time is required"),
  shiftHours: z.number().positive("Shift hours must be greater than 0"),
  workAddress: z.string().min(1, "Work address is required"),
  shiftBonus: z.number().optional(),
  instructions: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

export default function EditScheduleModal({
  schedule,
  staffList,
  onScheduleUpdated,
  onScheduleDeleted,
  children,
}: EditScheduleModalProps) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Calculate initial shift hours
  const getInitialShiftHours = () => {
    const start = new Date(schedule.startTime);
    const end = new Date(schedule.endTime);
    return (end.getTime() - start.getTime()) / (1000 * 60 * 60);
  };

  // Format date for datetime-local input
  const formatDateForInput = (date: string | Date) => {
    const d = new Date(date);
    return d.toISOString().slice(0, 16);
  };

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setError,
    setValue,
    watch,
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      id: schedule.id,
      staffId: schedule.staffId,
      startTime: formatDateForInput(schedule.startTime),
      shiftHours: getInitialShiftHours(),
      workAddress: schedule.workAddress,
      shiftBonus: schedule.shiftBonus ?? undefined,
      instructions: schedule.instruction ?? "",
    },
  });

  const selectedStaffId = watch("staffId");
  const startTime = watch("startTime");
  const shiftHours = watch("shiftHours");

  const onSubmit = async (data: FormData) => {
    const startMoment = moment(data.startTime, "YYYY-MM-DDTHH:mm", true);

    if (!startMoment.isValid()) {
      setError("startTime", {
        message: "Invalid start time format",
      });
      return;
    }

    const endMoment = startMoment.clone().add(data.shiftHours, "hours");

    const submitData = {
      id: data.id,
      staffId: data.staffId,
      startTime: startMoment.toISOString(),
      endTime: endMoment.toISOString(),
      workAddress: data.workAddress,
      shiftBonus: data.shiftBonus,
      instruction: data.instructions,
    };

    startTransition(async () => {
      const result = await updateSchedule(submitData);
      if (result.success) {
        toast.success("Schedule updated successfully");
        reset();
        setOpen(false);
        onScheduleUpdated();
      } else {
        if (result.errors) {
          Object.entries(result.errors).forEach(([key, value]) => {
            setError(key as keyof FormData, {
              message: (value as string[])[0],
            });
          });
          toast.error(result.message || "Failed to update schedule");
        } else {
          setError("root", {
            message: result.message || "Failed to update schedule",
          });
          toast.error(result.message || "Failed to update schedule");
        }
      }
    });
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const result = await deleteSchedule({ id: schedule.id });
      if (result.success) {
        toast.success("Schedule deleted successfully");
        setOpen(false);
        setShowDeleteConfirm(false);
        onScheduleDeleted();
      } else {
        toast.error(result.message || "Failed to delete schedule");
      }
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("Failed to delete schedule");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (!newOpen) {
      reset();
    }
  };

  const getEstimatedEndTime = () => {
    if (!startTime || !shiftHours) return null;
    const startMoment = moment(startTime, "YYYY-MM-DDTHH:mm");
    if (!startMoment.isValid()) return null;
    const endMoment = startMoment.clone().add(shiftHours, "hours");
    return endMoment.format("YYYY-MM-DD HH:mm");
  };

  return (
    <>
      <Sheet open={open} onOpenChange={handleOpenChange}>
        <SheetTrigger asChild>{children}</SheetTrigger>
        <SheetContent className="overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Edit Schedule</SheetTitle>
            <SheetDescription>
              Update the schedule details for your staff member.
            </SheetDescription>
          </SheetHeader>

          <form
            onSubmit={handleSubmit(onSubmit)}
            className="grid gap-4 py-2 px-4"
          >
            {/* Staff Selection */}
            <div className="grid gap-2">
              <Label htmlFor="staffId">Staff *</Label>
              <Select
                value={selectedStaffId?.toString() || ""}
                onValueChange={(value) =>
                  setValue("staffId", parseInt(value, 10))
                }
              >
                <SelectTrigger id="staffId">
                  <SelectValue placeholder="Select a staff member" />
                </SelectTrigger>
                <SelectContent>
                  {staffList.map((staff) => (
                    <SelectItem key={staff.id} value={staff.id.toString()}>
                      {staff.full_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.staffId && (
                <p className="text-red-500 text-xs">{errors.staffId.message}</p>
              )}
            </div>

            {/* Start Time */}
            <div className="grid gap-2">
              <Label htmlFor="startTime">Start Time *</Label>
              <Input
                id="startTime"
                type="datetime-local"
                {...register("startTime")}
                className={errors.startTime ? "border-red-500" : ""}
              />
              {errors.startTime && (
                <p className="text-red-500 text-xs">{errors.startTime.message}</p>
              )}
            </div>

            {/* Shift Hours */}
            <div className="grid gap-2">
              <Label htmlFor="shiftHours">Shift Time (hours) *</Label>
              <Input
                id="shiftHours"
                type="number"
                step="0.5"
                placeholder="Enter shift duration in hours"
                {...register("shiftHours", {
                  setValueAs: (value) =>
                    value === "" ? undefined : Number(value),
                })}
                className={errors.shiftHours ? "border-red-500" : ""}
              />
              {errors.shiftHours && (
                <p className="text-red-500 text-xs">
                  {errors.shiftHours.message}
                </p>
              )}
              {getEstimatedEndTime() && (
                <p className="text-xs text-muted-foreground">
                  Estimated end time: {getEstimatedEndTime()}
                </p>
              )}
            </div>

            {/* Work Address */}
            <div className="grid gap-2">
              <Label htmlFor="workAddress">Work Address *</Label>
              <Input
                id="workAddress"
                placeholder="Enter work address"
                {...register("workAddress")}
                className={errors.workAddress ? "border-red-500" : ""}
              />
              {errors.workAddress && (
                <p className="text-red-500 text-xs">
                  {errors.workAddress.message}
                </p>
              )}
            </div>

            {/* Shift Bonus */}
            <div className="grid gap-2">
              <Label htmlFor="shiftBonus">Shift Bonus (Optional)</Label>
              <Input
                id="shiftBonus"
                type="number"
                placeholder="Enter shift bonus"
                {...register("shiftBonus", {
                  setValueAs: (value) =>
                    value === "" ? undefined : Number(value),
                })}
                className={errors.shiftBonus ? "border-red-500" : ""}
              />
              {errors.shiftBonus && (
                <p className="text-red-500 text-xs">
                  {errors.shiftBonus.message}
                </p>
              )}
            </div>

            {/* Instructions */}
            <div className="grid gap-2">
              <Label htmlFor="instructions">Instructions (Optional)</Label>
              <textarea
                id="instructions"
                placeholder="Enter any special instructions"
                {...register("instructions")}
                className={`flex min-h-20 w-full rounded-md border ${
                  errors.instructions ? "border-red-500" : "border-input"
                } bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50`}
                rows={3}
              />
              {errors.instructions && (
                <p className="text-red-500 text-xs">
                  {errors.instructions.message}
                </p>
              )}
            </div>

            <SheetFooter className="px-0 pt-4">
              <div className="flex gap-2">
                <Button
                  className="flex-1"
                  type="button"
                  variant="destructive"
                  onClick={() => setShowDeleteConfirm(true)}
                  disabled={isPending || isDeleting}
                >
                  {isDeleting ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Trash2 className="mr-2 h-4 w-4" />
                  )}
                  Delete
                </Button>
                <Button
                  className="flex-1"
                  type="submit"
                  disabled={isPending || isDeleting}
                >
                  {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Update Info
                </Button>
              </div>
            </SheetFooter>
          </form>
        </SheetContent>
      </Sheet>

      <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Schedule</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this schedule? This action cannot be
              undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDeleteConfirm(false)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
