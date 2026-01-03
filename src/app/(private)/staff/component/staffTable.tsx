import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { Staff } from "@/generated/prisma/client";
import { getCountryFlagEmoji, getCountryNameByCode } from "@/lib/countries";
import { Avatar } from "@makozi/react-user-avatar-generator";
import Image from "next/image";

export function StaffTable({ data: staffs }: { data: Staff[] }) {
  return (
    <div className="border rounded-md overflow-hidden p-2">
      <Table className="rounded overflow-hidden">
        <TableHeader className="bg-accent">
          <TableRow>
            <TableHead>Staff</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Phone</TableHead>
            <TableHead className="text-center">Status</TableHead>
            <TableHead className="text-center">Gender</TableHead>
            <TableHead>Nationality</TableHead>
            <TableHead>Created At</TableHead>
            <TableHead>Updated At</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {staffs.map((staff) => (
            <TableRow key={staff.id}>
              <TableCell>
                {staff.avatar ? (
                  <Avatar
                    name={staff.full_name}
                    src={staff.avatar}
                    size={30}
                    shape="square"
                  />
                ) : (
                  <Avatar
                    name={staff.full_name}
                    size={30}
                    fontSize={14}
                    shape="square"
                  />
                )}
              </TableCell>
              <TableCell>{staff.full_name}</TableCell>
              <TableCell>{staff.email}</TableCell>
              <TableCell>{staff.phone}</TableCell>
              <TableCell className="text-center">
                <Badge
                  className="text-xs!"
                  style={{
                    color:
                      staff.status === "ACTIVE"
                        ? "#065f46"
                        : staff.status === "ONBOARDING"
                        ? "#92400e"
                        : "#991b1b",
                    backgroundColor:
                      staff.status === "ACTIVE"
                        ? "#d1fae5"
                        : staff.status === "ONBOARDING"
                        ? "#fef3c7"
                        : "#fee2e2",
                  }}
                >
                  {staff.status}
                </Badge>
              </TableCell>
              <TableCell className="text-center">{staff.gender}</TableCell>
              <TableCell>
                <div className="flex items-start justify-start gap-2">
                  <Image
                    width={6}
                    height={4}
                    src={getCountryFlagEmoji(staff.nationality)}
                    alt={getCountryNameByCode(staff.nationality)}
                    className="w-6 h-4 rounded-sm shadow-sm border border-border/50"
                  />
                  <span className="text-sm">
                    {getCountryNameByCode(staff.nationality)}
                  </span>
                </div>
              </TableCell>
              <TableCell>{staff.createdAt.toLocaleString()}</TableCell>
              <TableCell>{staff.updatedAt.toLocaleString()}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
