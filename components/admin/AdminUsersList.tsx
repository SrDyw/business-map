"use client";

import { useEffect, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  Shield,
  ShieldOff,
  Trash2,
  Users,
  Store,
  ChevronRight,
  Search,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type AdminUser = {
  id: string;
  name: string | null;
  email: string | null;
  role: string;
  isActive: boolean;
  createdAt: string;
  _count: { businesses: number };
};

export function AdminUsersList() {
  const { data: session } = useSession();
  const router = useRouter();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const loadUsers = useCallback(async () => {
    try {
      const res = await fetch("/api/v1/admin/users");
      const result = await res.json();
      if (result.success) setUsers(result.data);
    } catch {
      console.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  async function handleAction(userId: string, action: "role" | "active" | "delete", value?: string | boolean) {
    if (action === "delete" && !confirm("¿Eliminar este usuario permanentemente?")) return;
    if (action === "active" && userId === session?.user?.id) {
      alert("No puedes desactivar tu propia cuenta");
      return;
    }

    setActionLoading(userId);
    try {
      const res = await fetch("/api/v1/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, action, value }),
      });
      const result = await res.json();
      if (result.success) {
        if (action === "delete") {
          setUsers((prev) => prev.filter((u) => u.id !== userId));
        } else {
          setUsers((prev) =>
            prev.map((u) => {
              if (u.id !== userId) return u;
              if (action === "role") return { ...u, role: value as string };
              if (action === "active") return { ...u, isActive: value as boolean };
              return u;
            }),
          );
        }
      } else {
        alert(result.error);
      }
    } catch {
      alert("Error al procesar la acción");
    } finally {
      setActionLoading(null);
    }
  }

  const filtered = users.filter((u) => {
    const term = search.toLowerCase();
    if (!term) return true;
    return (
      u.name?.toLowerCase().includes(term) ||
      u.email?.toLowerCase().includes(term)
    );
  });

  if (loading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-16 animate-pulse rounded-xl bg-muted" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Buscar por nombre o email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      <div className="space-y-2">
        {filtered.length === 0 && (
          <p className="py-8 text-center text-sm text-muted-foreground">
            No se encontraron usuarios.
          </p>
        )}
        {filtered.map((user) => (
          <div
            key={user.id}
            className="flex items-center gap-3 rounded-xl border border-border bg-card p-3 transition-colors hover:bg-muted/30"
          >
            <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-muted text-sm font-semibold">
              {user.name?.charAt(0)?.toUpperCase() ?? "?"}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="truncate font-medium">{user.name ?? "Sin nombre"}</span>
                {user.role === "admin" && (
                  <span className="shrink-0 rounded-full bg-[#4CD9A0]/15 px-2 py-0.5 text-xs font-medium text-[#4CD9A0]">
                    Admin
                  </span>
                )}
                {!user.isActive && (
                  <span className="shrink-0 rounded-full bg-red-500/15 px-2 py-0.5 text-xs font-medium text-red-400">
                    Inactivo
                  </span>
                )}
              </div>
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <span className="truncate">{user.email}</span>
                <span>{user._count.businesses} negocios</span>
              </div>
            </div>

            <div className="flex shrink-0 gap-1">
              <Button
                variant="ghost"
                size="icon-sm"
                disabled={actionLoading === user.id || user.id === session?.user?.id}
                onClick={() =>
                  handleAction(user.id, "role", user.role === "admin" ? "user" : "admin")
                }
                title={user.role === "admin" ? "Quitar admin" : "Hacer admin"}
              >
                {user.role === "admin" ? (
                  <ShieldOff className="size-4 text-yellow-400" />
                ) : (
                  <Shield className="size-4 text-muted-foreground" />
                )}
              </Button>
              <Button
                variant="ghost"
                size="icon-sm"
                disabled={actionLoading === user.id || user.id === session?.user?.id}
                onClick={() => handleAction(user.id, "active", !user.isActive)}
                title={user.isActive ? "Desactivar" : "Activar"}
              >
                {user.isActive ? (
                  <ShieldOff className="size-4 text-muted-foreground" />
                ) : (
                  <Shield className="size-4 text-green-400" />
                )}
              </Button>
              <Button
                variant="ghost"
                size="icon-sm"
                disabled={actionLoading === user.id || user.id === session?.user?.id}
                onClick={() => handleAction(user.id, "delete")}
                title="Eliminar"
              >
                <Trash2 className="size-4 text-red-400" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
