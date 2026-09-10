import { AdminUsersList } from "@/components/admin/AdminUsersList";

export default function AdminUsersPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Gestionar Usuarios</h1>
      <AdminUsersList />
    </div>
  );
}
