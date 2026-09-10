import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export default async function AdminDashboardPage() {
  const [userCount, businessCount, productCount, activeBusinessCount] =
    await Promise.all([
      prisma.user.count(),
      prisma.business.count(),
      prisma.product.count(),
      prisma.business.count({ where: { isActive: true } }),
    ]);

  const stats = [
    { label: "Usuarios", value: userCount, color: "text-blue-400" },
    { label: "Negocios", value: businessCount, color: "text-green-400" },
    { label: "Activos", value: activeBusinessCount, color: "text-[#4CD9A0]" },
    { label: "Productos", value: productCount, color: "text-yellow-400" },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold">Dashboard</h1>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {stats.map((s) => (
          <div
            key={s.label}
            className="rounded-xl border border-border bg-card p-4"
          >
            <p className="text-sm text-muted-foreground">{s.label}</p>
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
