"use client";

import { useEffect, useState } from "react";
import {
  Map,
  MapControls,
  MapMarker,
  MapRoute,
  MarkerContent,
  MarkerLabel,
  MarkerPopup,
  useMap,
} from "@/components/ui/map";
import type { Business } from "@/types";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Button } from "../ui/button";
import { calculateDistanceKm } from "@/lib/geo";
import { cn } from "@/lib/utils";
import { useOpenStatus } from "@/hooks/useOpenStatus";
import {
  getRoute,
  formatDuration,
  formatDistance as formatRouteDistance,
  type Route,
} from "@/lib/routing";
import { Clock, Loader2, Navigation, Store } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { BusinessDetailsDialog } from "@/components/business/BusinessDetailsDialog";

const HAVANA_CENTER: [number, number] = [-82.3635, 23.1395];
const INITIAL_ZOOM = 12;

const PICKER_COLOR = "#4CD9A0";
const MY_LOCATION_COLOR = "#4CD9A0";
export type Coordinates = {
  latitude: number;
  longitude: number;
};

type MapContainerProps = {
  businesses?: Business[];
  pickerCoordinates?: Coordinates | null;
  myLocation?: Coordinates | null;
  focusCoordinates?: Coordinates | null;
  selectedBusinessId?: string | null;
  onClickCoordinates?: (coordinates: Coordinates) => void;
};

const ROUTE_COLOR = "#4CD9A0";

export function MapContainer({
  businesses = [],
  pickerCoordinates = null,
  myLocation = null,
  focusCoordinates = null,
  selectedBusinessId = null,
  onClickCoordinates,
}: MapContainerProps) {
  const [route, setRoute] = useState<Route | null>(null);
  const [routeBusinessId, setRouteBusinessId] = useState<string | null>(null);
  const [isRouting, setIsRouting] = useState(false);
  const [routeError, setRouteError] = useState<string | null>(null);

  async function handleNavigate(business: Business) {
    if (!myLocation) return;
    setIsRouting(true);
    setRouteError(null);
    setRouteBusinessId(business.id);
    try {
      const result = await getRoute(myLocation, {
        latitude: business.latitude,
        longitude: business.longitude,
      });
      setRoute(result);
    } catch {
      setRoute(null);
      setRouteError("Could not calculate a route");
    } finally {
      setIsRouting(false);
    }
  }

  return (
    <Map center={HAVANA_CENTER} zoom={INITIAL_ZOOM}>
      {onClickCoordinates && <ClickCapture onClick={onClickCoordinates} />}
      {focusCoordinates && <FlyToTarget target={focusCoordinates} />}
      {route && <MapRoute coordinates={route.coordinates} color={ROUTE_COLOR} width={4} />}
      {myLocation && (
        <MapMarker
          longitude={myLocation.longitude}
          latitude={myLocation.latitude}
        >
          <MarkerContent>
            <MyLocationPin />
          </MarkerContent>
          <MarkerLabel>Your location</MarkerLabel>
        </MapMarker>
      )}
      {pickerCoordinates && (
        <MapMarker
          longitude={pickerCoordinates.longitude}
          latitude={pickerCoordinates.latitude}
        >
          <MarkerContent>
            <div
              className="h-6 w-6 rounded-full border-2 border-white shadow-lg ring-2 ring-[#4CD9A0]/60 ring-offset-1"
              style={{ backgroundColor: PICKER_COLOR }}
            />
          </MarkerContent>
          <MarkerLabel>Selected location</MarkerLabel>
        </MapMarker>
      )}
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
                isRouting={isRouting && routeBusinessId === business.id}
                routeError={
                  routeBusinessId === business.id ? routeError : null
                }
                onNavigate={() => handleNavigate(business)}
              />
            </MarkerPopup>
          </MapMarker>
        );
      })}
    </Map>
  );
}

function ClickCapture({
  onClick,
}: {
  onClick: (coordinates: Coordinates) => void;
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

function FlyToTarget({ target }: { target: Coordinates }) {
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

function MyLocationPin() {
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

function BusinessPin({ business }: { business: Business }) {
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

function formatDistance(km: number): string {
  if (km < 1) {
    return `${Math.round(km * 1000)} m`;
  }
  return `${km.toFixed(1)} km`;
}

function BusinessPopup({
  business,
  distanceKm,
  activeRoute,
  isRouting,
  routeError,
  onNavigate,
}: {
  business: Business;
  distanceKm: number | null;
  activeRoute: {
    distanceMeters: number | null;
    durationSeconds: number | null;
  } | null;
  isRouting: boolean;
  routeError: string | null;
  onNavigate: () => void;
}) {
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
          <CardTitle className="truncate">
            {business.name}
          </CardTitle>
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
