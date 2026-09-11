"use client";

import { MapMarker, MarkerContent, MarkerLabel } from "@/components/ui/map";
import {
  MyLocationPin,
  PICKER_COLOR,
  type OverlayCoordinates,
} from "@/components/map/MapOverlays";

export function UserLocationMarker({ location }: { location: OverlayCoordinates }) {
  return (
    <MapMarker longitude={location.longitude} latitude={location.latitude}>
      <MarkerContent>
        <MyLocationPin />
      </MarkerContent>
      <MarkerLabel>Your location</MarkerLabel>
    </MapMarker>
  );
}

export function PickerMarker({ coordinates }: { coordinates: OverlayCoordinates }) {
  return (
    <MapMarker
      longitude={coordinates.longitude}
      latitude={coordinates.latitude}
    >
      <MarkerContent>
        <div
          className="h-6 w-6 rounded-full border-2 border-white shadow-lg ring-2 ring-[#4CD9A0]/60 ring-offset-1"
          style={{ backgroundColor: PICKER_COLOR }}
        />
      </MarkerContent>
      <MarkerLabel>Selected location</MarkerLabel>
    </MapMarker>
  );
}