import { redirect } from "next/navigation";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import RegistrationsDashboard from "./ui";
import { connection } from "next/server";

export default async function Page() {
  await connection();

  if (!(await isAdminAuthenticated())) redirect("/admin/login");
  return <RegistrationsDashboard />;
}
