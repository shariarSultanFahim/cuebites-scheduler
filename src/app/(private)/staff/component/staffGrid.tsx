import { Badge } from "@/components/ui/badge";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Staff } from "@/generated/prisma/client";
import { getCountryFlagEmoji, getCountryNameByCode } from "@/lib/countries";
import { Avatar } from "@makozi/react-user-avatar-generator";
import {
  AlertCircle,
  Globe,
  MapPin,
  Mars,
  Phone,
  Venus,
  VenusAndMars,
} from "lucide-react";
import Image from "next/image";

export default function StaffGrid({ staffList }: { staffList: Staff[] }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2">
      {staffList.map((staff) => (
        <Card key={staff.id} className="gap-1 shadow-none border">
          <CardHeader>
            <div className="flex items-center gap-3">
              <Avatar
                name={staff.full_name}
                size={30}
                fontSize={14}
                shape="square"
              />
              <div>
                <CardTitle className="flex items-center gap-2">
                  {staff.full_name}{" "}
                  {staff.gender === "MALE" ? (
                    <Mars className="text-blue-500 text-sm"></Mars>
                  ) : staff.gender === "FEMALE" ? (
                    <Venus className="text-pink-500 text-sm"></Venus>
                  ) : (
                    <VenusAndMars className="text-pink-500 text-sm"></VenusAndMars>
                  )}
                </CardTitle>
                <CardDescription className="text-xs">
                  {staff.status}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <table className="text-sm w-full">
              <tbody>
                <tr>
                  <td className="font-medium text-gray-500 pr-2 min-w-1/3 py-1">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      Location
                    </div>
                  </td>
                  <td className="text-ellipsis">
                    {" "}
                    <div className="flex items-center justify-start gap-2">
                      <Image
                        width={24}
                        height={24}
                        src={getCountryFlagEmoji(staff.Country)}
                        alt={getCountryNameByCode(staff.Country)}
                      />
                      <span className="text-sm">
                        {staff.city +
                          ", " +
                          getCountryNameByCode(staff.Country)}
                      </span>
                    </div>
                  </td>
                </tr>
                <tr>
                  <td className="font-medium text-gray-500 pr-2 min-w-1/3 py-1">
                    <div className="flex items-center gap-2">
                      <Globe className="h-4 w-4" />
                      Nationality
                    </div>
                  </td>
                  <td className="text-ellipsis">
                    {" "}
                    <div className="flex items-center justify-start gap-2">
                      <Image
                        width={24}
                        height={24}
                        src={getCountryFlagEmoji(staff.nationality)}
                        alt={getCountryNameByCode(staff.nationality)}
                      />
                      <span className="text-sm">
                        {getCountryNameByCode(staff.nationality)}
                      </span>
                    </div>
                  </td>
                </tr>
                <tr>
                  <td className="font-medium text-gray-500 pr-2 min-w-1/3 py-1">
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4" />
                      Phone
                    </div>
                  </td>
                  <td className="text-ellipsis">{staff.phone}</td>
                </tr>
                <tr>
                  <td className="font-medium text-gray-500 pr-2 min-w-1/3 py-1">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="h-4 w-4" />
                      Status
                    </div>
                  </td>
                  <td>
                    <Badge
                      variant="default"
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
                  </td>
                </tr>
              </tbody>
            </table>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
