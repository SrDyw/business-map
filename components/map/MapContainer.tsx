"use client";

import { useEffect, useState } from "react";

import {
  Map,
  MapMarker,
  MapRoute,
  MarkerContent,
  MarkerLabel,
  MarkerPopup,
} from "@/components/ui/map";
import {
  BusinessPin,
  ClickCapture,
  FlyToTarget,
  MyLocationPin,
  PICKER_COLOR,
  type OverlayCoordinates,
} from "@/components/map/MapOverlays";
import { BusinessPopup } from "@/components/map/BusinessPopup";
import { RouteInfoCard } from "@/components/map/RouteInfoCard";
import type { Business } from "@/types";
import { calculateDistanceKm } from "@/lib/geo";
import { getRoute, type Route, type RouteProfile } from "@/lib/routing";

const HAVANA_CENTER: [number, number] = [-82.3635, 23.1395];
const INITIAL_ZOOM = 12;

export type Coordinates = OverlayCoordinates;

export type MapContainerProps = {
  businesses?: Business[];
  pickerCoordinates?: Coordinates | null;
  myLocation?: Coordinates | null;
  focusCoordinates?: Coordinates | null;
  selectedBusinessId?: string | null;
  onClickCoordinates?: (coordinates: Coordinates) => void;
  onRouteChange?: (hasRoute: boolean) => void;
};

const ROUTE_COLOR = "#4CD9A0";

export function MapContainer({
  businesses = [],
  pickerCoordinates = null,
  myLocation = null,
  focusCoordinates = null,
  selectedBusinessId = null,
  onClickCoordinates,
  onRouteChange,
}: MapContainerProps) {
  const [route, setRoute] = useState<Route | null>(null);
  const [routeBusinessId, setRouteBusinessId] = useState<string | null>(null);
  const [routeDestination, setRouteDestination] = useState<Business | null>(
    null,
  );
  const [vehicle, setVehicle] = useState<RouteProfile>("driving");
  const [isRouting, setIsRouting] = useState(false);
  const [routeError, setRouteError] = useState<string | null>(null);

  useEffect(() => {
    onRouteChange?.(route !== null);
  }, [route, onRouteChange]);

  async function navigateTo(
    business: Business,
    nextVehicle: RouteProfile = vehicle,
  ) {
    if (!myLocation) return;
    setIsRouting(true);
    setRouteError(null);
    setRouteBusinessId(business.id);
    setRouteDestination(business);
    try {
      const result = await getRoute(myLocation, business, nextVehicle);
      setRoute(result);
    } catch {
      setRoute(null);
      setRouteError("Could not calculate a route");
    } finally {
      setIsRouting(false);
    }
  }

  function handleVehicleChange(nextVehicle: RouteProfile) {
    setVehicle(nextVehicle);
    if (routeDestination && myLocation) {
      navigateTo(routeDestination, nextVehicle);
    }
  }

  function clearRoute() {
    setRoute(null);
    setRouteBusinessId(null);
    setRouteDestination(null);
    setRouteError(null);
  }

  return (
    <div className="relative h-full w-full">
      <Map center={HAVANA_CENTER} zoom={INITIAL_ZOOM}>
        {onClickCoordinates && <ClickCapture onClick={onClickCoordinates} />}
        {focusCoordinates && <FlyToTarget target={focusCoordinates} />}
        {route && (
          <MapRoute
            coordinates={route.coordinates}
            color={ROUTE_COLOR}
            width={4}
          />
        )}
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
                <MarkerLabel className="font-bold">
                  {business.name}
                </MarkerLabel>
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
                  onNavigate={() => navigateTo(business)}
                />
              </MarkerPopup>
            </MapMarker>
          );
        })}
      </Map>

      {route && routeDestination && (
        <RouteInfoCard
          destination={routeDestination}
          distanceMeters={route.distanceMeters}
          durationSeconds={route.durationSeconds}
          vehicle={vehicle}
          onVehicleChange={handleVehicleChange}
          onClose={clearRoute}
          isRecalculating={isRouting}
        />
      )}
    </div>
  );
}