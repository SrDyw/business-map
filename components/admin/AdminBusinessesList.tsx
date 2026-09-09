"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Store,
  MapPin,
  Trash2,
  ToggleLeft,
  ToggleRight,
  Search,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type AdminBusiness = {
  id: string;
  name: string;
  type: string;
  address: string;
  phone: string;
  isActive: boolean;
  isDelivery: boolean;
  latitude: number;
  longitude: number;
  createdAt: string;
  owner: { id: string; name: string | null; email: string | null } | null;
  _count: { products: number };
};

const BUSINESS_TYPE_LABELS: Record<string, string> = {
  restaurant: "Restaurante",
  cafeteria: "Cafetería",
  grocery_store: "Tienda",
  pharmacy: "Farmacia",
  clothing: "Ropa",
  hardware_store: "Ferretería",
  butcher_shop: "Carnicería",
  bakery: "Panadería",
  technology: "Tecnología",
  beauty_salon: "Salón de belleza",
  optical: "Óptica",
};

export function AdminBusinessesList() {
  const [businesses, setBusinesses] = useState<AdminBusiness[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const loadBusinesses = useCallback(async () => {
    try {
      const res = await fetch("/api/v1/admin/businesses");
      const result = await res.json();
      if (result.success) setBusinesses(result.data);
    } catch {
      console.error("Failed to load businesses");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadBusinesses();
  }, [loadBusinesses]);

  async function handleToggleActive(businessId: string, current: boolean) {
    setActionLoading(businessId);
    try {
      const res = await fetch(`/api/v1/admin/businesses/${businessId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !current }),
      });
      const result = await res.json();
      if (result.success) {
        setBusinesses((prev) =>
          prev.map((b) => (b.id === businessId ? { ...b, isActive: !current } : b)),
        );
      }
    } catch {
      alert("Error al actualizar el negocio");
    } finally {
      setActionLoading(null);
    }
  }

  async function handleDelete(businessId: string) {
    if (!confirm("¿Eliminar este negocio permanentemente?")) return;
    setActionLoading(businessId);
    try {
      const res = await fetch(`/api/v1/admin/businesses/${businessId}`, {
        method: "DELETE",
      });
      const result = await res.json();
      if (result.success) {
        setBusinesses((prev) => prev.filter((b) => b.id !== businessId));
      }
    } catch {
      alert("Error al eliminar el negocio");
    } finally {
      setActionLoading(null);
    }
  }

  const filtered = businesses.filter((b) => {
    const term = search.toLowerCase();
    if (!term) return true;
    return (
      b.name.toLowerCase().includes(term) ||
      b.address.toLowerCase().includes(term) ||
      b.phone.includes(term) ||
      b.owner?.name?.toLowerCase().includes(term)
    );
  });

  if (loading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-20 animate-pulse rounded-xl bg-muted" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Buscar por nombre, dirección, teléfono o dueño..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      <div className="space-y-2">
        {filtered.length === 0 && (
          <p className="py-8 text-center text-sm text-muted-foreground">
            No se encontraron negocios.
          </p>
        )}
        {filtered.map((biz) => (
          <div
            key={biz.id}
            className="flex items-center gap-3 rounded-xl border border-border bg-card p-3 transition-colors hover:bg-muted/30"
          >
            <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-muted">
              <Store className="size-4 text-muted-foreground" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="truncate font-medium">{biz.name}</span>
                <span className="shrink-0 rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                  {BUSINESS_TYPE_LABELS[biz.type] ?? biz.type}
                </span>
                {!biz.isActive && (
                  <span className="shrink-0 rounded-full bg-red-500/15 px-2 py-0.5 text-xs font-medium text-red-400">
                    Inactivo
                  </span>
                )}
              </div>
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <span className="flex items-center gap-1 truncate">
                  <MapPin className="size-3" />
                  {biz.address}
                </span>
                <span>{biz._count.products} productos</span>
                {biz.owner && (
                  <span className="truncate">por {biz.owner.name ?? biz.owner.email}</span>
                )}
              </div>
            </div>

            <div className="flex shrink-0 gap-1">
              <Button
                variant="ghost"
                size="icon-sm"
                disabled={actionLoading === biz.id}
                onClick={() => handleToggleActive(biz.id, biz.isActive)}
                title={biz.isActive ? "Desactivar" : "Activar"}
              >
                {biz.isActive ? (
                  <ToggleRight className="size-5 text-green-400" />
                ) : (
                  <ToggleLeft className="size-5 text-muted-foreground" />
                )}
              </Button>
              <Button
                variant="ghost"
                size="icon-sm"
                disabled={actionLoading === biz.id}
                onClick={() => handleDelete(biz.id)}
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
