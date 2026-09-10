"use client";

import { Car, Loader2, MapPin, Navigation, Timer, X } from "lucide-react";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  formatDistance,
  formatDuration,
  ROUTE_PROFILE_LABELS,
  ROUTE_PROFILES,
  type RouteProfile,
} from "@/lib/routing";
import type { Business } from "@/types";

type RouteInfoCardProps = {
  destination: Business;
  distanceMeters: number;
  durationSeconds: number;
  vehicle: RouteProfile;
  onVehicleChange: (vehicle: RouteProfile) => void;
  onClose: () => void;
  isRecalculating?: boolean;
};

export function RouteInfoCard({
  destination,
  distanceMeters,
  durationSeconds,
  vehicle,
  onVehicleChange,
  onClose,
  isRecalculating = false,
}: RouteInfoCardProps) {
  return (
    <div className="absolute right-4 bottom-[calc(env(safe-area-inset-bottom)+1rem)] left-4 z-10 mx-auto max-w-md rounded-2xl border border-border bg-card/95 p-4 shadow-xl backdrop-blur-md sm:right-auto">
      <button
        type="button"
        onClick={onClose}
        className="absolute top-3 right-3 flex size-8 items-center justify-center rounded-full transition-colors hover:bg-muted"
        aria-label="Cerrar ruta"
        title="Cerrar ruta"
      >
        <X className="size-4" />
      </button>

      <div className="flex items-start gap-3 pr-8">
        <MapPin className="mt-0.5 size-5 shrink-0 text-[#4CD9A0]" />
        <div className="min-w-0">
          <p className="truncate font-semibold text-foreground">
            {destination.name}
          </p>
          <p className="truncate text-sm text-muted-foreground">
            {destination.address}
          </p>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <div className="flex items-center gap-2 rounded-lg bg-muted/60 p-3">
          <Timer className="size-4 shrink-0 text-[#4CD9A0]" />
          <div className="min-w-0">
            <p className="text-[10px] font-medium tracking-wide text-muted-foreground uppercase">
              Llegas en
            </p>
            <p className="truncate text-sm font-semibold">
              {formatDuration(durationSeconds)}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 rounded-lg bg-muted/60 p-3">
          <Navigation className="size-4 shrink-0 text-[#4CD9A0]" />
          <div className="min-w-0">
            <p className="text-[10px] font-medium tracking-wide text-muted-foreground uppercase">
              Distancia
            </p>
            <p className="truncate text-sm font-semibold">
              {formatDistance(distanceMeters)}
            </p>
          </div>
        </div>
      </div>

      {isRecalculating && (
        <div className="mt-3 flex items-center justify-center gap-2 rounded-lg bg-muted/60 p-2 text-sm font-medium text-muted-foreground">
          <Loader2 className="size-4 animate-spin text-[#4CD9A0]" />
          Recalculando ruta...
        </div>
      )}

      <div className="mt-3 flex items-center gap-2 rounded-lg border border-border p-2">
        <Car className="ml-1 size-4 shrink-0 text-muted-foreground" />
        <span className="text-sm font-medium text-muted-foreground">
          Vehículo
        </span>
        <Select
          value={vehicle}
          onValueChange={(value) =>
            onVehicleChange(value as RouteProfile)
          }
        >
          <SelectTrigger className="ml-auto" aria-label="Seleccionar vehículo">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {ROUTE_PROFILES.map((profile) => (
              <SelectItem key={profile} value={profile}>
                {ROUTE_PROFILE_LABELS[profile]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}