import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getTopStaffBySchedules } from "@/src/app/api/dashboard/stats";
import { Clock, Users } from "lucide-react";

export async function RecentActivity() {
  const result = await getTopStaffBySchedules();

  if (!result.success || !result.data || result.data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Top Staff by Schedules</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            No schedule data available
          </p>
        </CardContent>
      </Card>
    );
  }

  const topStaff = result.data;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Top Staff by Schedules
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {topStaff.map((staff, index) => (
            <div
              key={staff.id}
              className="flex items-center justify-between pb-4 border-b last:border-b-0 last:pb-0"
            >
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center h-8 w-8 rounded-sm bg-primary/10">
                  <span className="text-sm font-semibold">#{index + 1}</span>
                </div>
                <div>
                  <p className="font-medium text-sm">{staff.name}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="secondary" className="text-xs">
                      {staff.scheduleCount}{" "}
                      {staff.scheduleCount === 1 ? "shift" : "shifts"}
                    </Badge>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="flex items-center gap-1 text-sm font-semibold">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  {staff.totalHours}h
                </div>
                <p className="text-xs text-muted-foreground">total hours</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
