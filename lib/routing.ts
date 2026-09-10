type Coordinates = {
  latitude: number;
  longitude: number;
};

export type RouteProfile = "driving" | "cycling" | "walking";

export const ROUTE_PROFILES: RouteProfile[] = ["driving", "cycling", "walking"];

export const ROUTE_PROFILE_LABELS: Record<RouteProfile, string> = {
  driving: "Automóvil",
  cycling: "Bicicleta",
  walking: "A pie",
};

export type Route = {
  coordinates: [number, number][];
  distanceMeters: number;
  durationSeconds: number;
};

type OsrmResponse = {
  routes?: {
    distance: number;
    duration: number;
    geometry: { coordinates: number[][] };
  }[];
};

const OSRM_BASE_URL = "https://router.project-osrm.org/route/v1";

export async function getRoute(
  from: Coordinates,
  to: Coordinates,
  profile: RouteProfile = "driving",
): Promise<Route> {
  const url =
    `${OSRM_BASE_URL}/${profile}/` +
    `${from.longitude},${from.latitude};${to.longitude},${to.latitude}` +
    `?overview=full&geometries=geojson`;

  const response = await fetch(url);
  const data = (await response.json()) as OsrmResponse;

  const route = data.routes?.[0];
  if (!route) {
    throw new Error("No route found between the specified points");
  }

  return {
    coordinates: route.geometry.coordinates.map(
      ([lng, lat]) => [lng, lat] as [number, number],
    ),
    distanceMeters: route.distance,
    durationSeconds: route.duration,
  };
}

export function formatDistance(meters: number): string {
  if (meters < 1000) {
    return `${Math.round(meters)} meters`;
  }
  return `${(meters / 1000).toFixed(2)} km`;
}

export function formatDuration(seconds: number): string {
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) {
    return `${minutes} min`;
  }

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return `${hours}h ${remainingMinutes}m`;
}
