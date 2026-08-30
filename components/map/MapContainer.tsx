"use client";

import { useEffect } from "react";
import {
  Map,
  MapControls,
  MapMarker,
  MarkerContent,
  MarkerLabel,
  MarkerPopup,
  useMap,
} from "@/components/ui/map";
import type { Business } from "@/types";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { calculateDistanceKm } from "@/lib/geo";
import { Clock, Navigation, Store } from "lucide-react";
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
  onClickCoordinates?: (coordinates: Coordinates) => void;
};

export function MapContainer({
  businesses = [],
  pickerCoordinates = null,
  myLocation = null,
  onClickCoordinates,
}: MapContainerProps) {
  return (
    <Map center={HAVANA_CENTER} zoom={INITIAL_ZOOM}>
      {onClickCoordinates && <ClickCapture onClick={onClickCoordinates} />}
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
              className="border-0 bg-transparent p-0 shadow-none"
            >
              <BusinessPopup business={business} distanceKm={distanceKm} />
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
  return (
    <div className="relative">
      <Avatar size="default" className={"border-2 border-white bg-red-50"}>
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
}: {
  business: Business;
  distanceKm: number | null;
}) {
  return (
    <Card size="sm" className="w-56">
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
      <CardContent>
        <BusinessDetailsDialog business={business} distanceKm={distanceKm} />
      </CardContent>
    </Card>
  );
}
