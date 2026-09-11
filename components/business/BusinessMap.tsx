"use client";

import { useState } from "react";

import { MapContainer, type Coordinates } from "@/components/map/MapContainer";
import { MapHeader } from "@/components/business/MapHeader";
import { RegisterFlow } from "@/components/business/RegisterFlow";
import { ProductSearch } from "@/components/search/ProductSearch";
import { useGeolocation } from "@/hooks/useGeolocation";
import { useTheme } from "@/hooks/useTheme";
import type { Business } from "@/types";

type BusinessMapProps = {
  initialBusinesses: Business[];
};

type Step = "picker" | "form";

export function BusinessMap({ initialBusinesses }: BusinessMapProps) {
  const [businesses, setBusinesses] = useState<Business[]>(initialBusinesses);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [step, setStep] = useState<Step>("picker");
  const [coordinates, setCoordinates] = useState<Coordinates | null>(null);
  const [focusCoordinates, setFocusCoordinates] = useState<Coordinates | null>(
    null,
  );
  const [selectedBusinessId, setSelectedBusinessId] = useState<string | null>(
    null,
  );
  const { location: myLocation } = useGeolocation(true);
  const [searchOpen, setSearchOpen] = useState(false);
  const [hasRoute, setHasRoute] = useState(false);
  const { theme } = useTheme();

  function focusProvider(
    providerCoordinates: Coordinates,
    businessId?: string,
  ) {
    setFocusCoordinates(providerCoordinates);
    setSelectedBusinessId(businessId ?? null);
  }

  function openForm() {
    setCoordinates(null);
    setStep("picker");
    setIsFormOpen(true);
  }

  function closeForm() {
    setIsFormOpen(false);
    setCoordinates(null);
    setStep("picker");
  }

  function selectCoordinates(newCoordinates: Coordinates) {
    setCoordinates(newCoordinates);
    setStep("form");
  }

  function backToPicker() {
    setCoordinates(null);
    setStep("picker");
  }

  function addBusiness(newBusiness: Business) {
    setBusinesses((prev) => [...prev, newBusiness]);
    closeForm();
  }

  return (
    <div className="relative h-full w-full">
      <MapContainer
        businesses={businesses}
        pickerCoordinates={step === "picker" ? coordinates : null}
        myLocation={myLocation}
        focusCoordinates={focusCoordinates}
        selectedBusinessId={selectedBusinessId}
        theme={theme}
        onClickCoordinates={step === "picker" ? selectCoordinates : undefined}
        onRouteChange={setHasRoute}
      />

      {!isFormOpen && (
        <MapHeader
          onOpenSearch={() => setSearchOpen(true)}
          onRegisterBusiness={openForm}
        />
      )}

      <ProductSearch
        open={searchOpen}
        onOpenChange={setSearchOpen}
        myLocation={myLocation}
        onSelect={focusProvider}
      />

      <RegisterFlow
        isFormOpen={isFormOpen}
        step={step}
        coordinates={coordinates}
        hasRoute={hasRoute}
        onOpen={openForm}
        onClose={closeForm}
        onSelectCoordinates={selectCoordinates}
        onChangeLocation={backToPicker}
        onBusinessCreated={addBusiness}
      />
    </div>
  );
}