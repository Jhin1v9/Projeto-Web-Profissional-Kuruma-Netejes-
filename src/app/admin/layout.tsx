import { AdminShell } from "@/components/admin/AdminShell";
import { redirect } from "next/navigation";
import { isAdminSessionFromCookies } from "@/lib/admin-auth";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const isAdmin = await isAdminSessionFromCookies();
  if (!isAdmin) redirect("/login?next=/admin");

  return (
    <div className="admin-cursor-default">
      <AdminShell>{children}</AdminShell>
    </div>
  );
}
