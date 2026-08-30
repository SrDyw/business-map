"use client";

import { useCallback, useEffect, useState } from "react";

type Coordinates = {
  latitude: number;
  longitude: number;
};

type GeoState = {
  location: Coordinates | null;
  isLoading: boolean;
  error: string | null;
  getLocation: () => void;
};

const TIMEOUT_MS = 30000;

export function useGeolocation(autoStart = false): GeoState {
  const [location, setLocation] = useState<Coordinates | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getLocation = useCallback(() => {
    if (!("geolocation" in navigator)) {
      setError("Your browser does not support geolocation");
      return;
    }

    setIsLoading(true);
    setError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
        setIsLoading(false);
      },
      (err) => {
        setError(geolocationErrorMessage(err.code));
        setIsLoading(false);
      },
      { enableHighAccuracy: true, timeout: TIMEOUT_MS, maximumAge: 0 },
    );
  }, []);

  useEffect(() => {
    if (!autoStart) return;
    const timer = setTimeout(() => getLocation(), 0);
    return () => clearTimeout(timer);
  }, [autoStart, getLocation]);

  return { location, isLoading, error, getLocation };
}

function geolocationErrorMessage(code: number): string {
  switch (code) {
    case 1:
      return "Location permission denied";
    case 2:
      return "Location unavailable";
    case 3:
      return "Location request timed out";
    default:
      return "Unknown error getting your location";
  }
}
