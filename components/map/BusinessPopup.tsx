"use client";

import { Clock, Loader2, Navigation, Store } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { BusinessDetailsDialog } from "@/components/business/BusinessDetailsDialog";
import { useOpenStatus } from "@/hooks/useOpenStatus";
import {
  formatDuration,
  formatDistance as formatRouteDistance,
} from "@/lib/routing";
import type { Business } from "@/types";

type ActiveRoute = {
  distanceMeters: number | null;
  durationSeconds: number | null;
} | null;

type BusinessPopupProps = {
  business: Business;
  distanceKm: number | null;
  activeRoute: ActiveRoute;
  isRouting: boolean;
  routeError: string | null;
  onNavigate: () => void;
};

function formatDistance(km: number): string {
  if (km < 1) {
    return `${Math.round(km * 1000)} m`;
  }
  return `${km.toFixed(1)} km`;
}

export function BusinessPopup({
  business,
  distanceKm,
  activeRoute,
  isRouting,
  routeError,
  onNavigate,
}: BusinessPopupProps) {
  const openStatus = useOpenStatus(
    business.scheduleDays,
    business.scheduleHours,
  );

  return (
    <Card size="sm" className="w-64">
      <CardHeader>
        <div className="flex items-center gap-3">
          <Avatar size="lg" className="shrink-0">
            {business.photoUrl && (
              <AvatarImage src={business.photoUrl} alt={business.name} />
            )}
            <AvatarFallback>
              <Store className="size-5" />
            </AvatarFallback>
          </Avatar>
          <CardTitle className="truncate">{business.name}</CardTitle>
        </div>
        <CardDescription>{business.address}</CardDescription>
        {distanceKm !== null && (
          <CardDescription className="flex items-center gap-1 text-green-300">
            <Navigation size={14} /> {formatDistance(distanceKm)} away
          </CardDescription>
        )}
        <OpenStatusBadge status={openStatus} />
        {business.scheduleDays && (
          <CardDescription className="flex items-center gap-1 font-medium text-foreground">
            <Clock size={16} /> {business.scheduleDays}
          </CardDescription>
        )}
        {business.scheduleHours && (
          <CardDescription className="flex items-center gap-1">
            {business.scheduleHours}
          </CardDescription>
        )}
      </CardHeader>
      <CardContent className="space-y-3">
        <Button
          size="default"
          className="w-full rounded-full bg-white text-black hover:bg-white/90"
          disabled={isRouting}
          onClick={onNavigate}
          data-icon="inline-start"
        >
          {isRouting ? (
            <Loader2 className="animate-spin" aria-hidden="true" />
          ) : (
            <Navigation aria-hidden="true" />
          )}
          {isRouting ? "Calculating route..." : "Take me there"}
        </Button>
        {activeRoute &&
          activeRoute.distanceMeters !== null &&
          activeRoute.durationSeconds !== null && (
            <CardDescription className="flex items-center justify-center gap-2 text-green-300">
              <span>{formatRouteDistance(activeRoute.distanceMeters)}</span>
              <span>·</span>
              <span>{formatDuration(activeRoute.durationSeconds)}</span>
            </CardDescription>
          )}
        {routeError && (
          <CardDescription className="text-center text-red-400">
            {routeError}
          </CardDescription>
        )}
        <BusinessDetailsDialog business={business} distanceKm={distanceKm} />
      </CardContent>
    </Card>
  );
}

function OpenStatusBadge({ status }: { status: boolean | null }) {
  if (status === null) return null;

  return status ? (
    <span className="inline-flex w-fit items-center rounded-full bg-green-500/15 px-2.5 py-0.5 text-xs font-medium text-green-400">
      <span className="mr-1.5 size-1.5 rounded-full bg-green-400" />
      Open now
    </span>
  ) : (
    <span className="inline-flex w-fit items-center rounded-full bg-red-500/15 px-2.5 py-0.5 text-xs font-medium text-red-400">
      <span className="mr-1.5 size-1.5 rounded-full bg-red-400" />
      Currently closed
    </span>
  );
}