import { getStaffList } from "../../api/staff/list";
import StaffClientView from "./staffClientView";

export default async function Page() {
  const initialData = await getStaffList();

  return <StaffClientView initialStaff={initialData} />;
}
