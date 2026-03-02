import { AdminShell } from "@/components/admin/AdminShell";
export default function AdminLayout({children}:{children:React.ReactNode}){return <div className="admin-cursor-default"><AdminShell>{children}</AdminShell></div>;}
