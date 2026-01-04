import { getStaffList } from "@/src/app/api/staff/list";
import StaffClientView from "../staffClientView";

export default async function StaffDataLayer() {
  const initialData = await getStaffList();

  return <StaffClientView initialStaff={initialData} />;
}
