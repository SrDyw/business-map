"use client";

import {
  MapMarker,
  MarkerContent,
  MarkerLabel,
  MarkerPopup,
} from "@/components/ui/map";
import { BusinessPopup } from "@/components/map/BusinessPopup";
import {
  BusinessPin,
  type OverlayCoordinates,
} from "@/components/map/MapOverlays";
import type { Business } from "@/types";
import { calculateDistanceKm } from "@/lib/geo";

export type ActiveRouteInfo = {
  distanceMeters: number | null;
  durationSeconds: number | null;
};

export type BusinessMarkersLayerProps = {
  businesses: Business[];
  myLocation: OverlayCoordinates | null;
  selectedBusinessId: string | null;
  routeBusinessId: string | null;
  route: { distanceMeters: number | null; durationSeconds: number | null } | null;
  isRouting: boolean;
  routeError: string | null;
  onNavigate: (business: Business) => void;
};

export function BusinessMarkersLayer({
  businesses,
  myLocation,
  selectedBusinessId,
  routeBusinessId,
  route,
  isRouting,
  routeError,
  onNavigate,
}: BusinessMarkersLayerProps) {
  return (
    <>
      {businesses.map((business) => {
        const distanceKm =
          myLocation !== null
            ? calculateDistanceKm(
                myLocation.latitude,
                myLocation.longitude,
                business.latitude,
                business.longitude,
              )
            : null;
        const activeRoute =
          routeBusinessId === business.id
            ? {
                distanceMeters: route?.distanceMeters ?? null,
                durationSeconds: route?.durationSeconds ?? null,
              }
            : null;
        const isCurrentRoute = routeBusinessId === business.id;

        return (
          <MapMarker
            key={business.id}
            longitude={business.longitude}
            latitude={business.latitude}
          >
            <MarkerContent>
              <BusinessPin business={business} />
              <MarkerLabel className="font-bold">{business.name}</MarkerLabel>
            </MarkerContent>
            <MarkerPopup
              closeButton
              open={selectedBusinessId === business.id}
              className="border-0 bg-transparent p-0 shadow-none"
            >
              <BusinessPopup
                business={business}
                distanceKm={distanceKm}
                activeRoute={activeRoute}
                isRouting={isRouting && isCurrentRoute}
                routeError={isCurrentRoute ? routeError : null}
                onNavigate={() => onNavigate(business)}
              />
            </MarkerPopup>
          </MapMarker>
        );
      })}
    </>
  );
}