"use client";

import { useEffect, useState } from "react";

import { Map, MapRoute } from "@/components/ui/map";
import {
  ClickCapture,
  FlyToTarget,
  type OverlayCoordinates,
} from "@/components/map/MapOverlays";
import {
  BusinessMarkersLayer,
} from "@/components/map/BusinessMarkersLayer";
import {
  PickerMarker,
  UserLocationMarker,
} from "@/components/map/MapMarkers";
import { RouteInfoCard } from "@/components/map/RouteInfoCard";
import type { Business } from "@/types";
import { getRoute, type Route, type RouteProfile } from "@/lib/routing";

const HAVANA_CENTER: [number, number] = [-82.3635, 23.1395];
const INITIAL_ZOOM = 12;
const ROUTE_COLOR = "#4CD9A0";

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
        {myLocation && <UserLocationMarker location={myLocation} />}
        {pickerCoordinates && <PickerMarker coordinates={pickerCoordinates} />}
        <BusinessMarkersLayer
          businesses={businesses}
          myLocation={myLocation}
          selectedBusinessId={selectedBusinessId}
          routeBusinessId={routeBusinessId}
          route={route}
          isRouting={isRouting}
          routeError={routeError}
          onNavigate={navigateTo}
        />
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