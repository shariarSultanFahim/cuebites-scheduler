"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Plus } from "lucide-react";
import Link from "next/link";

export function QuickActions() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-3 sm:grid-cols-2">
          <Link href="/staff">
            <Button variant="outline" className="w-full" asChild>
              <div className="flex items-center gap-2 cursor-pointer">
                <Plus className="h-4 w-4" />
                Add Staff
              </div>
            </Button>
          </Link>
          <Link href="/scheduler">
            <Button variant="outline" className="w-full" asChild>
              <div className="flex items-center gap-2 cursor-pointer">
                <Calendar className="h-4 w-4" />
                View Scheduler
              </div>
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
