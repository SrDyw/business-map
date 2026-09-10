"use client";

import { useEffect } from "react";
import { Store } from "lucide-react";

import { useMap } from "@/components/ui/map";
import type { Business } from "@/types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { useOpenStatus } from "@/hooks/useOpenStatus";

export type OverlayCoordinates = {
  latitude: number;
  longitude: number;
};

const MY_LOCATION_COLOR = "#4CD9A0";
export const PICKER_COLOR = "#4CD9A0";

export function ClickCapture({
  onClick,
}: {
  onClick: (coordinates: OverlayCoordinates) => void;
}) {
  const { map } = useMap();

  useEffect(() => {
    if (!map) return;
    const handler = (e: { lngLat: { lng: number; lat: number } }) => {
      onClick({ latitude: e.lngLat.lat, longitude: e.lngLat.lng });
    };
    map.on("click", handler);
    return () => {
      map.off("click", handler);
    };
  }, [map, onClick]);

  return null;
}

export function FlyToTarget({ target }: { target: OverlayCoordinates }) {
  const { map, isLoaded } = useMap();

  useEffect(() => {
    if (!map || !isLoaded) return;
    map.flyTo({
      center: [target.longitude, target.latitude],
      zoom: 15,
      duration: 1200,
    });
  }, [map, isLoaded, target]);

  return null;
}

export function MyLocationPin() {
  return (
    <div className="relative flex h-6 w-6 items-center justify-center">
      <span className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-30 ring-2 ring-[#4CD9A0]" />
      <span
        className="relative h-4 w-4 rounded-full ring-2 ring-white"
        style={{ backgroundColor: MY_LOCATION_COLOR }}
      />
    </div>
  );
}

export function BusinessPin({ business }: { business: Business }) {
  const openStatus = useOpenStatus(
    business.scheduleDays,
    business.scheduleHours,
  );
  const borderClass =
    openStatus === true ? "border-green-400" : "border-gray-300";

  return (
    <div className="relative">
      <Avatar
        size="default"
        className={cn("border-2 bg-red-50", borderClass)}
      >
        {business.photoUrl && (
          <AvatarImage src={business.photoUrl} alt={business.name} />
        )}
        <AvatarFallback>
          <Store className="size-4" />
        </AvatarFallback>
      </Avatar>
    </div>
  );
}