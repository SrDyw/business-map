"use client";

import { useState } from "react";
import { Plus, X } from "lucide-react";

import { MapContainer, type Coordinates } from "@/components/map/MapContainer";
import { RegistrationForm } from "@/components/business/RegistrationForm";
import { Button } from "@/components/ui/button";
import { useGeolocation } from "@/hooks/useGeolocation";
import type { Business } from "@/types";
import { Alert } from "../systemui/alter";
import { ProductSearch } from "@/components/search/ProductSearch";

type BusinessMapProps = {
  initialBusinesses: Business[];
};

type Step = "picker" | "form";

export function BusinessMap({ initialBusinesses }: BusinessMapProps) {
  const [businesses, setBusinesses] = useState<Business[]>(initialBusinesses);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [step, setStep] = useState<Step>("picker");
  const [coordinates, setCoordinates] = useState<Coordinates | null>(null);
  const { location: myLocation } = useGeolocation(true);

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
        onClickCoordinates={step === "picker" ? selectCoordinates : undefined}
      />

      {!isFormOpen && <ProductSearch />}

      {!isFormOpen && (
        <Button
          className="absolute p-5 right-4 bottom-[calc(env(safe-area-inset-bottom)+1rem)] left-1/2 z-10 w-[calc(100%-2rem)] max-w-xs -translate-x-1/2 shadow-xl sm:right-auto sm:left-4 sm:w-auto sm:max-w-none sm:translate-x-0"
          onClick={openForm}
        >
          <Plus className="size-4" /> Register my business
        </Button>
      )}

      {isFormOpen && step === "picker" && (
        <div className="pointer-events-none absolute inset-0 z-20 flex items-start justify-center pt-16 sm:pt-24">
          <Alert
            title="¿Donde esta tu negocio?"
            description="Toca el punto en el mapa donde esta ubicado tu negocio"
            closeIcon={<X />}
            onClose={closeForm}
          />
        </div>
      )}

      {isFormOpen && step === "form" && coordinates && (
        <div className="absolute inset-0 z-20 flex items-end justify-center sm:items-center sm:p-4">
          <div className="relative w-full max-w-md max-h-[92%] overflow-y-auto rounded-t-2xl sm:rounded-2xl">
            <button
              type="button"
              onClick={closeForm}
              className="absolute top-3 right-3 z-10 rounded-md p-1.5 hover:bg-accent"
              aria-label="Close"
            >
              <X className="size-5" />
            </button>
            <RegistrationForm
              initialCoordinates={coordinates}
              onChangeLocation={backToPicker}
              onBusinessCreated={addBusiness}
            />
          </div>
        </div>
      )}
    </div>
  );
}
