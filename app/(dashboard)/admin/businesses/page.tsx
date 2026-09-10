import { AdminBusinessesList } from "@/components/admin/AdminBusinessesList";

export default function AdminBusinessesPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Gestionar Negocios</h1>
      <AdminBusinessesList />
    </div>
  );
}
