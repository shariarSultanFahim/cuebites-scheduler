"use client";

import { Button } from "@/components/ui/button";
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
import { Loader2 } from "lucide-react";
import moment from "moment";
import { ReactNode, useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { createSchedule } from "../../../api/schedule/create";

interface Staff {
  id: number;
  full_name: string;
}

interface CreateScheduleModalProps {
  staffList: Staff[];
  onScheduleCreated: () => void;
  children: ReactNode;
}

const formSchema = z.object({
  staffId: z.number().int().positive("Staff is required"),
  startTime: z.string().min(1, "Start time is required"),
  shiftHours: z.number().positive("Shift hours must be greater than 0"),
  workAddress: z.string().min(1, "Work address is required"),
  shiftBonus: z.number().optional(),
  instructions: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

export default function CreateScheduleModal({
  staffList,
  onScheduleCreated,
  children,
}: CreateScheduleModalProps) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    setError,
    setValue,
    watch,
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      staffId: undefined,
      startTime: "",
      shiftHours: undefined,
      workAddress: "",
      shiftBonus: undefined,
      instructions: "",
    },
  });

  // eslint-disable-next-line react-hooks/incompatible-library
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

    // Calculate endTime based on startTime + shiftHours
    const endMoment = startMoment.clone().add(data.shiftHours, "hours");

    const submitData = {
      staffId: data.staffId,
      startTime: startMoment.toISOString(),
      endTime: endMoment.toISOString(),
      workAddress: data.workAddress,
      shiftBonus: data.shiftBonus,
      instructions: data.instructions,
    };

    startTransition(async () => {
      const result = await createSchedule(submitData);
      if (result.success) {
        toast.success("Schedule created successfully");
        reset();
        setOpen(false);
        onScheduleCreated();
      } else {
        if (result.errors) {
          Object.entries(result.errors).forEach(([key, value]) => {
            setError(key as keyof FormData, {
              message: (value as string[])[0],
            });
          });
          toast.error(result.message || "Failed to create schedule");
        } else {
          setError("root", {
            message: result.message || "Failed to create schedule",
          });
          toast.error(result.message || "Failed to create schedule");
        }
      }
    });
  };

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (!newOpen) {
      reset();
    }
  };

  // Calculate and display the estimated end time
  const getEstimatedEndTime = () => {
    if (!startTime || !shiftHours) return null;
    const startMoment = moment(startTime, "YYYY-MM-DDTHH:mm");
    if (!startMoment.isValid()) return null;
    const endMoment = startMoment.clone().add(shiftHours, "hours");
    return endMoment.format("YYYY-MM-DD HH:mm");
  };

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetTrigger asChild>{children}</SheetTrigger>
      <SheetContent className="overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Create New Schedule</SheetTitle>
          <SheetDescription>
            Add a new schedule for your staff members.
          </SheetDescription>
        </SheetHeader>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="grid gap-4 py-2 px-4"
        >
          {errors.root && (
            <div className="text-red-500 text-sm">{errors.root.message}</div>
          )}

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
                variant="outline"
                onClick={() => reset()}
                disabled={isPending || isSubmitting}
              >
                Reset
              </Button>
              <Button
                className="flex-1"
                type="submit"
                disabled={isPending || isSubmitting}
              >
                {(isPending || isSubmitting) && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Create Schedule
              </Button>
            </div>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
